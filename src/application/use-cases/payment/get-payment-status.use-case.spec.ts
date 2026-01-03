/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { GetPaymentStatusUseCase } from './get-payment-status.use-case';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';
import { PaymentPresenter } from 'src/application/presenters/payments/payments.presenter';

jest.mock('src/application/presenters/payments/payments.presenter');

describe('GetPaymentStatusUseCase', () => {
  let useCase: GetPaymentStatusUseCase;
  let paymentService: jest.Mocked<PaymentServicePort>;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = {
      checkPaymentStatus: jest.fn(),
      createPayment: jest.fn(),
      cancelPayment: jest.fn(),
      updateStatus: jest.fn(),
      getExternalReference: jest.fn(),
      processPaymentCallback: jest.fn(),
    } as unknown as jest.Mocked<PaymentServicePort>;

    useCase = new GetPaymentStatusUseCase(paymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it('should throw AppError.badRequest when transactionId is not provided', async () => {
      await expect(useCase.execute('')).rejects.toThrow(AppError);
      await expect(useCase.execute('')).rejects.toMatchObject({
        errorType: 'BadRequestError',
        message: 'Transaction ID is required',
      });
    });

    it('should successfully get payment status and transform it using presenter', async () => {
      const transactionId = 'transaction-123';
      const payment = {
        id: 'payment-id',
        orderId: 123,
        transactionId,
        status: PaymentStatus.PAID,
        amount: 100,
        qrCode: 'qr-code-data',
      };

      const presentedPayment = {
        transactionId,
        status: 'PAID',
        orderId: 123,
      };

      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      (PaymentPresenter.toHttpStatusPayment as jest.Mock).mockReturnValue(
        presentedPayment,
      );

      const result = await useCase.execute(transactionId);

      expect(result).toEqual(presentedPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.checkPaymentStatus).toHaveBeenCalledWith({
        transactionId,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(PaymentPresenter.toHttpStatusPayment).toHaveBeenCalledWith(
        payment,
      );
    });

    it('should throw AppError.internal when an unexpected error occurs', async () => {
      paymentService.checkPaymentStatus.mockRejectedValue(
        new Error('Service unavailable'),
      );

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        AppError,
      );
      await expect(useCase.execute('transaction-123')).rejects.toMatchObject({
        errorType: 'InternalServerError',
        message: 'Error getting payment status',
        details: 'Service unavailable',
      });
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const appError = AppError.notFound({ message: 'Payment not found' });
      paymentService.checkPaymentStatus.mockRejectedValue(appError);

      await expect(useCase.execute('transaction-123')).rejects.toThrow(
        appError,
      );
    });

    it('should handle presenter transformation correctly for different payment statuses', async () => {
      const transactionId = 'transaction-123';
      const payment = {
        id: 'payment-id',
        orderId: 123,
        transactionId,
        status: PaymentStatus.PENDING,
        amount: 100,
        qrCode: 'qr-code-data',
      };

      const presentedPayment = {
        transactionId,
        status: 'PENDING',
        orderId: 123,
      };

      paymentService.checkPaymentStatus.mockResolvedValue(payment as any);
      (PaymentPresenter.toHttpStatusPayment as jest.Mock).mockReturnValue(
        presentedPayment,
      );

      const result = await useCase.execute(transactionId);

      expect(result).toEqual(presentedPayment);
    });
  });
});
