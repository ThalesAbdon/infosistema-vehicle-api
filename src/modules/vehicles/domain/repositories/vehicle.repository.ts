import { VehicleEntity } from '../entities/vehicle.entity';

export const VEHICLE_REPOSITORY = 'VEHICLE_REPOSITORY';

export interface VehicleRepository {
  create(data: Partial<VehicleEntity>): Promise<VehicleEntity>;
  findById(id: string): Promise<VehicleEntity>;
  find(filters: any, page: number, limit: number): Promise<VehicleEntity[]>;
  count(filters: any): Promise<number>;
  update(id: string, data: Partial<VehicleEntity>): Promise<VehicleEntity>;
  delete(id: string): Promise<void>;
  findByField(
    field: 'placa' | 'chassi' | 'renavam',
    value: string,
    ignoreId?: string,
  ): Promise<VehicleEntity | null>;
}
