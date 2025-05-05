import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VehicleModel } from '../mongoose/vehicle.schema';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';

@Injectable()
export class VehicleMongooseRepository implements VehicleRepository {
  constructor(
    @InjectModel('Vehicle')
    private readonly vehicleModel: Model<VehicleModel>,
  ) {}

  async create(vehicle: VehicleEntity): Promise<VehicleEntity> {
    const created = await this.vehicleModel.create({
      placa: vehicle.placa,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      modelo: vehicle.modelo,
      marca: vehicle.marca,
      ano: vehicle.ano,
    });

    return created;
  }

  async find(
    filters: FilterQuery<VehicleModel>,
    page: number,
    limit: number,
  ): Promise<VehicleEntity[]> {
    const list = await this.vehicleModel
      .find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return list;
  }

  async findById(id: string): Promise<VehicleModel> {
    const v = await this.vehicleModel.findById(id).exec();
    if (!v) throw new NotFoundException('Veículo não encontrado');
    return v;
  }

  async update(
    id: string,
    vehicle: Partial<VehicleModel>,
  ): Promise<VehicleModel> {
    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, vehicle, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Veículo não encontrado');

    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.vehicleModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Veículo não encontrado');
  }

  async findByField(
    field: 'placa' | 'chassi' | 'renavam',
    value: string,
    ignoreId?: string,
  ): Promise<VehicleModel | null> {
    const query: FilterQuery<VehicleModel> = { [field]: value };
    if (ignoreId) {
      query._id = { $ne: ignoreId };
    }

    const found = await this.vehicleModel.findOne(query).exec();
    return found ? found : null;
  }

  async count(filters: FilterQuery<VehicleModel>): Promise<number> {
    return this.vehicleModel.countDocuments(filters).exec();
  }
}
