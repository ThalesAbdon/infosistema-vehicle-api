export class Vehicle {
  constructor(
    public readonly placa: string,
    public readonly chassi: string,
    public readonly renavam: string,
    public readonly modelo: string,
    public readonly marca: string,
    public readonly ano: number,
    public readonly id?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
