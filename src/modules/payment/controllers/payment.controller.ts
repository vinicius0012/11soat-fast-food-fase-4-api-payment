import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentEntity } from 'src/application/domain/entities/payment/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { WebhookGuard } from 'src/infrastructure/guards/webhook.guard';
import { PaymentStatusResponse } from 'src/application/domain/dtos/payment/payment.db.interface';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from 'src/infrastructure/gateways/payment/payment.gateway';
import { PaymentController as CleanArchPaymentController } from 'src/application/controllers/payment/payment.controller';
import { MongoService } from 'src/infrastructure/database/mongo/mongo.service';
import { PaymentRepository } from 'src/infrastructure/database/mongo/repositories/payment.repository';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  private cleanArchController: CleanArchPaymentController;

  constructor(
    private readonly configService: ConfigService,
    private readonly mongoService: MongoService,
  ) {
    const paymentRepository = new PaymentRepository(this.mongoService);

    const paymentGateway = new PaymentGateway(
      this.configService,
      paymentRepository,
    );

    this.cleanArchController = new CleanArchPaymentController(paymentGateway);
  }

  @Post('create')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cria um novo pagamento' })
  @ApiBody({
    type: CreatePaymentDto,
    description: 'Dados necessários para criar um pagamento',
  })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentEntity> {
    return await this.cleanArchController.createPayment(createPaymentDto);
  }

  @Get('status/:transactionId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Consulta o status de um pagamento' })
  @ApiParam({
    name: 'transactionId',
    type: String,
    description: 'ID da transação do pagamento',
    example: 'abc123def456',
  })
  async getPaymentStatus(
    @Param('transactionId') transactionId: string,
  ): Promise<PaymentStatusResponse> {
    return await this.cleanArchController.getPaymentStatus(transactionId);
  }

  @Post('update/status/:transactionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Endpoint para receber webhooks do provedor de pagamento',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados do webhook inválidos',
  })
  async updateStatusPayment(
    @Param('transactionId') transactionId: string,
  ): Promise<{ message: string; result?: any }> {
    try {
      return await this.cleanArchController.updatePaymentStatus(transactionId);
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw new HttpException(
        'Erro ao processar webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('cancel/:transactionId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancela um pagamento existente' })
  @ApiParam({
    name: 'transactionId',
    type: String,
    description: 'ID da transação de pagamento a ser cancelada',
    example: 'abc123def456',
  })
  async cancelPayment(
    @Param('transactionId') transactionId: string,
  ): Promise<{ message: string }> {
    return await this.cleanArchController.cancelPayment(transactionId);
  }

  @Post('webhook')
  @UseGuards(WebhookGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Endpoint para processar webhooks de pagamento',
  })
  async processWebhook(
    @Body() payload: any,
  ): Promise<{ message: string; result?: any }> {
    try {
      return await this.cleanArchController.processWebhook(payload);
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw new HttpException(
        'Erro ao processar webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
