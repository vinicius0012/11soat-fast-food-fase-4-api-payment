import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';

export class ProcessPaymentWebhookUseCase {
  constructor(private readonly paymentService: PaymentServicePort) {}

  async execute(payload: any) {
    try {
      // Processar o callback do provedor de pagamento
      const paymentStatus =
        await this.paymentService.processPaymentCallback(payload);

      // Buscar o pedido associado a esta transação
      const payment = await this.paymentService.checkPaymentStatus({
        transactionId: paymentStatus.transactionId,
      });

      if (!payment) {
        throw AppError.notFound({
          message: 'Order not found for this transaction ID',
        });
      }

      // Atualizar o status do pedido de acordo com o status do pagamento
      if (paymentStatus.status !== payment.status) {
        await this.paymentService.updateStatus({
          transactionId: payment.transactionId,
          status: paymentStatus.status,
        });
      }

      return {
        transactionId: payment.transactionId,
        status: paymentStatus.status,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal({
        message: 'Error processing payment webhook',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
