import { Vehicle } from '../domain/entities/vehicle.entity';
import { VehicleDocument } from '../infrastructure/mongoose/vehicle.schema';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';

export class VehicleMapper {
  static toDomain(doc: VehicleDocument): Vehicle {
    return new Vehicle(
      doc.placa,
      doc.chassi,
      doc.renavam,
      doc.modelo,
      doc.marca,
      doc.ano,
      String(doc._id),
      doc.createdAt,
      doc.updatedAt,
    );
  }

  static toPersistence(vehicle: Vehicle): any {
    return {
      placa: vehicle.placa,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      modelo: vehicle.modelo,
      marca: vehicle.marca,
      ano: vehicle.ano,
    };
  }

  static toResponse(vehicle: Vehicle): VehicleResponseDto {
    return {
      id: vehicle.id!,
      placa: vehicle.placa,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      modelo: vehicle.modelo,
      marca: vehicle.marca,
      ano: vehicle.ano,
      createdAt: new Date(vehicle.createdAt!).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      updatedAt: new Date(vehicle.updatedAt!).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
    };
  }
}
