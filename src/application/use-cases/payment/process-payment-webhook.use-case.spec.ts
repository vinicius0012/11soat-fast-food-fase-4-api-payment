/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ProcessPaymentWebhookUseCase } from './process-payment-webhook.use-case';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';

describe('ProcessPaymentWebhookUseCase', () => {
  let useCase: ProcessPaymentWebhookUseCase;
  let paymentService: jest.Mocked<PaymentServicePort>;

  beforeEach(() => {
    paymentService = {
      processPaymentCallback: jest.fn(),
      checkPaymentStatus: jest.fn(),
      updateStatus: jest.fn(),
      createPayment: jest.fn(),
      cancelPayment: jest.fn(),
      getExternalReference: jest.fn(),
    } as unknown as jest.Mocked<PaymentServicePort>;

    useCase = new ProcessPaymentWebhookUseCase(paymentService);
  });

  describe('execute', () => {
    it('should throw AppError.notFound when payment is not found for transactionId', async () => {
      const payload = { data: { id: 'payment-id' } };
      const paymentStatus = {
        transactionId: 'transaction-123',
        status: PaymentStatus.PAID,
      };

      paymentService.processPaymentCallback.mockResolvedValue(
        paymentStatus as any,
      );
      paymentService.checkPaymentStatus.mockResolvedValue(null as any);

      await expect(useCase.execute(payload)).rejects.toThrow(AppError);
      await expect(useCase.execute(payload)).rejects.toMatchObject({
        errorType: 'NotFoundError',
        message: expect.stringContaining('Order not found') as string,
      });
    });

    it('should update status when payment status has changed', async () => {
      const payload = { data: { id: 'payment-id' } };
      const transactionId = 'transaction-123';
      const paymentStatus = {
        transactionId,
        status: PaymentStatus.PAID,
      };
      const payment = {
        transactionId,
        status: PaymentStatus.PENDING,
        orderId: 123,
      };

      paymentService.processPaymentCallback.mockResolvedValue(
        paymentStatus as any,
      );
      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PAID,
      } as any);

      const result = await useCase.execute(payload);

      expect(result).toEqual({
        transactionId,
        status: PaymentStatus.PAID,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.updateStatus).toHaveBeenCalledWith({
        transactionId,
        status: PaymentStatus.PAID,
      });
    });

    it('should not update status when payment status has not changed', async () => {
      const payload = { data: { id: 'payment-id' } };
      const transactionId = 'transaction-123';
      const paymentStatus = {
        transactionId,
        status: PaymentStatus.PAID,
      };
      const payment = {
        transactionId,
        status: PaymentStatus.PAID,
        orderId: 123,
      };

      paymentService.processPaymentCallback.mockResolvedValue(
        paymentStatus as any,
      );
      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);

      const result = await useCase.execute(payload);

      expect(result).toEqual({
        transactionId,
        status: PaymentStatus.PAID,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.updateStatus).not.toHaveBeenCalled();
    });

    it('should successfully process webhook with status change', async () => {
      const payload = { action: 'payment.updated', data: { id: 'payment-id' } };
      const transactionId = 'transaction-123';
      const paymentStatus = {
        transactionId,
        status: PaymentStatus.PAID,
      };
      const payment = {
        transactionId,
        status: PaymentStatus.PENDING,
        orderId: 123,
      };

      paymentService.processPaymentCallback.mockResolvedValue(
        paymentStatus as any,
      );
      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PAID,
      } as any);

      const result = await useCase.execute(payload);

      expect(result).toEqual({
        transactionId,
        status: PaymentStatus.PAID,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.processPaymentCallback).toHaveBeenCalledWith(
        payload,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.checkPaymentStatus).toHaveBeenCalledWith({
        transactionId,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.updateStatus).toHaveBeenCalledWith({
        transactionId,
        status: PaymentStatus.PAID,
      });
    });

    it('should throw AppError.internal when an unexpected error occurs', async () => {
      const payload = { data: { id: 'payment-id' } };

      paymentService.processPaymentCallback.mockRejectedValue(
        new Error('Webhook processing error'),
      );

      await expect(useCase.execute(payload)).rejects.toThrow(AppError);
      await expect(useCase.execute(payload)).rejects.toMatchObject({
        errorType: 'InternalServerError',
        message: 'Error processing payment webhook',
        details: 'Webhook processing error',
      });
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const payload = { data: { id: 'payment-id' } };
      const appError = AppError.badRequest({ message: 'Invalid payload' });

      paymentService.processPaymentCallback.mockRejectedValue(appError);

      await expect(useCase.execute(payload)).rejects.toThrow(appError);
    });
  });
});
