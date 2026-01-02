/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PaymentMapper } from './payment.mapper';
import {
  CreatePaymentDto,
  PaymentExternalResponseDataInterface,
} from 'src/application/domain/dtos/payment/payment.db.interface';
import { PaymentStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';
import * as stringsUtils from 'src/infrastructure/shared/utils/strings.utils';
import * as enumMapper from '../enum-mapper.util';

jest.mock('src/infrastructure/shared/utils/strings.utils');
jest.mock('../enum-mapper.util');

describe('PaymentMapper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toDomain', () => {
    it('should map external payment response to domain object', () => {
      const externalData: PaymentExternalResponseDataInterface = {
        id: 12345,
        orderId: 789,
        transaction_amount: 100,
        status: 'approved',
        external_reference: '789',
        point_of_interaction: {
          transaction_data: {
            ticket_url: 'http://ticket.url',
            qr_code: 'qr-string',
            qr_code_base64: 'qr-base64',
          },
        },
        items: [{ title: 'Item 1', quantity: 1, unit_price: 100 }],
        date_of_expiration: '2024-12-31T23:59:59Z',
        client: {
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678900',
        },
        date_created: '2024-01-01T00:00:00Z',
        date_updated: '2024-01-02T00:00:00Z',
      } as any;

      (enumMapper.mapToDomainPaymentStatus as jest.Mock).mockReturnValue(
        PaymentStatus.PAID,
      );

      const result = PaymentMapper.toDomain(externalData);

      expect(result).toEqual({
        id: 12345,
        orderId: 789,
        transactionId: '12345',
        status: PaymentStatus.PAID,
        amount: 100,
        urlPayment: 'http://ticket.url',
        items: [{ title: 'Item 1', quantity: 1, unit_price: 100 }],
        qrCodeString: 'qr-string',
        qrCodeBase64: 'qr-base64',
        expirationDate: new Date('2024-12-31T23:59:59Z'),
        client: {
          name: 'John Doe',
          email: 'john@example.com',
          document: '12345678900',
        },
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-02T00:00:00Z'),
      });
    });

    it('should use external_reference as orderId when orderId is not present', () => {
      const externalData: PaymentExternalResponseDataInterface = {
        id: 12345,
        transaction_amount: 100,
        status: 'pending',
        external_reference: '999',
        point_of_interaction: {
          transaction_data: {
            ticket_url: 'http://ticket.url',
            qr_code: 'qr-string',
            qr_code_base64: 'qr-base64',
          },
        },
        date_created: '2024-01-01T00:00:00Z',
      } as any;

      (enumMapper.mapToDomainPaymentStatus as jest.Mock).mockReturnValue(
        PaymentStatus.PENDING,
      );

      const result = PaymentMapper.toDomain(externalData);

      expect(result.orderId).toBe(999);
    });

    it('should handle missing optional fields', () => {
      const externalData: PaymentExternalResponseDataInterface = {
        id: 12345,
        transaction_amount: 100,
        status: 'pending',
        external_reference: '123',
        point_of_interaction: {
          transaction_data: {},
        },
        date_created: '2024-01-01T00:00:00Z',
      } as any;

      (enumMapper.mapToDomainPaymentStatus as jest.Mock).mockReturnValue(
        PaymentStatus.PENDING,
      );

      const result = PaymentMapper.toDomain(externalData);

      expect(result).toEqual({
        id: 12345,
        orderId: 123,
        transactionId: '12345',
        status: PaymentStatus.PENDING,
        amount: 100,
        urlPayment: '',
        items: undefined,
        qrCodeString: '',
        qrCodeBase64: '',
        expirationDate: undefined,
        client: undefined,
        created_at: new Date('2024-01-01T00:00:00Z'),
      });
    });

    it('should not include updated_at when date_updated is not present', () => {
      const externalData: PaymentExternalResponseDataInterface = {
        id: 12345,
        transaction_amount: 100,
        status: 'pending',
        external_reference: '123',
        point_of_interaction: {
          transaction_data: {},
        },
        date_created: '2024-01-01T00:00:00Z',
      } as any;

      (enumMapper.mapToDomainPaymentStatus as jest.Mock).mockReturnValue(
        PaymentStatus.PENDING,
      );

      const result = PaymentMapper.toDomain(externalData);

      expect(result).not.toHaveProperty('updated_at');
    });
  });

  describe('toExternalService', () => {
    it('should map domain data to external service format with client data', () => {
      const data: CreatePaymentDto = {
        orderId: 123,
        amount: 150,
        description: 'Test payment',
        client: {
          name: 'John Doe',
          email: 'john@example.com',
          document: '123.456.789-00',
        },
        items: [
          {
            title: 'Product 1',
            quantity: 2,
            unit_price: 75,
          },
        ],
      } as any;

      const webhookUrl = 'https://webhook.url';

      (stringsUtils.splitNamePayment as jest.Mock).mockReturnValue({
        firstName: 'John',
        lastName: 'Doe',
      });
      (stringsUtils.removeMask as jest.Mock).mockReturnValue('12345678900');

      const result = PaymentMapper.toExternalService(data, webhookUrl);

      expect(result).toEqual({
        transaction_amount: 150,
        description: 'Test payment',
        payment_method_id: 'pix',
        payer: {
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          identification: {
            type: 'CPF',
            number: '12345678900',
          },
        },
        external_reference: '123',
        additional_info: {
          items: [
            {
              title: 'Product 1',
              quantity: 2,
              unit_price: 75,
            },
          ],
        },
        notification_url: webhookUrl,
      });

      expect(stringsUtils.splitNamePayment).toHaveBeenCalledWith('John Doe');
      expect(stringsUtils.removeMask).toHaveBeenCalledWith(
        '123.456.789-00',
        '999.999.999-99',
      );
    });

    it('should use mock payer when client data is not provided', () => {
      const data: CreatePaymentDto = {
        orderId: 123,
        amount: 150,
        description: 'Test payment',
        client: null,
        items: [],
      } as any;

      const webhookUrl = 'https://webhook.url';

      (stringsUtils.splitNamePayment as jest.Mock).mockReturnValue({
        firstName: 'Payer',
        lastName: 'Random',
      });
      (stringsUtils.removeMask as jest.Mock).mockReturnValue('33073132821');

      const result = PaymentMapper.toExternalService(data, webhookUrl);

      expect(result.payer?.email).toBe('payer.teste@gmail.com');
      expect(result.payer?.first_name).toBe('Payer');
      expect(result.payer?.last_name).toBe('Random');
      expect(stringsUtils.splitNamePayment).toHaveBeenCalledWith(
        'Payer Random',
      );
    });

    it('should use default description when not provided', () => {
      const data: CreatePaymentDto = {
        orderId: 456,
        amount: 200,
        client: null,
        items: [],
      } as any;

      const webhookUrl = 'https://webhook.url';

      (stringsUtils.splitNamePayment as jest.Mock).mockReturnValue({
        firstName: 'Payer',
        lastName: 'Random',
      });
      (stringsUtils.removeMask as jest.Mock).mockReturnValue('33073132821');

      const result = PaymentMapper.toExternalService(data, webhookUrl);

      expect(result.description).toBe('Payment for order #456');
    });

    it('should handle empty items array', () => {
      const data: CreatePaymentDto = {
        orderId: 123,
        amount: 150,
        description: 'Test payment',
        client: null,
        items: [],
      } as any;

      const webhookUrl = 'https://webhook.url';

      (stringsUtils.splitNamePayment as jest.Mock).mockReturnValue({
        firstName: 'Payer',
        lastName: 'Random',
      });
      (stringsUtils.removeMask as jest.Mock).mockReturnValue('33073132821');

      const result = PaymentMapper.toExternalService(data, webhookUrl);

      expect(result.additional_info.items).toEqual([]);
    });

    it('should handle undefined items', () => {
      const data: CreatePaymentDto = {
        orderId: 123,
        amount: 150,
        description: 'Test payment',
        client: null,
      } as any;

      const webhookUrl = 'https://webhook.url';

      (stringsUtils.splitNamePayment as jest.Mock).mockReturnValue({
        firstName: 'Payer',
        lastName: 'Random',
      });
      (stringsUtils.removeMask as jest.Mock).mockReturnValue('33073132821');

      const result = PaymentMapper.toExternalService(data, webhookUrl);

      expect(result.additional_info.items).toEqual([]);
    });

    it('should always use pix as payment method', () => {
      const data: CreatePaymentDto = {
        orderId: 123,
        amount: 150,
        client: null,
        items: [],
      } as any;

      const webhookUrl = 'https://webhook.url';

      (stringsUtils.splitNamePayment as jest.Mock).mockReturnValue({
        firstName: 'Payer',
        lastName: 'Random',
      });
      (stringsUtils.removeMask as jest.Mock).mockReturnValue('33073132821');

      const result = PaymentMapper.toExternalService(data, webhookUrl);

      expect(result.payment_method_id).toBe('pix');
    });
  });
});
