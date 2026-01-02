import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { ConfigService } from '@nestjs/config';
import { MongoService } from 'src/infrastructure/database/mongo/mongo.service';

describe('PaymentController', () => {
  let controller: PaymentController;

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have cleanArchController initialized', () => {
    expect(controller['cleanArchController']).toBeDefined();
  });
});
