import {
  CreatePaymentDto,
  PaymentDtoResponse,
  PaymentExternalResponseDataInterface,
  PaymentExternalSentDataInterface,
} from 'src/application/domain/dtos/payment/payment.db.interface';
import {
  removeMask,
  splitNamePayment,
} from 'src/infrastructure/shared/utils/strings.utils';
import { mapToDomainPaymentStatus } from '../enum-mapper.util';
import { PaymentExternalStatus } from 'src/application/domain/value-objects/payment/payment.status.enum';

const mockRandomPayer = {
  email: 'payer.teste@gmail.com',
  name: 'Payer Random',
  document: '330.731.328-21',
};

export class PaymentMapper {
  /**
   * Maps the external payment response data to a domain payment response object.
   *
   * @param data - The external payment response data.
   * @param createData - The original create payment data.
   * @returns A domain payment response object.
   */
  static toDomain(
    data: PaymentExternalResponseDataInterface,
  ): PaymentDtoResponse {
    return {
      id: data.id,
      orderId: data.orderId ?? Number(data.external_reference),
      transactionId: data.id.toString(),
      status: mapToDomainPaymentStatus(data.status as PaymentExternalStatus),
      amount: data.transaction_amount,
      urlPayment: data.point_of_interaction?.transaction_data?.ticket_url ?? '',
      items: data.items,
      qrCodeString: data.point_of_interaction?.transaction_data?.qr_code ?? '',
      qrCodeBase64:
        data.point_of_interaction?.transaction_data?.qr_code_base64 ?? '',
      expirationDate: data.date_of_expiration
        ? new Date(data.date_of_expiration)
        : undefined,
      client: data.client,
      created_at: new Date(data.date_created),
      ...(!!data?.date_updated && {
        updated_at: new Date(data.date_updated),
      }),
    };
  }

  /**
   * Converts the CreatePaymentDto data to an external service format.
   *
   * @param data - The payment creation data.
   * @returns A formatted object for the external payment service.
   */
  static toExternalService(
    data: CreatePaymentDto,
    webhookUrl: string,
  ): PaymentExternalSentDataInterface {
    const client = data.client ?? mockRandomPayer;
    const { firstName, lastName } = splitNamePayment(client?.name ?? '');
    const formattedDocument = removeMask(
      client?.document ?? '',
      '999.999.999-99',
    );

    return {
      transaction_amount: data.amount,
      description: data.description || `Payment for order #${data.orderId}`,
      payment_method_id: 'pix',
      payer: {
        email: client?.email ?? '',
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: 'CPF',
          number: formattedDocument,
        },
      },
      external_reference: data.orderId?.toString() ?? '',
      additional_info: {
        items: data.items ?? [],
      },
      notification_url: webhookUrl,
    };
  }
}
