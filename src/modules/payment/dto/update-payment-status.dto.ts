import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UptadePaymentStatusDto {
  @ApiProperty({
    description: 'Descrição do pagamento',
    example: 'Pedido #12345 - Combo Especial',
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;
}
