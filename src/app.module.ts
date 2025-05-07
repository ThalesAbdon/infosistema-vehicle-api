import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { AwsSqsModule } from './shared/aws/sqs/sqs.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27018/vehicles-db',
    ),
    VehiclesModule,
    AwsSqsModule,
  ],
})
export class AppModule {}
