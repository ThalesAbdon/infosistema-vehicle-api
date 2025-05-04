import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VehicleDocument } from '../mongoose/vehicle.schema';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';

@Injectable()
export class VehicleMongooseRepository implements VehicleRepository {
  constructor(
    @InjectModel('Vehicle')
    private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const created = await this.vehicleModel.create(vehicle);
    return new Vehicle(
      created.placa,
      created.chassi,
      created.renavam,
      created.modelo,
      created.marca,
      created.ano,
      String(created._id),
    );
  }

  async findAll(): Promise<Vehicle[]> {
    const list: VehicleDocument[] = await this.vehicleModel.find().exec();

    const result: Vehicle[] = list.map(
      (v) =>
        new Vehicle(
          v.placa,
          v.chassi,
          v.renavam,
          v.modelo,
          v.marca,
          v.ano,
          String(v.id),
        ),
    );

    return result;
  }

  async findById(id: string): Promise<Vehicle> {
    const v = await this.vehicleModel.findById(id).exec();
    if (!v) throw new NotFoundException('Veículo não encontrado');
    return new Vehicle(
      v.placa,
      v.chassi,
      v.renavam,
      v.modelo,
      v.marca,
      v.ano,
      String(v._id),
    );
  }

  async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const updated = await this.vehicleModel
      .findByIdAndUpdate(id, vehicle, {
        new: true,
      })
      .exec();

    if (!updated) throw new NotFoundException('Veículo não encontrado');

    return new Vehicle(
      updated.placa,
      updated.chassi,
      updated.renavam,
      updated.modelo,
      updated.marca,
      updated.ano,
      String(updated.id),
    );
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.vehicleModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Veículo não encontrado');
  }
}
