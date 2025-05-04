import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterVehicleDto {
  @ApiPropertyOptional({
    example: 'ABC',
    description: 'Busca por substring na placa',
  })
  @IsOptional()
  @IsString()
  placa?: string;

  @ApiPropertyOptional({ example: '9BWZZZ377VT004251' })
  @IsOptional()
  @IsString()
  chassi?: string;

  @ApiPropertyOptional({ example: '12345678900' })
  @IsOptional()
  @IsString()
  renavam?: string;

  @ApiPropertyOptional({ example: 'Civic' })
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiPropertyOptional({ example: 'Honda' })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'ano deve ser um número inteiro' })
  @Min(1886)
  ano?: number;

  @ApiPropertyOptional({ example: 1, description: 'Página atual' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'page deve ser um número inteiro' })
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade de itens por página',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'limit deve ser um número inteiro' })
  @Min(1)
  limit?: number;
}
