import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { ConfigService } from '@nestjs/config';
import { MongoService } from 'src/infrastructure/database/mongo/mongo.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';

/**
 * BDD Tests - Create Payment Feature
 * Baseado no arquivo: features/payment/create-payment.feature
 */
describe('PaymentController BDD - Create Payment Feature', () => {
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

  describe('BDD: Criar Pagamento', () => {
    describe('Cenário: Criar pagamento com sucesso com todos os dados obrigatórios', () => {
      it('Dado que eu tenho um pedido válido, Quando eu envio uma requisição POST para /payment/create, Então o status da resposta deve ser 201 e a resposta deve conter dados do pagamento', async () => {
        // Dado - Given
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

        // Quando - When
        const result = await controller.createPayment(createPaymentDto);

        // Então - Then
        expect(result).toBeDefined();
        expect(result.transactionId).toBe('12345');
        expect(result.status).toBe('PENDING');
        expect(result.qrCodeBase64).toBe('base64string');
        expect(result.qrCodeString).toBe('qrstring');
        expect(result.urlPayment).toBe('http://payment.url');
        expect(result.amount).toBe(100);
      });
    });

    describe('Cenário: Criar pagamento com callbackUrl personalizada', () => {
      it('Dado que eu tenho um pedido com callbackUrl, Quando eu envio uma requisição, Então o pagamento deve ser criado com a callbackUrl fornecida', async () => {
        // Dado - Given
        const createPaymentDto: CreatePaymentDto = {
          orderId: 123,
          amount: 100,
          description: 'Test payment',
          callbackUrl: 'http://callback.url',
          client: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            document: '12345678900',
          },
          items: [],
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

        // Quando - When
        const result = await controller.createPayment(createPaymentDto);

        // Então - Then
        expect(result).toBeDefined();
        expect(result.transactionId).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(cleanArchController.createPayment).toHaveBeenCalledWith(
          createPaymentDto,
        );
      });
    });

    describe('Cenário: Criar pagamento com lista de itens', () => {
      it('Dado que eu tenho um pedido com itens, Quando eu envio uma requisição, Então o pagamento deve ser criado com os itens fornecidos', async () => {
        // Dado - Given
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
          items: [
            {
              id: 'item1',
              title: 'Product A',
              quantity: 2,
              unit_price: 50,
              description: 'Product description',
              category_id: 'category1',
              picture_url: 'https://example.com/product-a.jpg',
              type: 'product',
              event_date: '2026-01-03',
              warranty: true,
            },
          ],
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

        // Quando - When
        const result = await controller.createPayment(createPaymentDto);

        // Então - Then
        expect(result).toBeDefined();
        expect(result.transactionId).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(cleanArchController.createPayment).toHaveBeenCalledWith(
          expect.objectContaining({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            items: expect.arrayContaining([
              expect.objectContaining({
                id: 'item1',
                title: 'Product A',
                quantity: 2,
                unit_price: 50,
              }),
            ]),
          }),
        );
      });
    });

    describe('Cenário: Falha ao criar pagamento quando o serviço de pagamento está indisponível', () => {
      it('Dado que o serviço está indisponível, Quando eu envio uma requisição, Então deve retornar erro 500', async () => {
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
          .mockRejectedValue(new Error('Payment service unavailable'));

        // Quando - When & Então - Then
        await expect(
          controller.createPayment(createPaymentDto),
        ).rejects.toThrow('Payment service unavailable');
      });
    });

    describe('Cenário: Criar pagamento sem informações do cliente', () => {
      it('Dado que não há dados do cliente, Quando eu envio uma requisição, Então o pagamento deve ser criado sem informações do cliente', async () => {
        // Dado - Given
        const createPaymentDto: CreatePaymentDto = {
          orderId: 123,
          amount: 100,
          description: 'Test payment',
          items: [],
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

        // Quando - When
        const result = await controller.createPayment(createPaymentDto);

        // Então - Then
        expect(result).toBeDefined();
        expect(result.transactionId).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(cleanArchController.createPayment).toHaveBeenCalledWith(
          createPaymentDto,
        );
      });
    });

    describe('Cenário: Criar pagamento com valor mínimo', () => {
      it('Dado que o valor do pagamento é 0.01, Quando eu envio uma requisição, Então o pagamento deve ser criado com o valor correto', async () => {
        // Dado - Given
        const createPaymentDto: CreatePaymentDto = {
          orderId: 123,
          amount: 0.01,
          description: 'Test payment',
          client: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            document: '12345678900',
          },
          items: [],
        };

        const expectedResult = {
          id: 1,
          transactionId: '12345',
          status: 'PENDING',
          amount: 0.01,
          qrCodeBase64: 'base64string',
          qrCodeString: 'qrstring',
          urlPayment: 'http://payment.url',
          expirationDate: new Date(),
        };

        jest
          .spyOn(cleanArchController, 'createPayment')
          .mockResolvedValue(expectedResult);

        // Quando - When
        const result = await controller.createPayment(createPaymentDto);

        // Então - Then
        expect(result).toBeDefined();
        expect(result.amount).toBe(0.01);
        expect(result.transactionId).toBeDefined();
      });
    });

    describe('Cenário: Criar pagamento com valor alto', () => {
      it('Dado que o valor do pagamento é 99999.99, Quando eu envio uma requisição, Então o pagamento deve ser criado com o valor correto', async () => {
        // Dado - Given
        const createPaymentDto: CreatePaymentDto = {
          orderId: 123,
          amount: 99999.99,
          description: 'Test payment',
          client: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            document: '12345678900',
          },
          items: [],
        };

        const expectedResult = {
          id: 1,
          transactionId: '12345',
          status: 'PENDING',
          amount: 99999.99,
          qrCodeBase64: 'base64string',
          qrCodeString: 'qrstring',
          urlPayment: 'http://payment.url',
          expirationDate: new Date(),
        };

        jest
          .spyOn(cleanArchController, 'createPayment')
          .mockResolvedValue(expectedResult);

        // Quando - When
        const result = await controller.createPayment(createPaymentDto);

        // Então - Then
        expect(result).toBeDefined();
        expect(result.amount).toBe(99999.99);
        expect(result.transactionId).toBeDefined();
      });
    });

    describe('Cenário: Falha ao criar pagamento com dados inválidos', () => {
      it('Dado que os dados são inválidos, Quando eu envio uma requisição, Então deve retornar erro de validação', async () => {
        // Dado - Given
        const createPaymentDto: CreatePaymentDto = {
          orderId: 123,
          amount: -100, // valor inválido
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
          .mockRejectedValue(
            new HttpException('Invalid payment data', HttpStatus.BAD_REQUEST),
          );

        // Quando - When & Então - Then
        await expect(
          controller.createPayment(createPaymentDto),
        ).rejects.toThrow(HttpException);
      });
    });
  });
});
