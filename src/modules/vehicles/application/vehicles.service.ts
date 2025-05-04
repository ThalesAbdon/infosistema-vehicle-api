import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { FilterVehicleDto } from '../dto/filter-vehicle.dto';
import { Vehicle } from '../domain/entities/vehicle.entity';
import {
  VEHICLE_REPOSITORY,
  VehicleRepository,
} from '../domain/repositories/vehicle.repository';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';
import { VehicleMapper } from '../mappers/vehicle.mapper';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly repository: VehicleRepository,
  ) {}

  async create(data: Omit<Vehicle, 'id'>): Promise<VehicleResponseDto> {
    const conflicts = await this.validateUniqueFields(data);

    if (Object.keys(conflicts).length > 0) {
      throw new ConflictException({
        message: `Conflito nos campos: ${Object.keys(conflicts).join(', ')}`,
        conflicts,
      });
    }

    const created = await this.repository.create(data as Vehicle);
    return VehicleMapper.toResponse(created);
  }

  async findAll(query: FilterVehicleDto): Promise<{
    data: VehicleResponseDto[];
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  }> {
    const {
      page = 1,
      limit = 10,
      placa,
      chassi,
      renavam,
      modelo,
      marca,
      ano,
    } = query;

    const filters: Record<string, any> = {};
    if (placa) filters.placa = { $regex: placa, $options: 'i' };
    if (chassi) filters.chassi = chassi;
    if (renavam) filters.renavam = renavam;
    if (modelo) filters.modelo = modelo;
    if (marca) filters.marca = marca;
    if (ano) filters.ano = ano;

    const total = await this.repository.count(filters);
    const lastPage = Math.ceil(total / limit);

    if (page > lastPage && total > 0) {
      throw new BadRequestException(
        `Página ${page} não existe. Última página disponível é ${lastPage}`,
      );
    }

    const list = await this.repository.find(filters, page, limit);

    return {
      data: list.map((v) => VehicleMapper.toResponse(v)),
      page,
      limit,
      total,
      lastPage,
    };
  }

  async findOne(id: string): Promise<VehicleResponseDto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(
        'ID inválido: o valor fornecido não é um ObjectId',
      );
    }

    const found = await this.repository.findById(id);
    return VehicleMapper.toResponse(found);
  }

  async update(
    id: string,
    updateData: Partial<Vehicle>,
  ): Promise<VehicleResponseDto> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(
        'ID inválido: o valor fornecido não é um ObjectId',
      );
    }

    const conflicts = await this.validateUniqueFields(updateData, id);

    if (Object.keys(conflicts).length > 0) {
      throw new ConflictException({
        message: `Conflito nos campos: ${Object.keys(conflicts).join(', ')}`,
        conflicts,
      });
    }

    const updated = await this.repository.update(id, updateData);
    return VehicleMapper.toResponse(updated);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private async validateUniqueFields(
    data: Partial<Vehicle>,
    ignoreId?: string,
  ): Promise<Record<string, string>> {
    const conflicts: Record<string, string> = {};

    const checks = [
      { field: 'placa', value: data.placa },
      { field: 'chassi', value: data.chassi },
      { field: 'renavam', value: data.renavam },
    ] as const;

    for (const { field, value } of checks) {
      if (!value) continue;
      const exists = await this.repository.findByField(field, value, ignoreId);
      if (exists) {
        conflicts[field] = value;
      }
    }

    return conflicts;
  }
}
