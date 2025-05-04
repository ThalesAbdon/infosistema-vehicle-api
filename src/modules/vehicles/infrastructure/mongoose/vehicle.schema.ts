import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = VehicleModel &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class VehicleModel {
  @Prop({ required: true, unique: true })
  placa: string;

  @Prop({ required: true, unique: true })
  chassi: string;

  @Prop({ required: true, unique: true })
  renavam: string;

  @Prop({ required: true })
  modelo: string;

  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  ano: number;
}

export const VehicleSchema = SchemaFactory.createForClass(VehicleModel);
