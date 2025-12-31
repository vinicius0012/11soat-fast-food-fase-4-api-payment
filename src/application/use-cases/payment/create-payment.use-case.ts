import { CreatePaymentDto } from 'src/application/domain/dtos/payment/payment.db.interface';
import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';

export class CreatePaymentUseCase {
  constructor(private readonly paymentService: PaymentServicePort) {}

  async execute(data: CreatePaymentDto) {
    try {
      if (!data.orderId) {
        throw AppError.badRequest({
          message: 'Order ID is required',
        });
      }

      if (!data.amount || data.amount <= 0) {
        throw AppError.badRequest({
          message: 'Valid amount is required',
        });
      }

      // Criar pagamento no serviço externo e salvar no MongoDB
      const payment = await this.paymentService.createPayment(data);

      return payment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal({
        message: 'Error creating payment',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
