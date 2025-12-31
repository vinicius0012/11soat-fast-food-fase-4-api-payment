import {
  PaymentExternalStatus,
  PaymentStatus,
} from 'src/application/domain/value-objects/payment/payment.status.enum';

/**
 * Mapeia o status do pagamento para o status do domínio
 */
export function mapToDomainPaymentStatus(
  status: PaymentExternalStatus,
): PaymentStatus {
  switch (status) {
    case PaymentExternalStatus.APPROVED:
      return PaymentStatus.PAID;
    case PaymentExternalStatus.CANCELLED:
      return PaymentStatus.CANCELED;
    case PaymentExternalStatus.REJECTED:
      return PaymentStatus.FAILED;
    case PaymentExternalStatus.EXPIRED:
      return PaymentStatus.EXPIRED;
    default:
      return PaymentStatus.PENDING;
  }
}
