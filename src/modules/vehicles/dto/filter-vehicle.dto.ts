import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterVehicleDto {
  @ApiPropertyOptional({
    example: 'corolla',
    description: 'Campo único de busca (placa, chassi, modelo, etc.)',
  })
  @IsOptional()
  @IsString()
  search?: string;

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
