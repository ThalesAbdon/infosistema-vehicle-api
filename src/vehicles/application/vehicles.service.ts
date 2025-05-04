import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { VehicleModel, VehicleDocument } from '../schemas/vehicle.schema';
import { FilterVehicleDto } from '../dto/filter-vehicle.dto';
import { Vehicle } from '../domain/entities/vehicle.entity';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(VehicleModel.name)
    private vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(data: Omit<Vehicle, 'id'>): Promise<VehicleResponseDto> {
    const conflicts = await this.validateUniqueFields(data);

    if (Object.keys(conflicts).length > 0) {
      throw new ConflictException({
        message: `Conflito nos campos: ${Object.keys(conflicts).join(', ')}`,
        conflicts,
      });
    }

    const created = await this.vehicleModel.create(data);
    return VehicleResponseDto.fromEntity(created);
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

    const total = await this.vehicleModel.countDocuments(filters).exec();
    const lastPage = Math.ceil(total / limit);

    if (page > lastPage && total > 0) {
      throw new BadRequestException(
        `Página ${page} não existe. Última página disponível é ${lastPage}`,
      );
    }

    const results = await this.vehicleModel
      .find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const data = results.map((v) => VehicleResponseDto.fromEntity(v));

    return {
      data,
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

    const vehicle = await this.vehicleModel.findById(id).exec();

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado com o ID informado');
    }

    return VehicleResponseDto.fromEntity(vehicle);
  }

  async update(
    id: string,
    updateData: Partial<VehicleModel>,
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

    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Veículo não encontrado para atualização');
    }

    return VehicleResponseDto.fromEntity(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.vehicleModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Veículo não encontrado');
  }

  private async validateUniqueFields(
    data: Partial<VehicleModel>,
    ignoreId?: string,
  ): Promise<Record<string, string>> {
    const conflicts: Record<string, string> = {};

    const conditions = [
      { field: 'placa', value: data.placa },
      { field: 'chassi', value: data.chassi },
      { field: 'renavam', value: data.renavam },
    ] as const;

    for (const { field, value } of conditions) {
      if (!value) continue;

      const query: Record<string, any> = { [field]: value };
      if (ignoreId) query._id = { $ne: ignoreId };

      const exists: VehicleDocument | null = await this.vehicleModel
        .findOne(query)
        .exec();
      if (exists) {
        conflicts[field] = value;
      }
    }

    return conflicts;
  }
}
