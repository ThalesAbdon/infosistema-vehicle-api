import { IsString, IsInt, Min, Matches } from 'class-validator';
import { MaxCurrentYear } from '../../common/validators/max-current-year.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'BRA2E19', description: 'Placa do veículo' })
  @IsString({ message: 'A placa deve ser uma string' })
  @Matches(/^[A-Z]{3}(?:[0-9]{4}|[0-9][A-Z][0-9]{2})$/, {
    message:
      'A placa deve seguir o padrão antigo (ABC1234) ou Mercosul (ABC1D23)',
  })
  placa: string;

  @ApiProperty({
    example: '9BWZZZ377VT004251',
    description: 'Número do chassi',
  })
  @IsString({ message: 'O chassi deve ser uma string' })
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message:
      'O chassi deve conter exatamente 17 caracteres alfanuméricos válidos, sem I, O ou Q.',
  })
  chassi: string;

  @ApiProperty({
    example: '12345678900',
    description: 'Número do renavam com 11 dígitos',
  })
  @IsString({ message: 'O renavam deve ser uma string' })
  @Matches(/^\d{11}$/, {
    message: 'Renavam deve conter exatamente 11 dígitos numéricos',
  })
  renavam: string;

  @ApiProperty({ example: 'Civic', description: 'Modelo do veículo' })
  @IsString({ message: 'O modelo deve ser uma string' })
  modelo: string;

  @ApiProperty({ example: 'Honda', description: 'Marca do veículo' })
  @IsString({ message: 'A marca deve ser uma string' })
  marca: string;

  @ApiProperty({ example: 2020, description: 'Ano de fabricação' })
  @IsInt({ message: 'O ano deve ser um número inteiro' })
  @Min(1886, { message: 'O ano mínimo permitido é 1886' })
  @MaxCurrentYear({ message: 'O ano não pode ser maior que o ano atual' })
  ano: number;
}
