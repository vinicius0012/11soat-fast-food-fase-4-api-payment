/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PaymentController } from './payment.controller';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { CreatePaymentDto } from 'src/application/domain/dtos/payment/payment.db.interface';
import { PaymentStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';
import { PaymentPresenter } from 'src/application/presenters/payments/payments.presenter';

jest.mock('src/application/presenters/payments/payments.presenter');

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: jest.Mocked<PaymentServicePort>;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = {
      createPayment: jest.fn(),
      checkPaymentStatus: jest.fn(),
      cancelPayment: jest.fn(),
      updateStatus: jest.fn(),
      getExternalReference: jest.fn(),
      processPaymentCallback: jest.fn(),
    } as unknown as jest.Mocked<PaymentServicePort>;

    controller = new PaymentController(paymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment and return transformed result', async () => {
      const createPaymentDto: CreatePaymentDto = {
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

      const payment = {
        id: 'payment-id',
        orderId: 123,
        amount: 100,
        status: PaymentStatus.PENDING,
        transactionId: 'transaction-123',
        qrCode: 'qr-code-data',
      };

      const presentedPayment = {
        id: 'payment-id',
        orderId: 123,
        transactionId: 'transaction-123',
        status: 'PENDING',
      };

      paymentService.createPayment.mockResolvedValue(payment as unknown as any);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const mockToHttp = PaymentPresenter.toHttp as jest.Mock;
      mockToHttp.mockReturnValue(presentedPayment);

      const result = await controller.createPayment(createPaymentDto);

      expect(result).toEqual(presentedPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentService.createPayment).toHaveBeenCalledWith(
        createPaymentDto,
      );
      expect(mockToHttp).toHaveBeenCalledWith(payment);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      const transactionId = 'transaction-123';
      const statusResponse = {
        transactionId,
        status: PaymentStatus.PAID,
        orderId: 123,
        amount: 100,
      };

      paymentService.checkPaymentStatus.mockResolvedValue(
        statusResponse as unknown as any,
      );
      const mockToHttpStatusPayment =
        // eslint-disable-next-line @typescript-eslint/unbound-method
        PaymentPresenter.toHttpStatusPayment as jest.Mock;
      mockToHttpStatusPayment.mockReturnValue(statusResponse);

      const result = await controller.getPaymentStatus(transactionId);

      expect(result).toEqual(statusResponse);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status and return success message', async () => {
      const transactionId = 'transaction-123';

      paymentService.checkPaymentStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PAID,
      } as unknown as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PAID,
      } as unknown as any);

      const result = await controller.updatePaymentStatus(transactionId);

      expect(result).toMatchObject({
        message: 'Pagamento atualizado com sucesso',
        result: expect.objectContaining({
          transactionId,
        }),
      });
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment and return success message', async () => {
      const transactionId = 'transaction-123';
      const reason = 'Customer request';

      paymentService.checkPaymentStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PENDING,
      } as unknown as any);
      paymentService.cancelPayment.mockResolvedValue({
        success: true,
      } as unknown as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.CANCELED,
      } as unknown as any);

      const result = await controller.cancelPayment(transactionId, reason);

      expect(result).toEqual({ message: 'Pagamento cancelado com sucesso' });
    });

    it('should cancel payment without reason', async () => {
      const transactionId = 'transaction-123';

      paymentService.checkPaymentStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.PENDING,
      } as unknown as any);
      paymentService.cancelPayment.mockResolvedValue({
        success: true,
      } as unknown as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId,
        status: PaymentStatus.CANCELED,
      } as unknown as any);

      const result = await controller.cancelPayment(transactionId);

      expect(result).toEqual({ message: 'Pagamento cancelado com sucesso' });
    });
  });

  describe('processWebhook', () => {
    it('should process webhook and return success message', async () => {
      const payload = { data: { id: 'payment-id' } };
      const webhookResult = {
        transactionId: 'transaction-123',
        status: PaymentStatus.PAID,
      };

      paymentService.processPaymentCallback.mockResolvedValue(
        webhookResult as unknown as any,
      );
      paymentService.checkPaymentStatus.mockResolvedValue({
        transactionId: 'transaction-123',
        status: PaymentStatus.PENDING,
      } as unknown as any);
      paymentService.updateStatus.mockResolvedValue({
        transactionId: 'transaction-123',
        status: PaymentStatus.PAID,
      } as unknown as any);

      const result = await controller.processWebhook(payload);

      expect(result).toEqual({
        message: 'Webhook processado com sucesso',
        result: webhookResult,
      });
    });
  });

  describe('getExternalReference', () => {
    it('should return order ID for a given transaction ID', async () => {
      const transactionId = 'transaction-123';
      const orderId = 456;

      paymentService.getExternalReference.mockResolvedValue({
        orderId,
        transactionId,
      });

      const result = await controller.getExternalReference(transactionId);

      expect(result).toBe(orderId);
    });
  });
});
