import { Injectable } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { MongoService } from '../mongo.service';
import {
  PaymentDocument,
  Client,
  PaymentItems,
  CollectionNames,
} from '../types/payment.types';

export interface CreatePaymentParams {
  transactionId: string;
  qrCodeBase64?: string;
  qrCodeString?: string;
  urlPayment: string;
  amount: number;
  description?: string | null;
  expirationDate?: Date;
  client?: Client | null;
  status: string;
  orderId: number;
  items: PaymentItems[];
  callbackUrl?: string;
}

@Injectable()
export class PaymentRepository {
  constructor(private readonly mongoService: MongoService) {}

  private getDb(): Db {
    return this.mongoService.getDb();
  }

  private getCollection(): Collection<PaymentDocument> {
    return this.getDb().collection<PaymentDocument>(CollectionNames.Payments);
  }

  async create(data: CreatePaymentParams): Promise<PaymentDocument> {
    const payment: PaymentDocument = {
      transactionId: data.transactionId,
      qrCodeBase64: data.qrCodeBase64,
      qrCodeString: data.qrCodeString,
      urlPayment: data.urlPayment,
      amount: data.amount,
      ...(!!data?.description && { description: data.description }),
      expirationDate: data.expirationDate,
      client: data.client,
      status: data.status,
      orderId: data.orderId,
      items: data.items,
      callbackUrl: data.callbackUrl,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.getCollection().insertOne(payment);
    return payment;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<PaymentDocument | null> {
    const result = await this.getCollection().findOne({ transactionId });
    return result;
  }

  async findByOrderId(orderId: number): Promise<PaymentDocument | null> {
    const result = await this.getCollection().findOne({ orderId });
    return result;
  }

  async findById(id: number): Promise<PaymentDocument | null> {
    const result = await this.getCollection().findOne({ id });
    return result;
  }

  async updateStatus(
    transactionId: string,
    status: string,
  ): Promise<PaymentDocument | null> {
    const result = await this.getCollection().findOneAndUpdate(
      { transactionId },
      { $set: { status, updated_at: new Date() } },
      { returnDocument: 'after' },
    );
    return result ?? null;
  }

  async update(
    transactionId: string,
    updates: Partial<PaymentDocument>,
  ): Promise<PaymentDocument | null> {
    const result = await this.getCollection().findOneAndUpdate(
      { transactionId },
      { $set: { ...updates, updated_at: new Date() } },
      { returnDocument: 'after' },
    );
    return result ?? null;
  }

  async findAll(): Promise<PaymentDocument[]> {
    const result = await this.getCollection()
      .find()
      .sort({ created_at: -1 })
      .toArray();
    return result;
  }

  async delete(transactionId: string): Promise<boolean> {
    const result = await this.getCollection().deleteOne({ transactionId });
    return result.acknowledged;
  }
}
