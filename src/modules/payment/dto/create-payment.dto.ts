import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PaymentClient {
  id: number;
  name: string;
  email: string;
  document: string;
}

class PaymentItems {
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

  @ApiPropertyOptional({
    description: 'Cliente do pagamento',
    example: {
      id: 12345,
      name: 'John Doe',
      email: 'john.doe@example.com',
      document: '1234567890',
    },
  })
  @IsObject()
  @IsOptional()
  client?: PaymentClient | null;

  @ApiPropertyOptional({
    description: 'Itens do pagamento',
    example: [
      {
        id: '12345',
        title: 'Item 1',
        description: 'Descrição do item 1',
        picture_url: 'https://example.com/item1.jpg',
        category_id: '1234567890',
        quantity: 1,
        unit_price: 100,
        type: 'product',
        event_date: '2026-01-01',
        warranty: true,
      },
    ],
  })
  @IsArray()
  @IsOptional()
  items?: PaymentItems[];
}
