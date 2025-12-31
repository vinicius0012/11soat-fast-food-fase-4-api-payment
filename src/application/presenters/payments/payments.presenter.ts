import {
  PaymentDtoResponse,
  PaymentStatusResponse,
} from '../../domain/dtos/payment/payment.db.interface';
import { PaymentEntity } from '../../domain/entities/payment/payment.entity';

export class PaymentPresenter {
  static toHttp(entity: PaymentEntity): PaymentDtoResponse {
    return {
      ...entity,
    };
  }

  static toHttpStatusPayment(
    payment: PaymentStatusResponse,
  ): PaymentStatusResponse {
    return payment;
  }
}
