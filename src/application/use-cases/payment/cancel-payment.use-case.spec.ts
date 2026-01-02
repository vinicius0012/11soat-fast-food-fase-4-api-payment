/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CancelPaymentUseCase } from './cancel-payment.use-case';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';

describe('CancelPaymentUseCase', () => {
  let useCase: CancelPaymentUseCase;
  let paymentService: jest.Mocked<PaymentServicePort>;

  beforeEach(() => {
    paymentService = {
      checkPaymentStatus: jest.fn(),
      cancelPayment: jest.fn(),
      updateStatus: jest.fn(),
      createPayment: jest.fn(),
      getExternalReference: jest.fn(),
      processPaymentCallback: jest.fn(),
    } as unknown as jest.Mocked<PaymentServicePort>;

    useCase = new CancelPaymentUseCase(paymentService);
  });

  describe('execute', () => {
    it('should throw AppError.badRequest when transactionId is not provided', async () => {
      await expect(useCase.execute('')).rejects.toThrow(AppError);
      await expect(useCase.execute('')).rejects.toMatchObject({
        errorType: 'BadRequestError',
      });
    });

    it('should throw AppError.notFound when payment is not found', async () => {
      paymentService.checkPaymentStatus.mockResolvedValue(null as any);

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        AppError,
      );
      await expect(useCase.execute('transaction-123')).rejects.toMatchObject({
        errorType: 'NotFoundError',
      });
    });

    it('should throw AppError.badRequest when payment cannot be canceled in its current state', async () => {
      const payment = {
        transactionId: 'transaction-123',
        status: PaymentStatus.CANCELED,
      };
      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        AppError,
      );
      await expect(useCase.execute('transaction-123')).rejects.toMatchObject({
        errorType: 'BadRequestError',
        message: expect.stringContaining('cannot be canceled') as string,
      });
    });

    it('should successfully cancel a pending payment', async () => {
      const transactionId = 'transaction-123';
      const payment = {
        transactionId,
        status: PaymentStatus.PENDING,
      };
      const cancelResult = { success: true };

      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      paymentService.cancelPayment.mockResolvedValue(cancelResult as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.CANCELED,
      } as any);

      const result = await useCase.execute(transactionId, 'Customer request');

      expect(result).toEqual(cancelResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.checkPaymentStatus).toHaveBeenCalledWith({
        transactionId,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.cancelPayment).toHaveBeenCalledWith({
        transactionId,
        reason: 'Customer request',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.updateStatus).toHaveBeenCalledWith({
        transactionId,
        status: PaymentStatus.CANCELED,
      });
    });

    it('should successfully cancel a paid payment', async () => {
      const transactionId = 'transaction-123';
      const payment = {
        transactionId,
        status: PaymentStatus.PAID,
      };
      const cancelResult = { success: true };

      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      paymentService.cancelPayment.mockResolvedValue(cancelResult as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.CANCELED,
      } as any);

      const result = await useCase.execute(transactionId);

      expect(result).toEqual(cancelResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.cancelPayment).toHaveBeenCalledWith({
        transactionId,
        reason: undefined,
      });
    });

    it('should throw AppError.internal when an unexpected error occurs', async () => {
      paymentService.checkPaymentStatus.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        AppError,
      );
      await expect(useCase.execute('transaction-123')).rejects.toMatchObject({
        errorType: 'InternalServerError',
        details: 'Database error',
      });
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const appError = AppError.notFound({ message: 'Custom error' });
      paymentService.checkPaymentStatus.mockRejectedValue(appError);

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        appError,
      );
    });
  });
});
