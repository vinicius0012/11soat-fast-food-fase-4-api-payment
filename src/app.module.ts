import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { APP_FILTER } from '@nestjs/core';
import { HealthController } from './modules/health/health.controller';
import { GlobalExceptionFilter } from './infrastructure/shared/exceptions/global.exception.filter';
import { PaymentModule } from './modules/payment/payment.module';
import { MongoModule } from './infrastructure/database/mongo/mongo.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      load: [configuration],
    }),
    MongoModule,
    PaymentModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
