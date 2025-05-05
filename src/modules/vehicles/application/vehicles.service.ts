import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { FilterVehicleDto } from '../dto/filter-vehicle.dto';
import { VehicleEntity } from '../domain/entities/vehicle.entity';
import {
  VEHICLE_REPOSITORY,
  VehicleRepository,
} from '../domain/repositories/vehicle.repository';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly repository: VehicleRepository,
  ) {}

  async create(data: Partial<VehicleEntity>): Promise<VehicleResponseDto> {
    const conflicts = await this.validateUniqueFields(data);

    if (Object.keys(conflicts).length > 0) {
      throw new ConflictException({
        message: `Conflito nos campos: ${Object.keys(conflicts).join(', ')}`,
        conflicts,
      });
    }

    return await this.repository.create(data);
  }

  async findAll(query: FilterVehicleDto): Promise<{
    data: VehicleResponseDto[];
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  }> {
    const { page = 1, limit = 10, search } = query;

    const filters: Record<string, any> = {};

    if (search) {
      const regex = { $regex: search, $options: 'i' };

      const searchAsNumber = Number(search);
      const isNumericSearch =
        !isNaN(searchAsNumber) && Number.isInteger(searchAsNumber);

      filters.$or = [
        { placa: regex },
        { chassi: regex },
        { renavam: regex },
        { modelo: regex },
        { marca: regex },
        ...(isNumericSearch ? [{ ano: searchAsNumber }] : []),
      ];
    }

    const total = await this.repository.count(filters);
    const lastPage = Math.ceil(total / limit);

    if (page > lastPage && total > 0) {
      throw new BadRequestException(
        `Página ${page} não existe. Última página disponível é ${lastPage}`,
      );
    }

    const list = await this.repository.find(filters, page, limit);

    return {
      data: list,
      page,
      limit,
      total,
      lastPage,
    };
  }

  async findOne(_id: string): Promise<VehicleResponseDto> {
    if (!isValidObjectId(_id)) {
      throw new NotFoundException(
        'ID inválido: o valor fornecido não é um ObjectId',
      );
    }

    return await this.repository.findById(_id);
  }

  async update(
    _id: string,
    updateData: Partial<VehicleEntity>,
  ): Promise<VehicleResponseDto> {
    if (!isValidObjectId(_id)) {
      throw new BadRequestException(
        'ID inválido: o valor fornecido não é um ObjectId',
      );
    }

    const conflicts = await this.validateUniqueFields(updateData, _id);

    if (Object.keys(conflicts).length > 0) {
      throw new ConflictException({
        message: `Conflito nos campos: ${Object.keys(conflicts).join(', ')}`,
        conflicts,
      });
    }

    return await this.repository.update(_id, updateData);
  }

  async remove(_id: string): Promise<void> {
    await this.repository.delete(_id);
  }

  private async validateUniqueFields(
    data: Partial<VehicleEntity>,
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
