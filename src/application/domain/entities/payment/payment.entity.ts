import { PaymentStatus } from '../../value-objects/payment/payment.status.enum';

interface PyamentClientEntity {
  id: number;
  name: string;
  email?: string;
  document: string;
}

interface PaymentDataItem {
  id: string;
  title: string | null;
  description?: string | null;
  picture_url: string;
  category_id: string;
  quantity: number;
  unit_price: any;
  type: string;
  event_date: string;
  warranty: boolean;
}

export class PaymentEntity {
  id: number;
  transactionId: string;
  qrCodeBase64?: string;
  qrCodeString?: string;
  urlPayment: string;
  amount: number;
  description?: string | null;
  expirationDate?: Date;
  client?: PyamentClientEntity | null;
  status: PaymentStatus;
  created_at: Date;
  updated_at?: Date;
  orderId?: number;
  items?: PaymentDataItem[];
}
