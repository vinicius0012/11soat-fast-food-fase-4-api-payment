/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CreatePaymentUseCase } from './create-payment.use-case';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { AppError } from 'src/application/domain/errors/app.error';
import { CreatePaymentDto } from 'src/application/domain/dtos/payment/payment.db.interface';
import { PaymentStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let paymentService: jest.Mocked<PaymentServicePort>;

  beforeEach(() => {
    paymentService = {
      createPayment: jest.fn(),
      checkPaymentStatus: jest.fn(),
      cancelPayment: jest.fn(),
      updateStatus: jest.fn(),
      getExternalReference: jest.fn(),
      processPaymentCallback: jest.fn(),
    } as unknown as jest.Mocked<PaymentServicePort>;

    useCase = new CreatePaymentUseCase(paymentService);
  });

  describe('execute', () => {
    it('should throw AppError.badRequest when orderId is not provided', async () => {
      const data = {
        amount: 100,
      } as CreatePaymentDto;

      await expect(useCase.execute(data)).rejects.toThrow(AppError);
      await expect(useCase.execute(data)).rejects.toMatchObject({
        errorType: 'BadRequestError',
        message: 'Order ID is required',
      });
    });

    it('should throw AppError.badRequest when amount is not provided', async () => {
      const data = {
        orderId: 123,
      } as CreatePaymentDto;

      await expect(useCase.execute(data)).rejects.toThrow(AppError);
      await expect(useCase.execute(data)).rejects.toMatchObject({
        errorType: 'BadRequestError',
        message: 'Valid amount is required',
      });
    });

    it('should throw AppError.badRequest when amount is zero or negative', async () => {
      const data = {
        orderId: 123,
        amount: 0,
      } as CreatePaymentDto;

      await expect(useCase.execute(data)).rejects.toThrow(AppError);

      const dataWithNegative = {
        orderId: 123,
        amount: -50,
      } as CreatePaymentDto;

      await expect(useCase.execute(dataWithNegative)).rejects.toThrow(AppError);
    });

    it('should successfully create a payment', async () => {
      const data: CreatePaymentDto = {
        orderId: 123,
        amount: 100,
        items: [],
        client: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678900',
        },
      };

      const expectedPayment = {
        id: 'payment-id',
        orderId: 123,
        amount: 100,
        status: PaymentStatus.PENDING,
        transactionId: 'transaction-123',
        qrCode: 'qr-code-data',
      };

      paymentService.createPayment.mockResolvedValue(expectedPayment as any);

      const result = await useCase.execute(data);

      expect(result).toEqual(expectedPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.createPayment).toHaveBeenCalledWith(data);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.createPayment).toHaveBeenCalledTimes(1);
    });

    it('should throw AppError.internal when an unexpected error occurs', async () => {
      const data: CreatePaymentDto = {
        orderId: 123,
        amount: 100,
        items: [],
        client: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678900',
        },
      };

      paymentService.createPayment.mockRejectedValue(
        new Error('External service error'),
      );

      await expect(useCase.execute(data)).rejects.toThrow(AppError);
      await expect(useCase.execute(data)).rejects.toMatchObject({
        errorType: 'InternalServerError',
        message: 'Error creating payment',
        details: 'External service error',
      });
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const data: CreatePaymentDto = {
        orderId: 123,
        amount: 100,
        items: [],
        client: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678900',
        },
      };

      const appError = AppError.conflict({
        message: 'Payment already exists',
      });
      paymentService.createPayment.mockRejectedValue(appError);

      await expect(useCase.execute(data)).rejects.toThrow(appError);
    });
  });
});
