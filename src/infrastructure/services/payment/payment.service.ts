import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppError } from 'src/application/domain/errors/app.error';
import axios from 'axios';
import {
  CancelPaymentDto,
  CheckPaymentStatusDto,
  ExternalReferenceDto,
  PaymentDtoResponse,
  PaymentExternalResponseDataInterface,
  PaymentStatusResponse,
  UpdatePaymentStatus,
} from 'src/application/domain/dtos/payment/payment.db.interface';
import { generatePaymentUUID } from 'src/infrastructure/shared/utils/payment.util';
import { PaymentMapper } from 'src/application/presenters/payments/payment.mapper';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { CreatePaymentDto } from 'src/modules/payment/dto/create-payment.dto';

@Injectable()
export class PaymentServiceImpl implements PaymentServicePort {
  private readonly apiBaseUrl: string;
  private readonly paymentAccessToken: string;
  private readonly webhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiBaseUrl =
      this.configService.get<string>('paymentServiceBaseUrl') ?? '';
    this.paymentAccessToken =
      this.configService.get<string>('paymentAccessToken') ?? '';
    this.webhookUrl = this.configService.get<string>('webhookUrl') ?? '';

    if (!this.apiBaseUrl) {
      throw new Error('URL base do Mercado Pago não configurada');
    }
    if (!this.paymentAccessToken) {
      throw new Error('Token de acesso do Mercado Pago não configurado');
    }

    if (!this.paymentAccessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN is not configured');
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
          message: 'Error generating payment',
          details: response.data,
        });
      }

      return PaymentMapper.toDomain(
        response.data as PaymentExternalResponseDataInterface,
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Failed to generate payment',
        details: axios.isAxiosError(error)
          ? error.response?.data
          : error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentDtoResponse> {
    try {
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
          message: 'Error getting payment status',
          details: response.data,
        });
      }

      return PaymentMapper.toDomain(
        response.data as PaymentExternalResponseDataInterface,
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Failed to get payment status',
        details: axios.isAxiosError(error)
          ? error.response?.data
          : error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  async getExternalReference(
    transactionId: string,
  ): Promise<ExternalReferenceDto | null> {
    try {
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
          message: 'Error getting payment status',
          details: response.data,
        });
      }

      const data = response.data as { external_reference?: string };

      if (!data.external_reference) {
        throw AppError.internal({
          message: 'external_reference is invalid or not found in payment',
        });
      }

      const orderId = parseInt(data.external_reference);
      if (isNaN(orderId)) {
        throw AppError.internal({
          message: 'external_reference is not a valid order ID',
        });
      }

      return { orderId, transactionId };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Failed to get payment status with external reference',
        details: axios.isAxiosError(error)
          ? error.response?.data
          : error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  async cancelPayment({
    transactionId,
  }: CancelPaymentDto): Promise<PaymentStatusResponse> {
    try {
      const response = await axios.put(
        `${this.apiBaseUrl}/payments/${transactionId}`,
        { status: 'cancelled' },
        {
          headers: {
            Authorization: `Bearer ${this.paymentAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status !== 200) {
        throw AppError.internal({
          message: 'Error cancelling payment',
          details: response.data,
        });
      }

      return response.data as PaymentStatusResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Failed to cancel payment',
        details: axios.isAxiosError(error)
          ? error.response?.data
          : error instanceof Error
            ? error.message
            : String(error),
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
          message: 'Error processing payment callback',
          details: response.data,
        });
      }

      return response.data as PaymentStatusResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Failed to process payment callback',
        details: axios.isAxiosError(error)
          ? error.response?.data
          : error instanceof Error
            ? error.message
            : String(error),
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
          message: 'Error checking payment status',
          details: response.data,
        });
      }

      return response.data as PaymentStatusResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Failed to check payment status',
        details: axios.isAxiosError(error)
          ? error.response?.data
          : error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  async updateStatus(
    data: UpdatePaymentStatus,
  ): Promise<PaymentStatusResponse> {
    try {
      const response = await axios.put(
        `${this.apiBaseUrl}/payments/${data.transactionId}`,
        { status: data.status },
      );

      if (response.status !== 200) {
        throw AppError.internal({
          message: 'Error updating payment status',
          details: response.data,
        });
      }

      return response.data as PaymentStatusResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw AppError.internal({
        message: 'Failed to update payment status',
        details: axios.isAxiosError(error)
          ? error.response?.data
          : error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }
}
