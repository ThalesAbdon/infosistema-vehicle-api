import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { VehiclesService } from 'src/modules/vehicles/application/vehicles.service';
import { VEHICLE_REPOSITORY } from 'src/modules/vehicles/domain/repositories/vehicle.repository';
import { VehicleEntity } from 'src/modules/vehicles/domain/entities/vehicle.entity';
import { VehicleResponseDto } from 'src/modules/vehicles/dto/vehicle-response.dto';
import { FilterVehicleDto } from 'src/modules/vehicles/dto/filter-vehicle.dto';
import { SqsProducerService } from 'src/shared/aws/sqs/sqs.producer.service';

describe('VehiclesService (unit)', () => {
  let service: VehiclesService;
  let repository: any;

  const mockVehicleEntity: VehicleEntity = new VehicleEntity({
    placa: 'ABC1F45',
    chassi: '9BWZZZ377VT004251',
    renavam: '12345678900',
    modelo: 'Civic',
    marca: 'Honda',
    ano: 2020,
    _id: new Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockVehicleResponse: VehicleResponseDto = {
    _id: mockVehicleEntity._id,
    placa: mockVehicleEntity.placa,
    chassi: mockVehicleEntity.chassi,
    renavam: mockVehicleEntity.renavam,
    modelo: mockVehicleEntity.modelo,
    marca: mockVehicleEntity.marca,
    ano: mockVehicleEntity.ano,
    createdAt: mockVehicleEntity.createdAt,
    updatedAt: mockVehicleEntity.updatedAt,
  };

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
        {
          provide: SqsProducerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get(VEHICLE_REPOSITORY);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve criar um veículo se não houver conflitos', async () => {
    repository.findByField.mockResolvedValue(null);
    repository.create.mockResolvedValue(mockVehicleResponse);

    const result = await service.create({ ...mockVehicleEntity });
    expect(result).toEqual(mockVehicleResponse);
  });

  it('deve lançar ConflictException se placa já existir', async () => {
    repository.findByField.mockImplementation(
      (field: string, value: string) => {
        if (field === 'placa' && value === mockVehicleEntity.placa) {
          return mockVehicleEntity;
        }
        return null;
      },
    );

    await expect(
      service.create({
        placa: mockVehicleEntity.placa,
        chassi: 'outra',
        renavam: 'outra',
        modelo: 'Corolla',
        marca: 'Toyota',
        ano: 2022,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve buscar um veículo por ID válido', async () => {
    repository.findById.mockResolvedValue(mockVehicleResponse);
    const result = await service.findOne(String(mockVehicleEntity._id));
    expect(result).toEqual(mockVehicleResponse);
  });

  it('deve lançar BadRequestException para ID inválido', async () => {
    await expect(service.findOne('123')).rejects.toThrow(BadRequestException);
  });

  it('deve atualizar um veículo existente', async () => {
    repository.findByField.mockResolvedValue(null);
    repository.update.mockResolvedValue({
      ...mockVehicleResponse,
      modelo: 'Atualizado',
    });

    const result = await service.update(String(mockVehicleEntity._id), {
      modelo: 'Atualizado',
    });

    expect(result.modelo).toBe('Atualizado');
  });

  it('deve lançar ConflictException se chassi em conflito ao atualizar', async () => {
    repository.findByField.mockImplementation((field: any) =>
      field === 'chassi' ? mockVehicleEntity : null,
    );

    await expect(
      service.update(String(mockVehicleEntity._id), {
        chassi: mockVehicleEntity.chassi,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve lançar BadRequestException para ID inválido no update', async () => {
    await expect(
      service.update('id-invalido', { modelo: 'X' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve deletar um veículo', async () => {
    repository.delete.mockResolvedValue(undefined);
    await expect(
      service.remove(String(mockVehicleEntity._id)),
    ).resolves.toBeUndefined();
  });

  it('deve lançar BadRequestException ao tentar deletar um ID inexistente', async () => {
    repository.delete.mockImplementation(() => {
      throw new NotFoundException();
    });

    await expect(service.remove(String(mockVehicleEntity._id))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve aplicar filtros de busca com regex e retornar dados', async () => {
    const query: FilterVehicleDto = { search: 'ABC', page: 1, limit: 10 };

    repository.count.mockResolvedValue(1);
    repository.find.mockResolvedValue([mockVehicleResponse]);

    const result = await service.findAll(query);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.lastPage).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('deve aplicar paginação padrão se page e limit não forem informados', async () => {
    const query = {
      search: 'Honda',
    };

    repository.count.mockResolvedValue(1);
    repository.find.mockResolvedValue([mockVehicleResponse]);

    const result = await service.findAll(query as any);

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.data).toHaveLength(1);
    expect(repository.find).toHaveBeenCalledWith(expect.any(Object), 1, 10);
  });

  it('deve incluir "ano" no filtro quando search for numérico', async () => {
    const query: FilterVehicleDto = {
      search: '2020',
    };

    repository.count.mockResolvedValue(1);
    repository.find.mockResolvedValue([mockVehicleEntity]);

    const result = await service.findAll(query);

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(repository.count).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([{ ano: 2020 }]),
      }),
    );
  });

  it('deve lançar BadRequestException se página solicitada for maior que o total', async () => {
    repository.count.mockResolvedValue(1);

    await expect(service.findAll({ page: 2, limit: 10 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve lançar BadRequestException com erro desconhecido em findAll', async () => {
    repository.count.mockImplementation(() => {
      throw Object.create(null);
    });

    await expect(service.findAll({})).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException com mensagem "Erro desconhecido" para erro desconhecido', async () => {
    repository.findByField.mockImplementation(() => {
      throw Object.create(null);
    });

    await expect(
      service.create({
        placa: 'AAA1234',
        chassi: 'BBBBB12345',
        renavam: '12345678901',
        modelo: 'Corolla',
        marca: 'Toyota',
        ano: 2022,
      }),
    ).rejects.toThrow('Erro desconhecido');
  });

  it('deve lançar BadRequestException com erro desconhecido em findOne', async () => {
    repository.findById.mockImplementation(() => {
      throw Object.create(null);
    });

    await expect(service.findOne('644bf40b9bfaec6e545b54ee')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve lançar BadRequestException com mensagem "Erro desconhecido" em update', async () => {
    repository.findByField.mockImplementation(() => {
      throw Object.create(null);
    });

    await expect(
      service.update('644bf40b9bfaec6e545b54ee', {
        placa: 'AAA1234',
      }),
    ).rejects.toThrow('Erro desconhecido');
  });

  it('deve lançar BadRequestException com mensagem "Erro desconhecido" se erro não for instanceof Error nem ConflictException em create', async () => {
    repository.findByField.mockResolvedValue(null);
    repository.create.mockImplementation(() => {
      throw Object.create(null);
    });

    await expect(
      service.create({
        placa: 'ZZZ1234',
        chassi: 'CHASSI123',
        renavam: 'RENAVAM123',
        modelo: 'Corolla',
        marca: 'Toyota',
        ano: 2022,
      }),
    ).rejects.toThrow('Erro desconhecido');
  });

  it('deve lançar BadRequestException com mensagem "Erro desconhecido" se erro não for instanceof Error nem ConflictException em create', async () => {
    repository.findByField.mockImplementation(() => {
      throw Object.create(null);
    });

    repository.create.mockImplementation(() => {
      throw new Error('NÃO deveria chamar create');
    });

    await expect(
      service.create({
        placa: 'XPTO999',
        chassi: 'CH999999',
        renavam: 'REN999999',
        modelo: 'Uno',
        marca: 'Fiat',
        ano: 2020,
      }),
    ).rejects.toThrow('Erro desconhecido');
  });

  it('deve lançar BadRequestException com erro desconhecido no método remove', async () => {
    repository.delete.mockImplementation(() => {
      throw Object.create(null); // <- não é instanceof Error
    });

    await expect(service.remove('644bf40b9bfaec6e545b54ee')).rejects.toThrow(
      BadRequestException,
    );
  });
});
