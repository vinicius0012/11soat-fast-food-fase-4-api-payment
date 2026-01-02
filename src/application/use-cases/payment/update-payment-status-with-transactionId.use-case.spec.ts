/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { UpdatePaymentStatusWithTransactionIdUseCase } from './update-payment-status-with-transactionId.use-case';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { AppError } from 'src/application/domain/errors/app.error';
import {
  PaymentStatus,
  PaymentExternalStatus,
} from 'src/application/domain/value-objects/payment/payment.status.enum';
import { mapToDomainPaymentStatus } from 'src/application/presenters/enum-mapper.util';

jest.mock('src/application/presenters/enum-mapper.util');

describe('UpdatePaymentStatusWithTransactionIdUseCase', () => {
  let useCase: UpdatePaymentStatusWithTransactionIdUseCase;
  let paymentService: jest.Mocked<PaymentServicePort>;

  beforeEach(() => {
    paymentService = {
      checkPaymentStatus: jest.fn(),
      updateStatus: jest.fn(),
      createPayment: jest.fn(),
      cancelPayment: jest.fn(),
      getExternalReference: jest.fn(),
      processPaymentCallback: jest.fn(),
    } as unknown as jest.Mocked<PaymentServicePort>;

    useCase = new UpdatePaymentStatusWithTransactionIdUseCase(paymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should throw AppError.badRequest when transactionId is not provided', async () => {
      await expect(useCase.execute('')).rejects.toThrow(AppError);
      await expect(useCase.execute('')).rejects.toMatchObject({
        errorType: 'BadRequestError',
        message: 'Transaction ID is required',
      });
    });

    it('should successfully update payment status', async () => {
      const transactionId = 'transaction-123';
      const payment = {
        id: 'payment-id',
        transactionId,
        status: PaymentStatus.PAID,
        orderId: 123,
        amount: 100,
      };

      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PAID,
      } as any);
      (mapToDomainPaymentStatus as jest.Mock).mockReturnValue(
        PaymentStatus.PAID,
      );

      const result = await useCase.execute(transactionId);

      expect(result).toEqual({
        transactionId,
        status: PaymentStatus.PAID,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.checkPaymentStatus).toHaveBeenCalledWith({
        transactionId,
      });
      expect(mapToDomainPaymentStatus).toHaveBeenCalledWith(PaymentStatus.PAID);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.updateStatus).toHaveBeenCalledWith({
        transactionId,
        status: PaymentStatus.PAID,
      });
    });

    it('should map external status correctly before updating', async () => {
      const transactionId = 'transaction-123';
      const payment = {
        id: 'payment-id',
        transactionId,
        status: PaymentExternalStatus.APPROVED,
        orderId: 123,
        amount: 100,
      };

      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PAID,
      } as any);
      (mapToDomainPaymentStatus as jest.Mock).mockReturnValue(
        PaymentStatus.PAID,
      );

      const result = await useCase.execute(transactionId);

      expect(result).toEqual({
        transactionId,
        status: PaymentExternalStatus.APPROVED,
      });
      expect(mapToDomainPaymentStatus).toHaveBeenCalledWith(
        PaymentExternalStatus.APPROVED,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.updateStatus).toHaveBeenCalledWith({
        transactionId,
        status: PaymentStatus.PAID,
      });
    });

    it('should handle different payment statuses', async () => {
      const transactionId = 'transaction-123';
      const payment = {
        id: 'payment-id',
        transactionId,
        status: PaymentStatus.PENDING,
        orderId: 123,
        amount: 100,
      };

      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PENDING,
      } as any);
      (mapToDomainPaymentStatus as jest.Mock).mockReturnValue(
        PaymentStatus.PENDING,
      );

      const result = await useCase.execute(transactionId);

      expect(result).toEqual({
        transactionId,
        status: PaymentStatus.PENDING,
      });
    });

    it('should throw AppError.internal when an unexpected error occurs', async () => {
      paymentService.checkPaymentStatus.mockRejectedValue(
        new Error('Provider service unavailable'),
      );

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        AppError,
      );
      await expect(useCase.execute('transaction-123')).rejects.toMatchObject({
        errorType: 'InternalServerError',
        message: 'Error updating payment status',
        details: 'Provider service unavailable',
      });
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const appError = AppError.notFound({ message: 'Payment not found' });
      paymentService.checkPaymentStatus.mockRejectedValue(appError);

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        appError,
      );
    });
  });
});
