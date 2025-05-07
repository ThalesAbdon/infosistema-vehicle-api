export class VehicleEntity {
  public readonly placa: string;
  public readonly chassi: string;
  public readonly renavam: string;
  public readonly modelo: string;
  public readonly marca: string;
  public readonly ano: number;
  public readonly _id: unknown;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(input: Partial<VehicleEntity>) {
    Object.assign(this, input);
  }
}
