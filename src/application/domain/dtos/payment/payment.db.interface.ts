import {
  PaymentExternalStatus,
  PaymentStatus,
} from '../../value-objects/payment/payment.status.enum';

interface PyamentClientEntity {
  id: number;
  name: string;
  email: string;
  document: string;
}

interface PaymentItems {
  id: string;
  title: string | null;
  description: string;
  picture_url: string;
  category_id: string;
  quantity: number;
  unit_price: number;
  type: string;
  event_date: string;
  warranty: boolean;
}

export interface CreatePaymentDto {
  amount: number;
  description?: string;
  orderId?: number;
  callbackUrl?: string;
  expirationMinutes?: number;
  client?: PyamentClientEntity | null;
  items?: PaymentItems[];
}

export interface PaymentDtoResponse {
  id: number;
  transactionId: string;
  qrCodeBase64?: string;
  qrCodeString?: string;
  urlPayment: string;
  amount: number;
  expirationDate?: Date;
  client?: PyamentClientEntity | null;
  status: string;
  created_at: Date;
  updated_at?: Date;
  orderId?: number;
  items?: PaymentDataItem[];
}

export interface PaymentExternalResponseDataInterface {
  id: number;
  orderId?: number;
  status: PaymentExternalStatus | string;
  transaction_amount: number;
  date_of_expiration?: string;
  date_created: string;
  date_updated: string;
  external_reference?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code_base64?: string;
      qr_code?: string;
      ticket_url?: string;
    };
  };
  additional_info: {
    items?: PaymentDataItem[];
    payer?: PaymentDataPayer;
  };
  client?: PyamentClientEntity | null;
}

export interface PaymentDataItem {
  id: string;
  title: string | null;
  description: string;
  picture_url: string;
  category_id: string;
  quantity: number;
  unit_price: any;
  type: string;
  event_date: string;
  warranty: boolean;
}

export interface PaymentDataPayerIdentification {
  type: string;
  number: string;
}

export interface PaymentDataPayer {
  email: string;
  first_name: string;
  last_name: string;
  identification: PaymentDataPayerIdentification;
}

export interface PaymentDataAdditionalInfo {
  items: PaymentDataItem[];
}

export interface PaymentExternalSentDataInterface {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer?: PaymentDataPayer;
  external_reference: string;
  additional_info: PaymentDataAdditionalInfo;
  notification_url: string;
}

export interface CheckPaymentStatusDto {
  transactionId: string;
}

export interface PaymentStatusResponse {
  id?: number;
  orderId: number;
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: Date;
}

export interface CancelPaymentDto {
  transactionId: string;
  reason?: string;
}

export interface ExternalReferenceDto {
  orderId: number;
  transactionId: string;
}

export interface PaymentStatusWithOrderResponse {
  transactionId?: number | null;
  status: PaymentStatus;
  items: PaymentItems[];
}

export interface UpdatePaymentStatus {
  transactionId: string;
  status: PaymentStatus;
}
