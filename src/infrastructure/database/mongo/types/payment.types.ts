import { ObjectId } from 'mongodb';

export interface Client {
  id: number;
  name: string;
  email?: string;
  document: string;
}

export interface PaymentItems {
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

export interface PaymentDocument {
  _id?: ObjectId;
  transactionId: string;
  qrCodeBase64?: string;
  qrCodeString?: string;
  urlPayment: string;
  amount: number;
  description?: string;
  expirationDate?: Date;
  client?: Client | null;
  status: string;
  orderId: number;
  items: PaymentItems[];
  callbackUrl?: string;
  created_at: Date;
  updated_at?: Date;
}

export const CollectionNames = {
  Payments: 'payments',
} as const;
