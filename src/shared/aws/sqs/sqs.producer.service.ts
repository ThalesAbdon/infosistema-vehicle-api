import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { ConfigService } from '@nestjs/config';
import { ImportedVehicleDto } from 'src/common/interfaces/imported-vehicle.interface';

@Injectable()
export class SqsProducerService {
  private readonly queueName: string;

  constructor(
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService,
  ) {
    this.queueName = this.configService.get<string>('SQS_QUEUE_NAME') as string;
  }

  async sendMessage(message: ImportedVehicleDto): Promise<void> {
    await this.sqsService.send(this.queueName, {
      id: Date.now().toString(),
      body: message,
    });
  }
}
