import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Valor do pagamento',
    example: 150.75,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Descrição do pagamento',
    example: 'Pedido #12345 - Combo Especial',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'ID do pedido associado ao pagamento',
    example: 12345,
  })
  @IsNumber()
  @IsOptional()
  orderId?: number;

  @ApiPropertyOptional({
    description: 'URL de callback para notificações de status',
    example: 'https://seusite.com/pagamento/callback',
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;

  @ApiPropertyOptional({
    description: 'Tempo de expiração do pagamento (em minutos)',
    example: 30,
  })
  @IsNumber()
  @IsOptional()
  expirationMinutes?: number;
}
