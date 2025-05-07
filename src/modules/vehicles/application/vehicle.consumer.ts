import { Inject, Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { VehiclesService } from 'src/modules/vehicles/application/vehicles.service';
import { VehicleEntity } from 'src/modules/vehicles/domain/entities/vehicle.entity';

@Injectable()
export class VehicleConsumerService {
  constructor(
    @Inject(VehiclesService) private readonly vehicleService: VehiclesService,
  ) {}

  @SqsMessageHandler(process.env.SQS_QUEUE_NAME || 'vehicles-queue', false)
  async handleMessage(message: Message): Promise<void> {
    const body = JSON.parse(String(message.Body)) as Partial<VehicleEntity>[];

    const vehicles = Array.isArray(body) ? body : [body];

    for (const vehicle of vehicles) {
      try {
        await this.vehicleService.create(vehicle);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Erro ao criar veículo:', vehicle.placa, error.message);
        } else {
          console.error(
            'Erro desconhecido ao criar veículo:',
            vehicle.placa,
            error,
          );
        }
      }
    }
  }
}
