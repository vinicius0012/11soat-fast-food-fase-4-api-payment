/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PaymentGateway } from './payment.gateway';
import { ConfigService } from '@nestjs/config';
import { PaymentRepository } from 'src/infrastructure/database/mongo/repositories/payment.repository';
import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentMapper } from 'src/application/presenters/payments/payment.mapper';
import { generatePaymentUUID } from 'src/infrastructure/shared/utils/payment.util';
import axios from 'axios';
import { PaymentStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';

jest.mock('axios');
jest.mock('src/application/presenters/payments/payment.mapper');
jest.mock('src/infrastructure/shared/utils/payment.util');

describe('PaymentGateway', () => {
  let gateway: PaymentGateway;
  let configService: jest.Mocked<ConfigService>;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  const mockAxios = axios as jest.Mocked<typeof axios>;

  const mockConfig = {
    paymentServiceBaseUrl: 'https://api.payment.com',
    paymentAccessToken: 'test-token',
    webhookUrl: 'https://webhook.url',
  };

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => mockConfig[key as keyof typeof mockConfig]),
    } as unknown as jest.Mocked<ConfigService>;

    paymentRepository = {
      create: jest.fn(),
      findByTransactionId: jest.fn(),
      updateStatus: jest.fn(),
      findByOrderId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepository>;

    gateway = new PaymentGateway(configService, paymentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error when paymentServiceBaseUrl is not configured', () => {
      const badConfigService = {
        get: jest.fn().mockReturnValue(null),
      } as unknown as jest.Mocked<ConfigService>;

      expect(
        () => new PaymentGateway(badConfigService, paymentRepository),
      ).toThrow('URL base do serviço de pagamento não configurada');
    });

    it('should throw error when paymentAccessToken is not configured', () => {
      const badConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'paymentServiceBaseUrl') return 'https://api.payment.com';
          return null;
        }),
      } as unknown as jest.Mocked<ConfigService>;

      expect(
        () => new PaymentGateway(badConfigService, paymentRepository),
      ).toThrow('Token de acesso do serviço de pagamento não configurado');
    });
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const createPaymentDto = {
        orderId: 123,
        amount: 100,
        description: 'Test payment',
        client: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678900',
        },
        items: [],
      };

      const externalPayload = {
        transaction_amount: 100,
        description: 'Test payment',
        payment_method_id: 'pix',
      };

      const externalResponse = {
        id: 12345,
        transaction_amount: 100,
        status: 'pending',
        external_reference: '123',
      };

      const domainResponse = {
        id: 12345,
        orderId: 123,
        transactionId: '12345',
        status: PaymentStatus.PENDING,
        amount: 100,
        qrCodeBase64: 'qr-code',
        qrCodeString: 'qr-string',
        urlPayment: 'http://payment.url',
        expirationDate: new Date(),
      };

      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue(
        externalPayload,
      );
      (PaymentMapper.toDomain as jest.Mock).mockReturnValue(domainResponse);

      mockAxios.post.mockResolvedValue({
        status: 201,
        data: externalResponse,
      });

      paymentRepository.create.mockResolvedValue({} as any);

      const result = await gateway.createPayment(createPaymentDto as any);

      expect(result).toEqual(domainResponse);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.payment.com/payments',
        externalPayload,
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
            'X-Idempotency-Key': 'uuid-123',
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentRepository.create).toHaveBeenCalled();
    });

    it('should throw AppError when external service returns non-201 status', async () => {
      const createPaymentDto = {
        orderId: 123,
        amount: 100,
        description: 'Test payment',
        client: {},
        items: [],
      };

      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue({});

      mockAxios.post.mockResolvedValue({
        status: 400,
        data: { error: 'Bad request' },
      });

      await expect(
        gateway.createPayment(createPaymentDto as any),
      ).rejects.toThrow(AppError);
    });

    it('should handle axios errors', async () => {
      const createPaymentDto = {
        orderId: 123,
        amount: 100,
        description: 'Test payment',
        client: {},
        items: [],
      };

      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue({});

      const axiosError = {
        isAxiosError: true,
        response: { data: { message: 'Network error' } },
      };

      mockAxios.post.mockRejectedValue(axiosError);
      mockAxios.isAxiosError.mockReturnValue(true);

      await expect(
        gateway.createPayment(createPaymentDto as any),
      ).rejects.toThrow(AppError);
    });

    it('should handle non-axios errors in createPayment', async () => {
      const createPaymentDto = {
        orderId: 123,
        amount: 100,
        description: 'Test payment',
        client: {},
        items: [],
      };

      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue({});

      mockAxios.post.mockRejectedValue(new Error('Generic error'));
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(
        gateway.createPayment(createPaymentDto as any),
      ).rejects.toThrow(AppError);
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const createPaymentDto = {
        orderId: 123,
        amount: 100,
        description: 'Test payment',
        client: {},
        items: [],
      };

      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue({});

      const appError = AppError.internal({ message: 'Test error' });
      mockAxios.post.mockRejectedValue(appError);

      await expect(
        gateway.createPayment(createPaymentDto as any),
      ).rejects.toThrow(appError);
    });

    it('should handle string errors in createPayment', async () => {
      const createPaymentDto = {
        orderId: 123,
        amount: 100,
        description: 'Test payment',
        client: {},
        items: [],
      };

      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue({});

      mockAxios.post.mockRejectedValue('String error');
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(
        gateway.createPayment(createPaymentDto as any),
      ).rejects.toThrow(AppError);
    });
  });

  describe('checkPaymentStatus', () => {
    it('should check payment status successfully', async () => {
      const transactionId = '12345';
      const externalResponse = {
        id: 12345,
        transaction_amount: 100,
        status: 'approved',
      };

      const domainResponse = {
        transactionId: '12345',
        status: PaymentStatus.PAID,
        amount: 100,
        orderId: 123,
      };

      mockAxios.get.mockResolvedValue({
        status: 200,
        data: externalResponse,
      });

      (PaymentMapper.toDomain as jest.Mock).mockReturnValue(domainResponse);
      paymentRepository.updateStatus.mockResolvedValue({} as any);

      const result = await gateway.checkPaymentStatus({ transactionId });

      expect(result).toEqual(domainResponse);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://api.payment.com/payments/12345',
        {
          headers: {
            Authorization: 'Bearer test-token',
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentRepository.updateStatus).toHaveBeenCalledWith(
        transactionId,
        'approved',
      );
    });

    it('should throw AppError when status check returns non-200', async () => {
      mockAxios.get.mockResolvedValue({
        status: 404,
        data: {},
      });

      await expect(
        gateway.checkPaymentStatus({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });

    it('should handle axios errors in checkPaymentStatus', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { message: 'Network error' } },
      };

      mockAxios.get.mockRejectedValue(axiosError);
      mockAxios.isAxiosError.mockReturnValue(true);

      await expect(
        gateway.checkPaymentStatus({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });

    it('should handle non-axios errors in checkPaymentStatus', async () => {
      mockAxios.get.mockRejectedValue(new Error('Generic error'));
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(
        gateway.checkPaymentStatus({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const appError = AppError.internal({ message: 'Test error' });
      mockAxios.get.mockRejectedValue(appError);

      await expect(
        gateway.checkPaymentStatus({ transactionId: '12345' }),
      ).rejects.toThrow(appError);
    });

    it('should handle string errors in checkPaymentStatus', async () => {
      mockAxios.get.mockRejectedValue('String error');
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(
        gateway.checkPaymentStatus({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment successfully with reason', async () => {
      const transactionId = '12345';
      const reason = 'Customer request';

      mockAxios.put.mockResolvedValue({
        status: 200,
        data: {
          transactionId,
          status: 'cancelled',
        },
      });

      paymentRepository.updateStatus.mockResolvedValue({} as any);

      const result = await gateway.cancelPayment({ transactionId, reason });

      expect(result).toEqual({
        transactionId,
        status: 'cancelled',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.put).toHaveBeenCalledWith(
        'https://api.payment.com/payments/12345',
        { status: 'cancelled', cancellation_reason: reason },
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentRepository.updateStatus).toHaveBeenCalledWith(
        transactionId,
        'cancelled',
      );
    });

    it('should cancel payment successfully without reason', async () => {
      const transactionId = '12345';

      mockAxios.put.mockResolvedValue({
        status: 200,
        data: {
          transactionId,
          status: 'cancelled',
        },
      });

      paymentRepository.updateStatus.mockResolvedValue({} as any);

      await gateway.cancelPayment({ transactionId });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.put).toHaveBeenCalledWith(
        'https://api.payment.com/payments/12345',
        { status: 'cancelled' },
        expect.any(Object),
      );
    });

    it('should throw AppError when cancellation fails', async () => {
      mockAxios.put.mockResolvedValue({
        status: 400,
        data: {},
      });

      await expect(
        gateway.cancelPayment({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });

    it('should handle axios errors in cancelPayment', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { message: 'Network error' } },
      };

      mockAxios.put.mockRejectedValue(axiosError);
      mockAxios.isAxiosError.mockReturnValue(true);

      await expect(
        gateway.cancelPayment({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });

    it('should handle non-axios errors in cancelPayment', async () => {
      mockAxios.put.mockRejectedValue(new Error('Generic error'));
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(
        gateway.cancelPayment({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const appError = AppError.internal({ message: 'Test error' });
      mockAxios.put.mockRejectedValue(appError);

      await expect(
        gateway.cancelPayment({ transactionId: '12345' }),
      ).rejects.toThrow(appError);
    });

    it('should handle string errors in cancelPayment', async () => {
      mockAxios.put.mockRejectedValue('String error');
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(
        gateway.cancelPayment({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('processPaymentCallback', () => {
    it('should process payment callback successfully', async () => {
      const payload = { data: { id: '12345' } };
      const response = {
        transactionId: '12345',
        status: PaymentStatus.PAID,
      };

      mockAxios.post.mockResolvedValue({
        status: 200,
        data: response,
      });

      paymentRepository.updateStatus.mockResolvedValue({} as any);

      const result = await gateway.processPaymentCallback(payload);

      expect(result).toEqual(response);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.payment.com/notifications',
        payload,
        {
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentRepository.updateStatus).toHaveBeenCalledWith(
        '12345',
        PaymentStatus.PAID,
      );
    });

    it('should not update status if transactionId is missing', async () => {
      const payload = { data: { id: '12345' } };
      const response = {
        status: PaymentStatus.PAID,
      };

      mockAxios.post.mockResolvedValue({
        status: 200,
        data: response,
      });

      await gateway.processPaymentCallback(payload);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw AppError when callback processing fails', async () => {
      mockAxios.post.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(gateway.processPaymentCallback({})).rejects.toThrow(
        AppError,
      );
    });

    it('should handle axios errors in processPaymentCallback', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { message: 'Network error' } },
      };

      mockAxios.post.mockRejectedValue(axiosError);
      mockAxios.isAxiosError.mockReturnValue(true);

      await expect(gateway.processPaymentCallback({})).rejects.toThrow(
        AppError,
      );
    });

    it('should handle non-axios errors in processPaymentCallback', async () => {
      mockAxios.post.mockRejectedValue(new Error('Generic error'));
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(gateway.processPaymentCallback({})).rejects.toThrow(
        AppError,
      );
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const appError = AppError.internal({ message: 'Test error' });
      mockAxios.post.mockRejectedValue(appError);

      await expect(gateway.processPaymentCallback({})).rejects.toThrow(
        appError,
      );
    });

    it('should handle string errors in processPaymentCallback', async () => {
      mockAxios.post.mockRejectedValue('String error');
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(gateway.processPaymentCallback({})).rejects.toThrow(
        AppError,
      );
    });
  });

  describe('getExternalReference', () => {
    it('should get external reference from MongoDB', async () => {
      const transactionId = '12345';
      const paymentInDb = {
        transactionId,
        orderId: 123,
      };

      paymentRepository.findByTransactionId.mockResolvedValue(
        paymentInDb as any,
      );

      const result = await gateway.getExternalReference(transactionId);

      expect(result).toEqual({ orderId: 123, transactionId });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('should get external reference from external service if not in DB', async () => {
      const transactionId = '12345';

      paymentRepository.findByTransactionId.mockResolvedValue(null);
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: { external_reference: '123' },
      });

      const result = await gateway.getExternalReference(transactionId);

      expect(result).toEqual({ orderId: 123, transactionId });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://api.payment.com/payments/12345',
        expect.any(Object),
      );
    });

    it('should throw AppError when external_reference is missing', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(null);
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: {},
      });

      await expect(gateway.getExternalReference('12345')).rejects.toThrow(
        AppError,
      );
    });

    it('should throw AppError when external_reference is not a valid number', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(null);
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: { external_reference: 'not-a-number' },
      });

      await expect(gateway.getExternalReference('12345')).rejects.toThrow(
        AppError,
      );
    });

    it('should throw AppError when response status is not 200', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(null);
      mockAxios.get.mockResolvedValue({
        status: 404,
        data: {},
      });

      await expect(gateway.getExternalReference('12345')).rejects.toThrow(
        AppError,
      );
    });

    it('should handle axios errors in getExternalReference', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(null);

      const axiosError = {
        isAxiosError: true,
        response: { data: { message: 'Network error' } },
      };

      mockAxios.get.mockRejectedValue(axiosError);
      mockAxios.isAxiosError.mockReturnValue(true);

      await expect(gateway.getExternalReference('12345')).rejects.toThrow(
        AppError,
      );
    });

    it('should handle non-axios errors in getExternalReference', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(null);

      mockAxios.get.mockRejectedValue(new Error('Generic error'));
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(gateway.getExternalReference('12345')).rejects.toThrow(
        AppError,
      );
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(null);

      const appError = AppError.internal({ message: 'Test error' });
      mockAxios.get.mockRejectedValue(appError);

      await expect(gateway.getExternalReference('12345')).rejects.toThrow(
        appError,
      );
    });

    it('should handle string errors in getExternalReference', async () => {
      paymentRepository.findByTransactionId.mockResolvedValue(null);

      mockAxios.get.mockRejectedValue('String error');
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(gateway.getExternalReference('12345')).rejects.toThrow(
        AppError,
      );
    });

    it('should fallback to external service when payment in DB has no orderId', async () => {
      const transactionId = '12345';

      // Payment found in DB but without orderId
      paymentRepository.findByTransactionId.mockResolvedValue({
        transactionId: '12345',
        // orderId is undefined or null
      } as any);

      // External service returns valid data
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: { external_reference: '789' },
      });

      const result = await gateway.getExternalReference(transactionId);

      expect(result).toEqual({ orderId: 789, transactionId });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://api.payment.com/payments/12345',
        expect.any(Object),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const transactionId = '12345';
      const status = PaymentStatus.PAID;

      const updatedPayment = {
        transactionId,
        status,
        orderId: 123,
        amount: 100,
      };

      paymentRepository.updateStatus.mockResolvedValue(updatedPayment as any);

      const result = await gateway.updateStatus({ transactionId, status });

      expect(result).toEqual(updatedPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(paymentRepository.updateStatus).toHaveBeenCalledWith(
        transactionId,
        status,
      );
    });

    it('should handle errors when updating status', async () => {
      paymentRepository.updateStatus.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        gateway.updateStatus({
          transactionId: '12345',
          status: PaymentStatus.PAID,
        }),
      ).rejects.toThrow(AppError);
    });

    it('should handle axios errors in updateStatus', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { data: { message: 'Network error' } },
      };

      paymentRepository.updateStatus.mockRejectedValue(axiosError);
      mockAxios.isAxiosError.mockReturnValue(true);

      await expect(
        gateway.updateStatus({
          transactionId: '12345',
          status: PaymentStatus.PAID,
        }),
      ).rejects.toThrow(AppError);
    });

    it('should rethrow AppError when it is already an AppError', async () => {
      const appError = AppError.internal({ message: 'Test error' });
      paymentRepository.updateStatus.mockRejectedValue(appError);

      await expect(
        gateway.updateStatus({
          transactionId: '12345',
          status: PaymentStatus.PAID,
        }),
      ).rejects.toThrow(appError);
    });

    it('should handle string errors in updateStatus', async () => {
      paymentRepository.updateStatus.mockRejectedValue('String error');
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(
        gateway.updateStatus({
          transactionId: '12345',
          status: PaymentStatus.PAID,
        }),
      ).rejects.toThrow(AppError);
    });
  });
});
