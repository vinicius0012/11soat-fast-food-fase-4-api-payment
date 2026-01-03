import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { ConfigService } from '@nestjs/config';
import { MongoService } from 'src/infrastructure/database/mongo/mongo.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let cleanArchController: any;

  beforeEach(async () => {
    // Mock ConfigService
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          paymentServiceBaseUrl: 'https://api.payment.com',
          paymentAccessToken: 'test-token',
          webhookUrl: 'https://webhook.url',
        };
        return config[key];
      }),
    };

    // Mock MongoService
    const mockMongoService = {
      getDb: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          insertOne: jest.fn(),
          findOne: jest.fn(),
          findOneAndUpdate: jest.fn(),
          find: jest.fn(),
          deleteOne: jest.fn(),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MongoService,
          useValue: mockMongoService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    cleanArchController = controller['cleanArchController'];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have cleanArchController initialized', () => {
    expect(controller['cleanArchController']).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const createPaymentDto: CreatePaymentDto = {
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
        callbackUrl: 'http://callback.url',
      };

      const expectedResult = {
        id: 1,
        transactionId: '12345',
        status: 'PENDING',
        amount: 100,
        qrCodeBase64: 'base64string',
        qrCodeString: 'qrstring',
        urlPayment: 'http://payment.url',
        expirationDate: new Date(),
      };

      jest
        .spyOn(cleanArchController, 'createPayment')
        .mockResolvedValue(expectedResult);

      const result = await controller.createPayment(createPaymentDto);

      expect(result).toEqual(expectedResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access
      expect(cleanArchController.createPayment).toHaveBeenCalledWith(
        createPaymentDto,
      );
    });

    it('should throw error when createPayment fails', async () => {
      const createPaymentDto: CreatePaymentDto = {
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

      jest
        .spyOn(cleanArchController, 'createPayment')
        .mockRejectedValue(new Error('Payment creation failed'));

      await expect(controller.createPayment(createPaymentDto)).rejects.toThrow(
        'Payment creation failed',
      );
    });
  });

  describe('getPaymentStatus', () => {
    it('should get payment status successfully', async () => {
      const transactionId = '12345';
      const expectedResult = {
        transactionId,
        status: 'PAID',
        amount: 100,
        orderId: 123,
      };

      jest
        .spyOn(cleanArchController, 'getPaymentStatus')
        .mockResolvedValue(expectedResult);

      const result = await controller.getPaymentStatus(transactionId);

      expect(result).toEqual(expectedResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access
      expect(cleanArchController.getPaymentStatus).toHaveBeenCalledWith(
        transactionId,
      );
    });

    it('should throw error when getPaymentStatus fails', async () => {
      const transactionId = '12345';

      jest
        .spyOn(cleanArchController, 'getPaymentStatus')
        .mockRejectedValue(new Error('Payment not found'));

      await expect(controller.getPaymentStatus(transactionId)).rejects.toThrow(
        'Payment not found',
      );
    });
  });

  describe('updateStatusPayment', () => {
    it('should update payment status successfully', async () => {
      const transactionId = '12345';
      const expectedResult = {
        message: 'Payment status updated successfully',
        result: { status: 'PAID' },
      };

      jest
        .spyOn(cleanArchController, 'updatePaymentStatus')
        .mockResolvedValue(expectedResult);

      const result = await controller.updateStatusPayment(transactionId);

      expect(result).toEqual(expectedResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access
      expect(cleanArchController.updatePaymentStatus).toHaveBeenCalledWith(
        transactionId,
      );
    });

    it('should handle errors and throw HttpException', async () => {
      const transactionId = '12345';
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      jest
        .spyOn(cleanArchController, 'updatePaymentStatus')
        .mockRejectedValue(new Error('Update failed'));

      await expect(
        controller.updateStatusPayment(transactionId),
      ).rejects.toThrow(HttpException);

      await expect(
        controller.updateStatusPayment(transactionId),
      ).rejects.toThrow('Erro ao processar webhook');

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment successfully', async () => {
      const transactionId = '12345';
      const expectedResult = {
        message: 'Payment cancelled successfully',
      };

      jest
        .spyOn(cleanArchController, 'cancelPayment')
        .mockResolvedValue(expectedResult);

      const result = await controller.cancelPayment(transactionId);

      expect(result).toEqual(expectedResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access
      expect(cleanArchController.cancelPayment).toHaveBeenCalledWith(
        transactionId,
      );
    });

    it('should throw error when cancelPayment fails', async () => {
      const transactionId = '12345';

      jest
        .spyOn(cleanArchController, 'cancelPayment')
        .mockRejectedValue(new Error('Cancellation failed'));

      await expect(controller.cancelPayment(transactionId)).rejects.toThrow(
        'Cancellation failed',
      );
    });
  });

  describe('processWebhook', () => {
    it('should process webhook successfully', async () => {
      const payload = {
        data: { id: '12345' },
        type: 'payment',
      };

      const expectedResult = {
        message: 'Webhook processed successfully',
        result: { status: 'PAID' },
      };

      jest
        .spyOn(cleanArchController, 'processWebhook')
        .mockResolvedValue(expectedResult);

      const result = await controller.processWebhook(payload);

      expect(result).toEqual(expectedResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access
      expect(cleanArchController.processWebhook).toHaveBeenCalledWith(payload);
    });

    it('should handle errors and throw HttpException', async () => {
      const payload = { data: { id: '12345' } };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      jest
        .spyOn(cleanArchController, 'processWebhook')
        .mockRejectedValue(new Error('Processing failed'));

      await expect(controller.processWebhook(payload)).rejects.toThrow(
        HttpException,
      );

      await expect(controller.processWebhook(payload)).rejects.toThrow(
        'Erro ao processar webhook',
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle unknown errors', async () => {
      const payload = { data: { id: '12345' } };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      jest
        .spyOn(cleanArchController, 'processWebhook')
        .mockRejectedValue('Unknown error');

      try {
        await controller.processWebhook(payload);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      consoleErrorSpy.mockRestore();
    });
  });
});
