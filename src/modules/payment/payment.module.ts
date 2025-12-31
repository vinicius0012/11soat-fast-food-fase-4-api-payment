import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PaymentController } from './controllers/payment.controller';
import { PaymentGateway } from 'src/infrastructure/gateways/payment/payment.gateway';
import { CreatePaymentUseCase } from 'src/application/use-cases/payment/create-payment.use-case';
import { GetPaymentStatusUseCase } from 'src/application/use-cases/payment/get-payment-status.use-case';
import { CancelPaymentUseCase } from 'src/application/use-cases/payment/cancel-payment.use-case';
import { ProcessPaymentWebhookUseCase } from 'src/application/use-cases/payment/process-payment-webhook.use-case';
import { GetExternalReferenceByTransactionUseCase } from 'src/application/use-cases/payment/get-external-reference-by-transaction.use-cases';
import { PaymentServicePort } from 'src/application/ports/output/repositories/payment/payment.repository.interface';
import { PaymentRepository } from 'src/infrastructure/database/mongo/repositories/payment.repository';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecret'),
        signOptions: { expiresIn: configService.get<string>('expirationTime') },
      }),
    }),
  ],
  controllers: [PaymentController],
  providers: [
    ConfigService,
    JwtService,
    PaymentRepository,
    {
      provide: 'PaymentServicePort',
      useClass: PaymentGateway,
    },
    {
      provide: CreatePaymentUseCase,
      useFactory: (paymentService: PaymentServicePort) => {
        return new CreatePaymentUseCase(paymentService);
      },
      inject: ['PaymentServicePort'],
    },
    {
      provide: GetPaymentStatusUseCase,
      useFactory: (paymentService: PaymentServicePort) => {
        return new GetPaymentStatusUseCase(paymentService);
      },
      inject: ['PaymentServicePort'],
    },
    {
      provide: CancelPaymentUseCase,
      useFactory: (paymentService: PaymentServicePort) => {
        return new CancelPaymentUseCase(paymentService);
      },
      inject: ['PaymentServicePort'],
    },
    {
      provide: ProcessPaymentWebhookUseCase,
      useFactory: (paymentService: PaymentServicePort) => {
        return new ProcessPaymentWebhookUseCase(paymentService);
      },
      inject: ['PaymentServicePort'],
    },
    {
      provide: GetExternalReferenceByTransactionUseCase,
      useFactory: (paymentService: PaymentServicePort) => {
        return new GetExternalReferenceByTransactionUseCase(paymentService);
      },
      inject: ['PaymentServicePort'],
    },
  ],
  exports: [
    'PaymentServicePort',
    CreatePaymentUseCase,
    GetPaymentStatusUseCase,
    CancelPaymentUseCase,
    ProcessPaymentWebhookUseCase,
    GetExternalReferenceByTransactionUseCase,
  ],
})
export class PaymentModule {}
