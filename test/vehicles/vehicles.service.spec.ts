import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from '../../src/vehicles/application/vehicles.service';
import { getModelToken } from '@nestjs/mongoose';
import { VehicleModel } from '../../src/vehicles/schemas/vehicle.schema';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Vehicle } from '../../src/vehicles/domain/entities/vehicle.entity';
import { Types } from 'mongoose';
import { FilterVehicleDto } from '../../src/vehicles/dto/filter-vehicle.dto';

describe('VehiclesService (unit)', () => {
  let service: VehiclesService;
  let model: any;

  const mockVehicle: Vehicle = {
    placa: 'ABC1F45',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678900',
    modelo: 'Civic',
    marca: 'Honda',
    ano: 2020,
    id: new Types.ObjectId().toHexString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getModelToken(VehicleModel.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    model = module.get(getModelToken(VehicleModel.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar um veículo se não houver conflitos', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    model.create.mockResolvedValue({ ...mockVehicle });

    const result = await service.create({
      placa: mockVehicle.placa,
      chassi: mockVehicle.chassi,
      renavam: mockVehicle.renavam,
      modelo: mockVehicle.modelo,
      marca: mockVehicle.marca,
      ano: mockVehicle.ano,
    });

    expect(result).toMatchObject({
      placa: 'ABC1F45',
      modelo: 'Civic',
      marca: 'Honda',
    });

    expect(model.create).toHaveBeenCalled();
  });

  it('deve lançar ConflictException se placa já existir', async () => {
    model.findOne.mockImplementation(({ placa }: any) => ({
      exec: jest
        .fn()
        .mockResolvedValue(placa === mockVehicle.placa ? mockVehicle : null),
    }));

    await expect(
      service.create({
        placa: mockVehicle.placa,
        chassi: 'DIFERENTE',
        renavam: 'DIFERENTE',
        modelo: 'Focus',
        marca: 'Ford',
        ano: 2021,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve buscar um veículo por ID válido', async () => {
    model.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockVehicle),
    });

    const result = await service.findOne(mockVehicle.id!);
    expect(result.placa).toBe('ABC1F45');
  });

  it('deve lançar NotFoundException para ID inválido', async () => {
    await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException se veículo não existir', async () => {
    model.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(
      service.findOne(new Types.ObjectId().toHexString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar um veículo existente', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    model.findByIdAndUpdate.mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValue({ ...mockVehicle, modelo: 'Atualizado' }),
    });

    const result = await service.update(mockVehicle.id!, {
      modelo: 'Atualizado',
    });

    expect(result.modelo).toBe('Atualizado');
  });

  it('deve atualizar sem erros mesmo se alguns campos únicos não forem passados', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    model.findByIdAndUpdate.mockReturnValue({
      exec: jest
        .fn()
        .mockResolvedValue({ ...mockVehicle, modelo: 'Atualizado' }),
    });

    const result = await service.update(mockVehicle.id!, {
      modelo: 'Atualizado',
    });

    expect(result.modelo).toBe('Atualizado');
  });

  it('deve retornar conflito apenas de renavam ao atualizar', async () => {
    model.findOne.mockImplementation((query: any) => {
      const key = Object.keys(query)[0];
      if (key === 'renavam') {
        return { exec: jest.fn().mockResolvedValue(mockVehicle) };
      }
      return { exec: jest.fn().mockResolvedValue(null) };
    });

    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn(),
    });

    await expect(
      service.update(mockVehicle.id!, {
        renavam: mockVehicle.renavam,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve lançar BadRequestException se o ID for inválido no update', async () => {
    const invalidId = 'nao-é-objectid';

    await expect(
      service.update(invalidId, {
        modelo: 'Fusion',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar NotFoundException ao tentar atualizar um ID inexistente', async () => {
    model.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.update(new Types.ObjectId().toHexString(), {
        modelo: 'X',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve deletar um veículo', async () => {
    model.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockVehicle),
    });

    await expect(service.remove(mockVehicle.id!)).resolves.toBeUndefined();
  });

  it('deve lançar NotFoundException ao tentar deletar um ID inexistente', async () => {
    model.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.remove(mockVehicle.id!)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve aplicar todos os filtros corretamente', async () => {
    const query = {
      page: 1,
      limit: 10,
      placa: 'ABC',
      chassi: 'CH123',
      renavam: '12345678900',
      modelo: 'Civic',
      marca: 'Honda',
      ano: 2020,
    };

    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    model.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockVehicle]),
    });

    const result = await service.findAll(query);

    expect(result.data).toHaveLength(1);
    expect(model.countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        placa: expect.any(Object),
        chassi: 'CH123',
        renavam: '12345678900',
        modelo: 'Civic',
        marca: 'Honda',
        ano: 2020,
      }),
    );
  });

  it('deve usar os valores padrão de paginação se page e limit não forem informados', async () => {
    const query = {
      placa: 'XYZ',
    };

    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    model.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockVehicle]),
    });

    const result = await service.findAll(query as any);

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('deve retornar veículos com paginação', async () => {
    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    model.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockVehicle]),
    });

    const result = await service.findAll({
      page: 1,
      limit: 10,
    } as FilterVehicleDto);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });

  it('deve lançar BadRequestException se página for maior que o total', async () => {
    model.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(3),
    });

    await expect(
      service.findAll({ page: 5, limit: 10 } as FilterVehicleDto),
    ).rejects.toThrow(BadRequestException);
  });
});
