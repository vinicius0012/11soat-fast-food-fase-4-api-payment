import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientPaymentDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: 12345,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'Nome do cliente',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Email do cliente',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Documento do cliente',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  document: string;
}
