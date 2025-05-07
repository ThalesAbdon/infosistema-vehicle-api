// src/shared/aws/sqs/sqs.module.ts
import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsProducerService } from './sqs.producer.service';

@Module({
  imports: [
    ConfigModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): SqsModule => ({
        SQS_QUEUE_NAME: 'vehicles-queue',
        SQS_ENDPOINT: 'http://localstack:4566',
        consumers: [
          {
            name: configService.get<string>('SQS_QUEUE_NAME'),
            queueUrl: configService.get<string>('SQS_QUEUE_URL'),
            region: configService.get<string>('AWS_REGION'),
            credentials: {
              accessKeyId:
                configService.get<string>('AWS_ACCESS_KEY_ID') || 'localstack',
              secretAccessKey:
                configService.get<string>('AWS_SECRET_ACCESS_KEY') ||
                'localstack',
            },
            useQueueUrlAsEndpoint: true,
          },
        ],
        producers: [
          {
            name: configService.get<string>('SQS_QUEUE_NAME'),
            queueUrl: configService.get<string>('SQS_QUEUE_URL'),
            region: configService.get<string>('AWS_REGION'),
            credentials: {
              accessKeyId:
                configService.get<string>('AWS_ACCESS_KEY_ID') || 'localstack',
              secretAccessKey:
                configService.get<string>('AWS_SECRET_ACCESS_KEY') ||
                'localstack',
            },
            useQueueUrlAsEndpoint: true,
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SqsProducerService],
  exports: [SqsProducerService],
})
export class AwsSqsModule {}
