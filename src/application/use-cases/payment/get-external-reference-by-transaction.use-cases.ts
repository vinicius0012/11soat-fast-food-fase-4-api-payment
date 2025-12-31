import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';

export class GetExternalReferenceByTransactionUseCase {
  constructor(private readonly paymentService: PaymentServicePort) {}

  async execute(transactionId: string): Promise<number> {
    try {
      if (!transactionId) {
        throw AppError.badRequest({
          message: 'Transaction ID is required',
        });
      }

      const externalReference =
        await this.paymentService.getExternalReference(transactionId);

      if (!externalReference || !externalReference.orderId) {
        throw AppError.notFound({
          message: 'Order ID not found for the given transaction ID',
        });
      }

      return externalReference.orderId;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal({
        message: 'Error getting external reference',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
