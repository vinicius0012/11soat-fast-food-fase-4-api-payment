import {
  CreatePaymentDto,
  PaymentDtoResponse,
} from 'src/application/domain/dtos/payment/payment.db.interface';

export interface PaymentUseCases {
  createPayment(data: CreatePaymentDto): Promise<PaymentDtoResponse>;
  getPaymentStatus(transactionId: string): Promise<PaymentDtoResponse>;
  cancelPayment(transactionId: string): Promise<void>;
  updateStatusWithTransactionId(transactionId: string): Promise<void>;
  getOrderIdByTransaction(transactionId: string): Promise<number>;
}
