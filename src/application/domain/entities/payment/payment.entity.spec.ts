import { PaymentEntity } from './payment.entity';
import { PaymentStatus } from '../../value-objects/payment/payment.status.enum';

describe('PaymentEntity', () => {
  it('should create a payment entity with required fields', () => {
    const payment = new PaymentEntity();
    payment.id = 1;
    payment.transactionId = 'txn-123';
    payment.urlPayment = 'http://payment.url';
    payment.amount = 100;
    payment.status = PaymentStatus.PENDING;
    payment.created_at = new Date();

    expect(payment.id).toBe(1);
    expect(payment.transactionId).toBe('txn-123');
    expect(payment.urlPayment).toBe('http://payment.url');
    expect(payment.amount).toBe(100);
    expect(payment.status).toBe(PaymentStatus.PENDING);
    expect(payment.created_at).toBeInstanceOf(Date);
  });

  it('should create a payment entity with all fields', () => {
    const now = new Date();
    const expirationDate = new Date(Date.now() + 86400000); // +1 day

    const payment = new PaymentEntity();
    payment.id = 1;
    payment.transactionId = 'txn-456';
    payment.qrCodeBase64 = 'base64-qr-code';
    payment.qrCodeString = 'qr-string';
    payment.urlPayment = 'http://payment.url';
    payment.amount = 250.5;
    payment.expirationDate = expirationDate;
    payment.client = {
      id: 10,
      name: 'John Doe',
      email: 'john@example.com',
      document: '12345678900',
    };
    payment.status = PaymentStatus.PAID;
    payment.created_at = now;
    payment.updated_at = now;
    payment.orderId = 789;
    payment.items = [
      {
        id: 'item-1',
        title: 'Product 1',
        description: 'Description',
        picture_url: 'http://image.url',
        category_id: 'cat-1',
        quantity: 2,
        unit_price: 125.25,
        type: 'product',
        event_date: '2024-12-31',
        warranty: true,
      },
    ];

    expect(payment.id).toBe(1);
    expect(payment.transactionId).toBe('txn-456');
    expect(payment.qrCodeBase64).toBe('base64-qr-code');
    expect(payment.qrCodeString).toBe('qr-string');
    expect(payment.urlPayment).toBe('http://payment.url');
    expect(payment.amount).toBe(250.5);
    expect(payment.expirationDate).toBe(expirationDate);
    expect(payment.client).toEqual({
      id: 10,
      name: 'John Doe',
      email: 'john@example.com',
      document: '12345678900',
    });
    expect(payment.status).toBe(PaymentStatus.PAID);
    expect(payment.created_at).toBe(now);
    expect(payment.updated_at).toBe(now);
    expect(payment.orderId).toBe(789);
    expect(payment.items).toHaveLength(1);
  });

  it('should allow optional fields to be undefined', () => {
    const payment = new PaymentEntity();
    payment.id = 1;
    payment.transactionId = 'txn-789';
    payment.urlPayment = 'http://payment.url';
    payment.amount = 50;
    payment.status = PaymentStatus.PENDING;
    payment.created_at = new Date();

    expect(payment.qrCodeBase64).toBeUndefined();
    expect(payment.qrCodeString).toBeUndefined();
    expect(payment.expirationDate).toBeUndefined();
    expect(payment.client).toBeUndefined();
    expect(payment.updated_at).toBeUndefined();
    expect(payment.orderId).toBeUndefined();
    expect(payment.items).toBeUndefined();
  });

  it('should support all payment statuses', () => {
    const statuses = [
      PaymentStatus.PENDING,
      PaymentStatus.PAID,
      PaymentStatus.CANCELED,
      PaymentStatus.EXPIRED,
      PaymentStatus.FAILED,
    ];

    statuses.forEach((status) => {
      const payment = new PaymentEntity();
      payment.status = status;
      expect(payment.status).toBe(status);
    });
  });

  it('should allow client to be null', () => {
    const payment = new PaymentEntity();
    payment.client = null;

    expect(payment.client).toBeNull();
  });

  it('should handle client without email', () => {
    const payment = new PaymentEntity();
    payment.client = {
      id: 1,
      name: 'Jane Doe',
      document: '98765432100',
    };

    expect(payment.client.email).toBeUndefined();
    expect(payment.client.name).toBe('Jane Doe');
  });

  it('should handle multiple payment items', () => {
    const payment = new PaymentEntity();
    payment.items = [
      {
        id: 'item-1',
        title: 'Product 1',
        description: 'Desc 1',
        picture_url: 'http://img1.url',
        category_id: 'cat-1',
        quantity: 1,
        unit_price: 50,
        type: 'product',
        event_date: '2024-12-31',
        warranty: false,
      },
      {
        id: 'item-2',
        title: 'Product 2',
        description: 'Desc 2',
        picture_url: 'http://img2.url',
        category_id: 'cat-2',
        quantity: 3,
        unit_price: 25,
        type: 'service',
        event_date: '2024-12-31',
        warranty: true,
      },
    ];

    expect(payment.items).toHaveLength(2);
    expect(payment.items[0].title).toBe('Product 1');
    expect(payment.items[1].title).toBe('Product 2');
  });

  it('should handle item with null title', () => {
    const payment = new PaymentEntity();
    payment.items = [
      {
        id: 'item-1',
        title: null,
        description: 'Description',
        picture_url: 'http://image.url',
        category_id: 'cat-1',
        quantity: 1,
        unit_price: 100,
        type: 'product',
        event_date: '2024-12-31',
        warranty: false,
      },
    ];

    expect(payment.items[0].title).toBeNull();
  });

  it('should allow any type for unit_price', () => {
    const payment = new PaymentEntity();
    payment.items = [
      {
        id: 'item-1',
        title: 'Product',
        description: 'Description',
        picture_url: 'http://image.url',
        category_id: 'cat-1',
        quantity: 1,
        unit_price: '100.50', // string
        type: 'product',
        event_date: '2024-12-31',
        warranty: false,
      },
    ];

    expect(payment.items[0].unit_price).toBe('100.50');
  });

  it('should be instantiable', () => {
    const payment = new PaymentEntity();
    expect(payment).toBeInstanceOf(PaymentEntity);
  });
});
