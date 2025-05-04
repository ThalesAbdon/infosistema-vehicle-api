import { ApiProperty } from '@nestjs/swagger';
import { VehicleDocument } from '../schemas/vehicle.schema';

export class VehicleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  placa: string;

  @ApiProperty()
  chassi: string;

  @ApiProperty()
  renavam: string;

  @ApiProperty()
  modelo: string;

  @ApiProperty()
  marca: string;

  @ApiProperty()
  ano: number;

  @ApiProperty({ example: '03/05/2025 10:14:22' })
  createdAt: string;

  @ApiProperty({ example: '03/05/2025 10:14:22' })
  updatedAt: string;

  static fromEntity(entity: VehicleDocument): VehicleResponseDto {
    return {
      id: String(entity._id),
      placa: entity.placa,
      chassi: entity.chassi,
      renavam: entity.renavam,
      modelo: entity.modelo,
      marca: entity.marca,
      ano: entity.ano,
      createdAt: new Date(entity.createdAt).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      updatedAt: new Date(entity.updatedAt).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
    };
  }
}
