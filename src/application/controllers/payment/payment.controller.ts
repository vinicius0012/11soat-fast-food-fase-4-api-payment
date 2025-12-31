import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { CreatePaymentUseCase } from 'src/application/use-cases/payment/create-payment.use-case';
import { GetPaymentStatusUseCase } from 'src/application/use-cases/payment/get-payment-status.use-case';
import { UpdatePaymentStatusWithTransactionIdUseCase } from 'src/application/use-cases/payment/update-payment-status-with-transactionId.use-case';
import { CancelPaymentUseCase } from 'src/application/use-cases/payment/cancel-payment.use-case';
import { ProcessPaymentWebhookUseCase } from 'src/application/use-cases/payment/process-payment-webhook.use-case';
import { GetExternalReferenceByTransactionUseCase } from 'src/application/use-cases/payment/get-external-reference-by-transaction.use-cases';
import { PaymentPresenter } from 'src/application/presenters/payments/payments.presenter';
import { CreatePaymentDto } from 'src/application/domain/dtos/payment/payment.db.interface';

export class PaymentController {
  private createPaymentUseCase: CreatePaymentUseCase;
  private getPaymentStatusUseCase: GetPaymentStatusUseCase;
  private updatePaymentStatusWithTransactionIdUseCase: UpdatePaymentStatusWithTransactionIdUseCase;
  private cancelPaymentUseCase: CancelPaymentUseCase;
  private processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase;
  private getExternalReferenceByTransactionUseCase: GetExternalReferenceByTransactionUseCase;

  constructor(private readonly paymentService: PaymentServicePort) {
    this.createPaymentUseCase = new CreatePaymentUseCase(this.paymentService);

    this.getPaymentStatusUseCase = new GetPaymentStatusUseCase(
      this.paymentService,
    );

    this.updatePaymentStatusWithTransactionIdUseCase =
      new UpdatePaymentStatusWithTransactionIdUseCase(this.paymentService);

    this.cancelPaymentUseCase = new CancelPaymentUseCase(this.paymentService);

    this.processPaymentWebhookUseCase = new ProcessPaymentWebhookUseCase(
      this.paymentService,
    );

    this.getExternalReferenceByTransactionUseCase =
      new GetExternalReferenceByTransactionUseCase(this.paymentService);
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const payment = await this.createPaymentUseCase.execute(createPaymentDto);
    return PaymentPresenter.toHttp(payment);
  }

  async getPaymentStatus(transactionId: string) {
    const result = await this.getPaymentStatusUseCase.execute(transactionId);
    return result;
  }

  async updatePaymentStatus(transactionId: string) {
    const result =
      await this.updatePaymentStatusWithTransactionIdUseCase.execute(
        transactionId,
      );
    return {
      message: 'Pagamento atualizado com sucesso',
      result,
    };
  }

  async cancelPayment(transactionId: string, reason?: string) {
    await this.cancelPaymentUseCase.execute(transactionId, reason);
    return { message: 'Pagamento cancelado com sucesso' };
  }

  async processWebhook(payload: any) {
    const result = await this.processPaymentWebhookUseCase.execute(payload);
    return {
      message: 'Webhook processado com sucesso',
      result,
    };
  }

  async getExternalReference(transactionId: string) {
    const result =
      await this.getExternalReferenceByTransactionUseCase.execute(
        transactionId,
      );
    return result;
  }
}
