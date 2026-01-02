/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PaymentRepository, CreatePaymentParams } from './payment.repository';
import { MongoService } from '../mongo.service';
import { Db, Collection } from 'mongodb';
import { PaymentDocument, CollectionNames } from '../types/payment.types';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  let mongoService: jest.Mocked<MongoService>;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: jest.Mocked<Collection<PaymentDocument>>;

  beforeEach(() => {
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      deleteOne: jest.fn(),
    } as unknown as jest.Mocked<Collection<PaymentDocument>>;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as jest.Mocked<Db>;

    mongoService = {
      getDb: jest.fn().mockReturnValue(mockDb),
    } as unknown as jest.Mocked<MongoService>;

    repository = new PaymentRepository(mongoService);
  });

  describe('create', () => {
    it('should create a payment document successfully', async () => {
      const createParams: CreatePaymentParams = {
        transactionId: 'txn-123',
        qrCodeBase64: 'qr-code-base64',
        qrCodeString: 'qr-code-string',
        urlPayment: 'http://payment.url',
        amount: 100,
        description: 'Test payment',
        expirationDate: new Date(),
        client: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678900',
        },
        status: 'PENDING',
        orderId: 123,
        items: [],
        callbackUrl: 'http://callback.url',
      };

      mockCollection.insertOne.mockResolvedValue({
        acknowledged: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        insertedId: 'mock-id' as any,
      } as any);

      const result = await repository.create(createParams);

      expect(result).toMatchObject({
        transactionId: 'txn-123',
        amount: 100,
        status: 'PENDING',
        orderId: 123,
      });
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: 'txn-123',
        }),
      );
    });
  });

  describe('findByTransactionId', () => {
    it('should find a payment by transaction ID', async () => {
      const mockPayment: PaymentDocument = {
        transactionId: 'txn-123',
        amount: 100,
        status: 'PENDING',
        orderId: 123,
        urlPayment: 'http://payment.url',
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(mockPayment);

      const result = await repository.findByTransactionId('txn-123');

      expect(result).toEqual(mockPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        transactionId: 'txn-123',
      });
    });

    it('should return null if payment is not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await repository.findByTransactionId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByOrderId', () => {
    it('should find a payment by order ID', async () => {
      const mockPayment: PaymentDocument = {
        transactionId: 'txn-123',
        amount: 100,
        status: 'PENDING',
        orderId: 123,
        urlPayment: 'http://payment.url',
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(mockPayment);

      const result = await repository.findByOrderId(123);

      expect(result).toEqual(mockPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCollection.findOne).toHaveBeenCalledWith({ orderId: 123 });
    });

    it('should return null if payment is not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await repository.findByOrderId(999);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a payment by ID', async () => {
      const mockPayment: PaymentDocument = {
        transactionId: 'txn-123',
        amount: 100,
        status: 'PENDING',
        orderId: 123,
        urlPayment: 'http://payment.url',
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCollection.findOne.mockResolvedValue(mockPayment);

      const result = await repository.findById(1);

      expect(result).toEqual(mockPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCollection.findOne).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('updateStatus', () => {
    it('should update payment status successfully', async () => {
      const updatedPayment: PaymentDocument = {
        transactionId: 'txn-123',
        amount: 100,
        status: 'PAID',
        orderId: 123,
        urlPayment: 'http://payment.url',
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(updatedPayment as any);

      const result = await repository.updateStatus('txn-123', 'PAID');

      expect(result).toEqual(updatedPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { transactionId: 'txn-123' },
        { $set: { status: 'PAID', updated_at: expect.any(Date) as Date } },
        { returnDocument: 'after' },
      );
    });

    it('should return null if payment is not found', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue(null);

      const result = await repository.updateStatus('non-existent', 'PAID');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update payment with partial data', async () => {
      const updates = { amount: 200, description: 'Updated description' };
      const updatedPayment: PaymentDocument = {
        transactionId: 'txn-123',
        amount: 200,
        description: 'Updated description',
        status: 'PENDING',
        orderId: 123,
        urlPayment: 'http://payment.url',
        items: [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(updatedPayment as any);

      const result = await repository.update('txn-123', updates);

      expect(result).toEqual(updatedPayment);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { transactionId: 'txn-123' },
        { $set: { ...updates, updated_at: expect.any(Date) as Date } },
        { returnDocument: 'after' },
      );
    });

    it('should return null if payment is not found', async () => {
      mockCollection.findOneAndUpdate.mockResolvedValue(null);

      const result = await repository.update('non-existent', { amount: 200 });

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all payments sorted by creation date', async () => {
      const mockPayments: PaymentDocument[] = [
        {
          transactionId: 'txn-1',
          amount: 100,
          status: 'PAID',
          orderId: 1,
          urlPayment: 'http://payment1.url',
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          transactionId: 'txn-2',
          amount: 200,
          status: 'PENDING',
          orderId: 2,
          urlPayment: 'http://payment2.url',
          items: [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const mockSort = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockPayments),
      });

      mockCollection.find.mockReturnValue({
        sort: mockSort,
      } as any);

      const result = await repository.findAll();

      expect(result).toEqual(mockPayments);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockSort).toHaveBeenCalledWith({ created_at: -1 });
    });
  });

  describe('delete', () => {
    it('should delete a payment successfully', async () => {
      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      const result = await repository.delete('txn-123');

      expect(result).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        transactionId: 'txn-123',
      });
    });

    it('should return false if delete fails', async () => {
      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: false,
        deletedCount: 0,
      });

      const result = await repository.delete('txn-123');

      expect(result).toBe(false);
    });
  });

  describe('getCollection', () => {
    it('should get collection with correct name', () => {
      repository['getCollection']();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockDb.collection).toHaveBeenCalledWith(CollectionNames.Payments);
    });
  });
});
