import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty()
  _id: unknown;

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
  createdAt: Date;

  @ApiProperty({ example: '03/05/2025 10:14:22' })
  updatedAt: Date;
}
