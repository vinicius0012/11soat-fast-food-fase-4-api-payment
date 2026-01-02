/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PaymentServiceImpl } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { AppError } from 'src/application/domain/errors/app.error';
import { PaymentMapper } from 'src/application/presenters/payments/payment.mapper';
import { generatePaymentUUID } from 'src/infrastructure/shared/utils/payment.util';
import axios from 'axios';

jest.mock('axios');
jest.mock('src/application/presenters/payments/payment.mapper');
jest.mock('src/infrastructure/shared/utils/payment.util');

describe.skip('PaymentServiceImpl', () => {
  let service: PaymentServiceImpl;
  let configService: jest.Mocked<ConfigService>;
  const mockAxios = axios as jest.Mocked<typeof axios>;

  const mockConfig = {
    paymentServiceBaseUrl: 'https://api.payment.com',
    paymentAccessToken: 'test-token',
    webhookUrl: 'https://webhook.url',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configService = {
      get: jest.fn((key: string) => mockConfig[key as keyof typeof mockConfig]),
    } as unknown as jest.Mocked<ConfigService>;

    service = new PaymentServiceImpl(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should throw error when paymentServiceBaseUrl is not configured', () => {
      const badConfigService = {
        get: jest.fn().mockReturnValue(null),
      } as unknown as jest.Mocked<ConfigService>;

      expect(() => new PaymentServiceImpl(badConfigService)).toThrow(
        'URL base do Mercado Pago não configurada',
      );
    });

    it('should throw error when paymentAccessToken is not configured', () => {
      const badConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'paymentServiceBaseUrl') return 'https://api.payment.com';
          return null;
        }),
      } as unknown as jest.Mocked<ConfigService>;

      expect(() => new PaymentServiceImpl(badConfigService)).toThrow(
        'Token de acesso do Mercado Pago não configurado',
      );
    });
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const createPaymentDto = {
        orderId: 123,
        amount: 100,
        description: 'Test payment',
        client: {},
        items: [],
      };

      const externalPayload = { transaction_amount: 100 };
      const externalResponse = { id: 12345, status: 'pending' };
      const domainResponse = { id: 12345, transactionId: '12345' };

      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue(
        externalPayload,
      );
      (PaymentMapper.toDomain as jest.Mock).mockReturnValue(domainResponse);

      mockAxios.post.mockResolvedValue({
        status: 201,
        data: externalResponse,
      });

      const result = await service.createPayment(createPaymentDto as any);

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
    });

    it('should throw AppError when response status is not 201', async () => {
      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue({});

      mockAxios.post.mockResolvedValue({
        status: 400,
        data: { error: 'Bad request' },
      });

      await expect(service.createPayment({} as any)).rejects.toThrow(AppError);
    });

    it('should handle axios errors', async () => {
      (generatePaymentUUID as jest.Mock).mockReturnValue('uuid-123');
      (PaymentMapper.toExternalService as jest.Mock).mockReturnValue({});

      mockAxios.post.mockRejectedValue(new Error('Network error'));
      mockAxios.isAxiosError.mockReturnValue(false);

      await expect(service.createPayment({} as any)).rejects.toThrow(AppError);
    });
  });

  describe('getPaymentStatus', () => {
    it('should get payment status successfully', async () => {
      const transactionId = '12345';
      const externalResponse = { id: 12345, status: 'approved' };
      const domainResponse = { transactionId: '12345', status: 'PAID' };

      mockAxios.get.mockResolvedValue({
        status: 200,
        data: externalResponse,
      });

      (PaymentMapper.toDomain as jest.Mock).mockReturnValue(domainResponse);

      const result = await service.getPaymentStatus(transactionId);

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
    });

    it('should throw AppError when response status is not 200', async () => {
      mockAxios.get.mockResolvedValue({
        status: 404,
        data: {},
      });

      await expect(service.getPaymentStatus('12345')).rejects.toThrow(AppError);
    });
  });

  describe('getExternalReference', () => {
    it('should get external reference successfully', async () => {
      const transactionId = '12345';

      mockAxios.get.mockResolvedValue({
        status: 200,
        data: { external_reference: '123' },
      });

      const result = await service.getExternalReference(transactionId);

      expect(result).toEqual({ orderId: 123, transactionId });
    });

    it('should throw AppError when external_reference is missing', async () => {
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: {},
      });

      await expect(service.getExternalReference('12345')).rejects.toThrow(
        AppError,
      );
    });

    it('should throw AppError when external_reference is not a valid number', async () => {
      mockAxios.get.mockResolvedValue({
        status: 200,
        data: { external_reference: 'invalid' },
      });

      await expect(service.getExternalReference('12345')).rejects.toThrow(
        AppError,
      );
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment successfully', async () => {
      const transactionId = '12345';
      const response = { transactionId, status: 'cancelled' };

      mockAxios.put.mockResolvedValue({
        status: 200,
        data: response,
      });

      const result = await service.cancelPayment({ transactionId });

      expect(result).toEqual(response);
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
        service.cancelPayment({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('processPaymentCallback', () => {
    it('should process payment callback successfully', async () => {
      const payload = { data: { id: '12345' } };
      const response = { transactionId: '12345', status: 'PAID' };

      mockAxios.post.mockResolvedValue({
        status: 200,
        data: response,
      });

      const result = await service.processPaymentCallback(payload);

      expect(result).toEqual(response);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://api.payment.com/notifications',
        payload,
        expect.any(Object),
      );
    });

    it('should throw AppError when processing fails', async () => {
      mockAxios.post.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(service.processPaymentCallback({})).rejects.toThrow(
        AppError,
      );
    });
  });

  describe('checkPaymentStatus', () => {
    it('should check payment status successfully', async () => {
      const transactionId = '12345';
      const response = { transactionId, status: 'PAID' };

      mockAxios.get.mockResolvedValue({
        status: 200,
        data: response,
      });

      const result = await service.checkPaymentStatus({ transactionId });

      expect(result).toEqual(response);
    });

    it('should throw AppError when check fails', async () => {
      mockAxios.get.mockResolvedValue({
        status: 404,
        data: {},
      });

      await expect(
        service.checkPaymentStatus({ transactionId: '12345' }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const transactionId = '12345';
      const status = 'PAID';
      const response = { transactionId, status };

      mockAxios.put.mockResolvedValue({
        status: 200,
        data: response,
      });

      const result = await service.updateStatus({
        transactionId,
        status,
      } as any);

      expect(result).toEqual(response);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockAxios.put).toHaveBeenCalledWith(
        'https://api.payment.com/payments/12345',
        { status },
      );
    });

    it('should throw AppError when update fails', async () => {
      mockAxios.put.mockResolvedValue({
        status: 400,
        data: {},
      });

      await expect(
        service.updateStatus({ transactionId: '12345', status: 'PAID' } as any),
      ).rejects.toThrow(AppError);
    });
  });
});
