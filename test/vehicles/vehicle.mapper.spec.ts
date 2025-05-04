import { Vehicle } from 'src/modules/vehicles/domain/entities/vehicle.entity';
import { VehicleDocument } from 'src/modules/vehicles/infrastructure/mongoose/vehicle.schema';
import { VehicleMapper } from 'src/modules/vehicles/mappers/vehicle.mapper';

describe('VehicleMapper', () => {
  const vehicleDocMock = {
    _id: '507f191e810c19729de860ea',
    placa: 'ABC1D23',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678901',
    modelo: 'Civic',
    marca: 'Honda',
    ano: 2021,
    createdAt: new Date('2024-01-01T12:00:00Z'),
    updatedAt: new Date('2024-01-02T12:00:00Z'),
  } as VehicleDocument;

  const domainMock = new Vehicle(
    vehicleDocMock.placa,
    vehicleDocMock.chassi,
    vehicleDocMock.renavam,
    vehicleDocMock.modelo,
    vehicleDocMock.marca,
    vehicleDocMock.ano,
    String(vehicleDocMock._id),
    vehicleDocMock.createdAt,
    vehicleDocMock.updatedAt,
  );

  it('deve mapear de VehicleDocument para domínio', () => {
    const result = VehicleMapper.toDomain(vehicleDocMock);
    expect(result).toBeInstanceOf(Vehicle);
    expect(result.id).toBe(vehicleDocMock._id);
    expect(result.modelo).toBe('Civic');
  });

  it('deve mapear de domínio para persistência (Mongo)', () => {
    const result = VehicleMapper.toPersistence(domainMock);
    expect(result).toEqual({
      placa: 'ABC1D23',
      chassi: '9BWZZZ377VT004251',
      renavam: '12345678901',
      modelo: 'Civic',
      marca: 'Honda',
      ano: 2021,
    });
  });

  it('deve mapear de domínio para response DTO', () => {
    const result = VehicleMapper.toResponse(domainMock);
    expect(result).toHaveProperty('id', vehicleDocMock._id);
    expect(result).toHaveProperty('createdAt');
    expect(result.modelo).toBe('Civic');
  });
});
