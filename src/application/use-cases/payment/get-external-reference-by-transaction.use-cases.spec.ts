/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { GetExternalReferenceByTransactionUseCase } from './get-external-reference-by-transaction.use-cases';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { AppError } from 'src/application/domain/errors/app.error';

describe('GetExternalReferenceByTransactionUseCase', () => {
  let useCase: GetExternalReferenceByTransactionUseCase;
  let paymentService: jest.Mocked<PaymentServicePort>;

  beforeEach(() => {
    paymentService = {
      getExternalReference: jest.fn(),
      checkPaymentStatus: jest.fn(),
      createPayment: jest.fn(),
      cancelPayment: jest.fn(),
      updateStatus: jest.fn(),
      processPaymentCallback: jest.fn(),
    } as unknown as jest.Mocked<PaymentServicePort>;

    useCase = new GetExternalReferenceByTransactionUseCase(paymentService);
  });

  describe('execute', () => {
    it('should throw AppError.badRequest when transactionId is not provided', async () => {
      await expect(useCase.execute('')).rejects.toThrow(AppError);
      await expect(useCase.execute('')).rejects.toMatchObject({
        errorType: 'BadRequestError',
        message: 'Transaction ID is required',
      });
    });

    it('should throw AppError.notFound when external reference is not found', async () => {
      paymentService.getExternalReference.mockResolvedValue(null as any);

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        AppError,
      );
      await expect(useCase.execute('transaction-123')).rejects.toMatchObject({
        errorType: 'NotFoundError',
        message: expect.stringContaining('Order ID not found') as string,
      });
    });

    it('should throw AppError.notFound when orderId is not present in external reference', async () => {
      paymentService.getExternalReference.mockResolvedValue({
        transactionId: 'transaction-123',
      } as any);

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        AppError,
      );
      await expect(useCase.execute('transaction-123')).rejects.toMatchObject({
        errorType: 'NotFoundError',
      });
    });

    it('should successfully return orderId for a valid transactionId', async () => {
      const transactionId = 'transaction-123';
      const orderId = 456;
      const externalReference = { orderId };

      paymentService.getExternalReference.mockResolvedValue(
        externalReference as any,
      );

      const result = await useCase.execute(transactionId);

      expect(result).toBe(orderId);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.getExternalReference).toHaveBeenCalledWith(
        transactionId,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.getExternalReference).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError.internal when an unexpected error occurs', async () => {
      paymentService.getExternalReference.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        AppError,
      );
      await expect(useCase.execute('transaction-123')).rejects.toMatchObject({
        errorType: 'InternalServerError',
        message: 'Error getting external reference',
        details: 'Database connection failed',
      });
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const appError = AppError.unauthorized({
        message: 'Unauthorized access',
      });
      paymentService.getExternalReference.mockRejectedValue(appError);

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        appError,
      );
    });
  });
});
