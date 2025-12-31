import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { PaymentPresenter } from 'src/application/presenters/payments/payments.presenter';

export class GetPaymentStatusUseCase {
  constructor(private readonly paymentService: PaymentServicePort) {}

  async execute(transactionId: string) {
    try {
      if (!transactionId) {
        throw AppError.badRequest({
          message: 'Transaction ID is required',
        });
      }

      const payment = await this.paymentService.checkPaymentStatus({
        transactionId,
      });

      return PaymentPresenter.toHttpStatusPayment(payment);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal({
        message: 'Error getting payment status',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
