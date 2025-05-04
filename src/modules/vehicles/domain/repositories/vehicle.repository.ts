import { Vehicle } from '../entities/vehicle.entity';

export const VEHICLE_REPOSITORY = 'VEHICLE_REPOSITORY';

export interface VehicleRepository {
  create(data: Vehicle): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle>;
  find(filters: any, page: number, limit: number): Promise<Vehicle[]>;
  count(filters: any): Promise<number>;
  update(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
  delete(id: string): Promise<void>;
  findByField(
    field: 'placa' | 'chassi' | 'renavam',
    value: string,
    ignoreId?: string,
  ): Promise<Vehicle | null>;
}
