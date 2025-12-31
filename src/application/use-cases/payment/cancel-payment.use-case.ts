import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';

export class CancelPaymentUseCase {
  constructor(private readonly paymentService: PaymentServicePort) {}

  async execute(transactionId: string, reason?: string) {
    try {
      if (!transactionId) {
        throw AppError.badRequest({
          message: 'Transaction ID is required',
        });
      }

      // Buscar o pedido relacionado a esta transação
      const payment = await this.paymentService.checkPaymentStatus({
        transactionId,
      });

      if (!payment) {
        throw AppError.notFound({
          message: 'Payment not found for this transaction ID',
        });
      }

      if (
        payment.status !== PaymentStatus.PENDING &&
        payment.status !== PaymentStatus.PAID
      ) {
        throw AppError.badRequest({
          message: 'Payment cannot be canceled in its current state',
        });
      }

      const result = await this.paymentService.cancelPayment({
        transactionId,
        reason,
      });

      await this.paymentService.updateStatus({
        transactionId,
        status: PaymentStatus.CANCELED,
      });

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal({
        message: 'Error cancelling payment',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
