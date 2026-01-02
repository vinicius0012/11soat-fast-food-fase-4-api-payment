import { PaymentPresenter } from './payments.presenter';
import { PaymentEntity } from '../../domain/entities/payment/payment.entity';
import { PaymentStatusResponse } from '../../domain/dtos/payment/payment.db.interface';
import { PaymentStatus } from '../../domain/value-objects/payment/payment.status.enum';

describe('PaymentPresenter', () => {
  describe('toHttp', () => {
    it('should return the entity as is', () => {
      const entity: PaymentEntity = {
        id: 123,
        orderId: 456,
        transactionId: 'txn-789',
        status: PaymentStatus.PENDING,
        amount: 100,
        qrCodeBase64: 'qr-code-base64',
        qrCodeString: 'qr-code-string',
        urlPayment: 'http://payment.url',
        created_at: new Date(),
      };

      const result = PaymentPresenter.toHttp(entity);

      expect(result).toEqual(entity);
      expect(result).toBe(entity); // Should be the same reference
    });

    it('should handle entity with all optional fields', () => {
      const entity: PaymentEntity = {
        id: 456,
        orderId: 456,
        transactionId: 'txn-789',
        status: PaymentStatus.PAID,
        amount: 200,
        qrCodeBase64: 'qr-code-base64',
        qrCodeString: 'qr-code-string',
        urlPayment: 'http://payment.url',
        expirationDate: new Date(),
        client: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678900',
        },
        items: [
          {
            id: 'item-1',
            title: 'Product 1',
            description: 'Product description',
            picture_url: 'http://image.url',
            category_id: 'cat-1',
            quantity: 2,
            unit_price: 50,
            type: 'product',
            event_date: '2024-12-31',
            warranty: false,
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = PaymentPresenter.toHttp(entity);

      expect(result).toEqual(entity);
    });
  });

  describe('toHttpStatusPayment', () => {
    it('should transform payment status response with all fields', () => {
      const payment: PaymentStatusResponse = {
        orderId: 123,
        amount: 150,
        status: PaymentStatus.PAID,
        transactionId: 'txn-456',
      };

      const result = PaymentPresenter.toHttpStatusPayment(payment);

      expect(result).toEqual({
        orderId: 123,
        amount: 150,
        status: PaymentStatus.PAID,
        transactionId: 'txn-456',
      });
    });

    it('should transform payment with PENDING status', () => {
      const payment: PaymentStatusResponse = {
        orderId: 789,
        amount: 250,
        status: PaymentStatus.PENDING,
        transactionId: 'txn-123',
      };

      const result = PaymentPresenter.toHttpStatusPayment(payment);

      expect(result).toEqual({
        orderId: 789,
        amount: 250,
        status: PaymentStatus.PENDING,
        transactionId: 'txn-123',
      });
    });

    it('should transform payment with CANCELED status', () => {
      const payment: PaymentStatusResponse = {
        orderId: 999,
        amount: 100,
        status: PaymentStatus.CANCELED,
        transactionId: 'txn-999',
      };

      const result = PaymentPresenter.toHttpStatusPayment(payment);

      expect(result).toEqual({
        orderId: 999,
        amount: 100,
        status: PaymentStatus.CANCELED,
        transactionId: 'txn-999',
      });
    });

    it('should transform payment with EXPIRED status', () => {
      const payment: PaymentStatusResponse = {
        orderId: 555,
        amount: 300,
        status: PaymentStatus.EXPIRED,
        transactionId: 'txn-555',
      };

      const result = PaymentPresenter.toHttpStatusPayment(payment);

      expect(result).toEqual({
        orderId: 555,
        amount: 300,
        status: PaymentStatus.EXPIRED,
        transactionId: 'txn-555',
      });
    });

    it('should transform payment with FAILED status', () => {
      const payment: PaymentStatusResponse = {
        orderId: 666,
        amount: 75,
        status: PaymentStatus.FAILED,
        transactionId: 'txn-666',
      };

      const result = PaymentPresenter.toHttpStatusPayment(payment);

      expect(result).toEqual({
        orderId: 666,
        amount: 75,
        status: PaymentStatus.FAILED,
        transactionId: 'txn-666',
      });
    });

    it('should only include specified fields from payment', () => {
      const payment: PaymentStatusResponse & { extraField?: string } = {
        orderId: 123,
        amount: 150,
        status: PaymentStatus.PAID,
        transactionId: 'txn-456',
        extraField: 'should not be included',
      };

      const result = PaymentPresenter.toHttpStatusPayment(payment);

      expect(result).toEqual({
        orderId: 123,
        amount: 150,
        status: PaymentStatus.PAID,
        transactionId: 'txn-456',
      });
      expect(result).not.toHaveProperty('extraField');
    });
  });
});
