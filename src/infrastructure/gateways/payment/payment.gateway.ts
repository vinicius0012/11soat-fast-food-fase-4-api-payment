import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  CancelPaymentDto,
  CheckPaymentStatusDto,
  CreatePaymentDto,
  ExternalReferenceDto,
  PaymentDtoResponse,
  PaymentExternalResponseDataInterface,
  PaymentStatusResponse,
  UpdatePaymentStatus,
} from 'src/application/domain/dtos/payment/payment.db.interface';
import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { PaymentMapper } from 'src/application/presenters/payments/payment.mapper';
import { generatePaymentUUID } from 'src/infrastructure/shared/utils/payment.util';
import { PaymentRepository } from 'src/infrastructure/database/mongo/repositories/payment.repository';
import { handleErrorDescription } from 'src/infrastructure/shared/utils/error.handler.util';

@Injectable()
export class PaymentGateway implements PaymentServicePort {
  private readonly apiBaseUrl: string;
  private readonly paymentAccessToken: string;
  private readonly webhookUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentRepository: PaymentRepository,
  ) {
    this.apiBaseUrl =
      this.configService.get<string>('paymentServiceBaseUrl') ?? '';
    this.paymentAccessToken =
      this.configService.get<string>('paymentAccessToken') ?? '';
    this.webhookUrl = this.configService.get<string>('webhookUrl') ?? '';

    if (!this.apiBaseUrl) {
      throw new Error('URL base do serviço de pagamento não configurada');
    }

    if (!this.paymentAccessToken) {
      throw new Error(
        'Token de acesso do serviço de pagamento não configurado',
      );
    }
  }

  async createPayment(data: CreatePaymentDto): Promise<PaymentDtoResponse> {
    try {
      const payload = PaymentMapper.toExternalService(data, this.webhookUrl);

      const response = await axios.post(
        `${this.apiBaseUrl}/payments`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.paymentAccessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': generatePaymentUUID(),
          },
        },
      );

      if (response.status !== 201) {
        throw AppError.internal({
          message: 'Erro ao gerar pagamento',
          details: response.data,
        });
      }

      const paymentResponse = PaymentMapper.toDomain(
        response.data as PaymentExternalResponseDataInterface,
      );

      // Salvar no MongoDB
      await this.paymentRepository.create({
        transactionId: paymentResponse.transactionId,
        qrCodeBase64: paymentResponse.qrCodeBase64,
        qrCodeString: paymentResponse.qrCodeString,
        urlPayment: paymentResponse.urlPayment,
        amount: paymentResponse.amount,
        description: data.description,
        expirationDate: paymentResponse.expirationDate,
        client: data.client,
        status: paymentResponse.status,
        orderId: data.orderId ?? Number(paymentResponse.id.toString()),
        items: data.items ?? [],
        callbackUrl: data.callbackUrl as string,
      });

      return paymentResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Falha ao gerar pagamento',
        details: handleErrorDescription(error),
      });
    }
  }

  async checkPaymentStatus(
    data: CheckPaymentStatusDto,
  ): Promise<PaymentStatusResponse> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/payments/${data.transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.paymentAccessToken}`,
          },
        },
      );

      if (response.status !== 200) {
        throw AppError.internal({
          message: 'Erro ao verificar status do pagamento',
          details: response.data,
        });
      }

      const paymentStatus =
        response.data as PaymentExternalResponseDataInterface;

      await this.paymentRepository.updateStatus(
        data.transactionId,
        paymentStatus.status,
      );

      return PaymentMapper.toDomain(paymentStatus);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Falha ao verificar status do pagamento',
        details: handleErrorDescription(error),
      });
    }
  }

  async cancelPayment({
    transactionId,
    reason,
  }: CancelPaymentDto): Promise<PaymentStatusResponse> {
    try {
      const response = await axios.put(
        `${this.apiBaseUrl}/payments/${transactionId}`,
        { status: 'cancelled', ...(reason && { cancellation_reason: reason }) },
        {
          headers: {
            Authorization: `Bearer ${this.paymentAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status !== 200) {
        throw AppError.internal({
          message: 'Erro ao cancelar pagamento',
          details: response.data,
        });
      }

      // Atualizar status no MongoDB
      await this.paymentRepository.updateStatus(transactionId, 'cancelled');

      return response.data as PaymentStatusResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Falha ao cancelar pagamento',
        details: handleErrorDescription(error),
      });
    }
  }

  async processPaymentCallback(payload: any): Promise<PaymentStatusResponse> {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/notifications`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.paymentAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status !== 200) {
        throw AppError.internal({
          message: 'Erro ao processar callback de pagamento',
          details: response.data,
        });
      }

      const paymentStatus = response.data as PaymentStatusResponse;

      // Atualizar status no MongoDB
      if (paymentStatus.transactionId) {
        await this.paymentRepository.updateStatus(
          paymentStatus.transactionId,
          paymentStatus.status as string,
        );
      }

      return paymentStatus;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Falha ao processar callback de pagamento',
        details: handleErrorDescription(error),
      });
    }
  }

  async getExternalReference(
    transactionId: string,
  ): Promise<ExternalReferenceDto | null> {
    try {
      // Buscar primeiro no MongoDB
      const paymentInDb =
        await this.paymentRepository.findByTransactionId(transactionId);

      if (paymentInDb?.orderId) {
        return { orderId: paymentInDb.orderId, transactionId };
      }

      // Se não encontrar no MongoDB, buscar no serviço externo
      const response = await axios.get(
        `${this.apiBaseUrl}/payments/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.paymentAccessToken}`,
          },
        },
      );

      if (response.status !== 200) {
        throw AppError.internal({
          message: 'Erro ao obter referência externa',
          details: response.data,
        });
      }

      const data = response.data as { external_reference?: string };

      if (!data.external_reference) {
        throw AppError.internal({
          message: 'external_reference inválida ou não encontrada no pagamento',
        });
      }

      const orderId = Number.parseInt(data.external_reference);
      if (Number.isNaN(orderId)) {
        throw AppError.internal({
          message: 'external_reference não é um ID de pedido válido',
        });
      }

      return { orderId, transactionId };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Falha ao obter referência externa',
        details: handleErrorDescription(error),
      });
    }
  }

  async updateStatus(
    data: UpdatePaymentStatus,
  ): Promise<PaymentStatusResponse> {
    try {
      const result = await this.paymentRepository.updateStatus(
        data.transactionId,
        data.status as string,
      );
      return result as PaymentStatusResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Falha ao atualizar status do pagamento',
        details: handleErrorDescription(error),
      });
    }
  }
}
