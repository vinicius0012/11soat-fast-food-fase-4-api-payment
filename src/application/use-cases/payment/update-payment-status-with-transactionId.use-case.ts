import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentExternalStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { mapToDomainPaymentStatus } from 'src/application/presenters/enum-mapper.util';

export class UpdatePaymentStatusWithTransactionIdUseCase {
  constructor(private readonly paymentService: PaymentServicePort) {}

  async execute(transactionId: string) {
    try {
      if (!transactionId) {
        throw AppError.badRequest({
          message: 'Transaction ID is required',
        });
      }

      // Verificar o status atual do pagamento junto ao provedor
      const paymentStatus = await this.paymentService.checkPaymentStatus({
        transactionId,
      });

      await this.paymentService.updateStatus({
        transactionId,
        status: mapToDomainPaymentStatus(
          paymentStatus.status as any as PaymentExternalStatus,
        ),
      });

      return {
        transactionId,
        status: paymentStatus.status,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal({
        message: 'Error updating payment status',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
