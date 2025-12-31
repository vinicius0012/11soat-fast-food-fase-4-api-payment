import { Injectable, OnModuleInit } from '@nestjs/common';
import { Db, Collection } from 'mongodb';
import { MongoService } from '../mongo.service';
import { PaymentDocument, Client, PaymentItem } from '../types/payment.types';

export interface CreatePaymentParams {
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
  items: PaymentItem[];
  callbackUrl?: string;
}

@Injectable()
export class PaymentRepository implements OnModuleInit {
  private db: Db;
  private collection: Collection<PaymentDocument>;

  constructor(private readonly mongoService: MongoService) {}

  onModuleInit(): void {
    this.db = this.mongoService.getDb();
    this.collection = this.db.collection<PaymentDocument>('Payments');
    // Fire and forget index creation
    void this.createIndexes();
  }

  private async createIndexes(): Promise<void> {
    try {
      await this.collection.createIndex({ transactionId: 1 }, { unique: true });
      await this.collection.createIndex({ orderId: 1 });
      await this.collection.createIndex({ id: 1 }, { unique: true });
      console.log('MongoDB indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  private async getNextId(): Promise<number> {
    const lastPayment = await this.collection
      .find()
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    return lastPayment.length > 0 ? (lastPayment[0].id ?? 0) + 1 : 1;
  }

  async create(data: CreatePaymentParams): Promise<PaymentDocument> {
    const id = await this.getNextId();
    const payment: PaymentDocument = {
      id,
      transactionId: data.transactionId,
      qrCodeBase64: data.qrCodeBase64,
      qrCodeString: data.qrCodeString,
      urlPayment: data.urlPayment,
      amount: data.amount,
      description: data.description,
      expirationDate: data.expirationDate,
      client: data.client,
      status: data.status,
      orderId: data.orderId,
      items: data.items,
      callbackUrl: data.callbackUrl,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.collection.insertOne(payment);
    return payment;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<PaymentDocument | null> {
    const result = await this.collection.findOne({ transactionId });
    return result;
  }

  async findByOrderId(orderId: number): Promise<PaymentDocument | null> {
    const result = await this.collection.findOne({ orderId });
    return result;
  }

  async findById(id: number): Promise<PaymentDocument | null> {
    const result = await this.collection.findOne({ id });
    return result;
  }

  async updateStatus(
    transactionId: string,
    status: string,
  ): Promise<PaymentDocument | null> {
    const result = await this.collection.findOneAndUpdate(
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
    const result = await this.collection.findOneAndUpdate(
      { transactionId },
      { $set: { ...updates, updated_at: new Date() } },
      { returnDocument: 'after' },
    );
    return result ?? null;
  }

  async findAll(): Promise<PaymentDocument[]> {
    const result = await this.collection
      .find()
      .sort({ created_at: -1 })
      .toArray();
    return result;
  }

  async delete(transactionId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ transactionId });
    return (result.deletedCount ?? 0) > 0;
  }
}
