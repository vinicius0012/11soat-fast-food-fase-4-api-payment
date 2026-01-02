import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentItemsDto {
  @ApiProperty({
    description: 'ID do item',
    example: '12345',
  })
  @IsNumber()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Título do item',
    example: 'Item 1',
  })
  @IsString()
  @IsNotEmpty()
  title: string | null;

  @ApiPropertyOptional({
    description: 'Descrição do item',
    example: 'Descrição do item 1',
  })
  @IsNumber()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    description: 'URL da imagem do item',
    example: 'https://example.com/item1.jpg',
  })
  @IsString()
  @IsOptional()
  picture_url: string;

  @ApiPropertyOptional({
    description: 'ID da categoria do item',
    example: '1234567890',
  })
  @IsNumber()
  @IsOptional()
  category_id: string;

  @ApiPropertyOptional({
    description: 'Quantidade do item',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Preço unitário do item',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  unit_price: number;

  @ApiPropertyOptional({
    description: 'Tipo do item',
    example: 'product',
  })
  @IsString()
  @IsOptional()
  type: string;

  @ApiPropertyOptional({
    description: 'Data do evento do item',
    example: '2026-01-01',
  })
  @IsString()
  @IsOptional()
  event_date: string;

  @ApiPropertyOptional({
    description: 'Garantia do item',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  warranty: boolean;
}
