import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { VehicleDocument } from '../mongoose/vehicle.schema';

@Injectable()
export class VehicleMongooseRepository implements VehicleRepository {
  constructor(
    @InjectModel('Vehicle')
    private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const created = await this.vehicleModel.create({
      placa: vehicle.placa,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      modelo: vehicle.modelo,
      marca: vehicle.marca,
      ano: vehicle.ano,
    });

    return this.mapToEntity(created);
  }

  async find(
    filters: FilterQuery<VehicleDocument>,
    page: number,
    limit: number,
  ): Promise<Vehicle[]> {
    const list = await this.vehicleModel
      .find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return list.map((doc) => this.mapToEntity(doc));
  }

  async findById(id: string): Promise<Vehicle> {
    const v = await this.vehicleModel.findById(id).exec();
    if (!v) throw new NotFoundException('Veículo não encontrado');
    return this.mapToEntity(v);
  }

  async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, vehicle, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Veículo não encontrado');

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.vehicleModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Veículo não encontrado');
  }

  async findByField(
    field: 'placa' | 'chassi' | 'renavam',
    value: string,
    ignoreId?: string,
  ): Promise<Vehicle | null> {
    const query: FilterQuery<VehicleDocument> = { [field]: value };
    if (ignoreId) {
      query._id = { $ne: ignoreId };
    }

    const found = await this.vehicleModel.findOne(query).exec();
    return found ? this.mapToEntity(found) : null;
  }

  async count(filters: FilterQuery<VehicleDocument>): Promise<number> {
    return this.vehicleModel.countDocuments(filters).exec();
  }

  private mapToEntity(doc: VehicleDocument): Vehicle {
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
}
