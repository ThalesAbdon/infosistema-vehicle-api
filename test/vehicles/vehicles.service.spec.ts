import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { VehiclesService } from 'src/modules/vehicles/application/vehicles.service';
import { Vehicle } from 'src/modules/vehicles/domain/entities/vehicle.entity';
import { FilterVehicleDto } from 'src/modules/vehicles/dto/filter-vehicle.dto';
import { VEHICLE_REPOSITORY } from 'src/modules/vehicles/domain/repositories/vehicle.repository';
import { VehicleMapper } from 'src/modules/vehicles/mappers/vehicle.mapper';

describe('VehiclesService (unit)', () => {
  let service: VehiclesService;
  let repository: any;

  const mockVehicle: Vehicle = new Vehicle(
    'ABC1F45',
    '9BWZZZ377VT004251',
    '12345678900',
    'Civic',
    'Honda',
    2020,
    new Types.ObjectId().toHexString(),
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const repoMock = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByField: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: VEHICLE_REPOSITORY,
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get(VEHICLE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um veículo se não houver conflitos', async () => {
    repository.findByField.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockVehicle);

    const result = await service.create({
      placa: mockVehicle.placa,
      chassi: mockVehicle.chassi,
      renavam: mockVehicle.renavam,
      modelo: mockVehicle.modelo,
      marca: mockVehicle.marca,
      ano: mockVehicle.ano,
    });

    expect(result).toMatchObject(VehicleMapper.toResponse(mockVehicle));
    expect(repository.create).toHaveBeenCalled();
  });

  it('deve lançar ConflictException se placa já existir', async () => {
    repository.findByField.mockImplementation((field) => {
      return field === 'placa' ? mockVehicle : null;
    });

    await expect(
      service.create({
        placa: mockVehicle.placa,
        chassi: 'outro',
        renavam: 'outro',
        modelo: 'Focus',
        marca: 'Ford',
        ano: 2021,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve buscar um veículo por ID válido', async () => {
    repository.findById.mockResolvedValue(mockVehicle);
    const result = await service.findOne(mockVehicle.id!);
    expect(result).toMatchObject(VehicleMapper.toResponse(mockVehicle));
  });

  it('deve lançar NotFoundException para ID inválido', async () => {
    await expect(service.findOne('id-invalido')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve lançar NotFoundException se veículo não existir', async () => {
    repository.findById.mockImplementation(() => {
      throw new NotFoundException();
    });

    await expect(
      service.findOne(new Types.ObjectId().toHexString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar um veículo existente', async () => {
    repository.findByField.mockResolvedValue(null);
    repository.update.mockResolvedValue({
      ...mockVehicle,
      modelo: 'Atualizado',
    });

    const result = await service.update(mockVehicle.id!, {
      modelo: 'Atualizado',
    });

    expect(result.modelo).toBe('Atualizado');
  });

  it('deve lançar ConflictException se renavam em conflito ao atualizar', async () => {
    repository.findByField.mockImplementation((field) => {
      return field === 'renavam' ? mockVehicle : null;
    });

    await expect(
      service.update(mockVehicle.id!, { renavam: mockVehicle.renavam }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve lançar BadRequestException se o ID for inválido no update', async () => {
    await expect(
      service.update('invalido', { modelo: 'Fusion' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve deletar um veículo', async () => {
    repository.delete.mockResolvedValue(undefined);
    await expect(service.remove(mockVehicle.id!)).resolves.toBeUndefined();
  });

  it('deve lançar NotFoundException ao tentar deletar um ID inexistente', async () => {
    repository.delete.mockImplementation(() => {
      throw new NotFoundException();
    });

    await expect(service.remove(mockVehicle.id!)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve aplicar todos os filtros corretamente', async () => {
    const query: FilterVehicleDto = {
      page: 1,
      limit: 10,
      placa: 'ABC',
      chassi: '9BWZZZ377VT004251',
      renavam: '12345678900',
      modelo: 'Civic',
      marca: 'Honda',
      ano: 2020,
    };

    repository.count.mockResolvedValue(1);
    repository.find.mockResolvedValue([mockVehicle]);

    const result = await service.findAll(query);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('deve usar os valores padrão de paginação se page e limit não forem informados', async () => {
    const query = {
      placa: 'XYZ',
    };

    repository.count.mockResolvedValue(1);
    repository.find.mockResolvedValue([mockVehicle]);

    const result = await service.findAll(query as any);

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.data).toHaveLength(1);
    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        placa: expect.any(Object),
      }),
      1,
      10,
    );
  });

  it('deve lançar BadRequestException se página for maior que o total', async () => {
    repository.count.mockResolvedValue(1);

    await expect(service.findAll({ page: 10, limit: 10 })).rejects.toThrow(
      BadRequestException,
    );
  });
});
