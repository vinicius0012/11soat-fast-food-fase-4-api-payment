import { mapToDomainPaymentStatus } from './enum-mapper.util';
import {
  PaymentExternalStatus,
  PaymentStatus,
} from 'src/application/domain/value-objects/payment/payment.status.enum';

describe('enum-mapper.util', () => {
  describe('mapToDomainPaymentStatus', () => {
    it('should map APPROVED to PAID', () => {
      const result = mapToDomainPaymentStatus(PaymentExternalStatus.APPROVED);
      expect(result).toBe(PaymentStatus.PAID);
    });

    it('should map CANCELLED to CANCELED', () => {
      const result = mapToDomainPaymentStatus(PaymentExternalStatus.CANCELLED);
      expect(result).toBe(PaymentStatus.CANCELED);
    });

    it('should map REJECTED to FAILED', () => {
      const result = mapToDomainPaymentStatus(PaymentExternalStatus.REJECTED);
      expect(result).toBe(PaymentStatus.FAILED);
    });

    it('should map EXPIRED to EXPIRED', () => {
      const result = mapToDomainPaymentStatus(PaymentExternalStatus.EXPIRED);
      expect(result).toBe(PaymentStatus.EXPIRED);
    });

    it('should map PENDING to PENDING', () => {
      const result = mapToDomainPaymentStatus(PaymentExternalStatus.PENDING);
      expect(result).toBe(PaymentStatus.PENDING);
    });

    it('should map any unknown status to PENDING', () => {
      const result = mapToDomainPaymentStatus(
        'unknown' as PaymentExternalStatus,
      );
      expect(result).toBe(PaymentStatus.PENDING);
    });

    it('should handle all external status values', () => {
      const mappings = [
        {
          external: PaymentExternalStatus.APPROVED,
          domain: PaymentStatus.PAID,
        },
        {
          external: PaymentExternalStatus.CANCELLED,
          domain: PaymentStatus.CANCELED,
        },
        {
          external: PaymentExternalStatus.REJECTED,
          domain: PaymentStatus.FAILED,
        },
        {
          external: PaymentExternalStatus.EXPIRED,
          domain: PaymentStatus.EXPIRED,
        },
        {
          external: PaymentExternalStatus.PENDING,
          domain: PaymentStatus.PENDING,
        },
      ];

      mappings.forEach(({ external, domain }) => {
        expect(mapToDomainPaymentStatus(external)).toBe(domain);
      });
    });
  });
});
