import {
  CancelPaymentDto,
  CheckPaymentStatusDto,
  CreatePaymentDto,
  ExternalReferenceDto,
  PaymentDtoResponse,
  PaymentStatusResponse,
  UpdatePaymentStatus,
} from 'src/application/domain/dtos/payment/payment.db.interface';

export interface PaymentServicePort {
  createPayment(data: CreatePaymentDto): Promise<PaymentDtoResponse>;
  checkPaymentStatus(
    data: CheckPaymentStatusDto,
  ): Promise<PaymentStatusResponse>;
  cancelPayment(data: CancelPaymentDto): Promise<PaymentStatusResponse>;
  processPaymentCallback(payload: any): Promise<PaymentStatusResponse>;
  getExternalReference(
    transactionId: string,
  ): Promise<ExternalReferenceDto | null>;
  updateStatus(data: UpdatePaymentStatus): Promise<PaymentStatusResponse>;
}
