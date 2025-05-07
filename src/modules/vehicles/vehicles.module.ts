import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiclesService } from './application/vehicles.service';
import { VehicleSchema } from './infrastructure/mongoose/vehicle.schema';
import { VehicleMongooseRepository } from './infrastructure/repositories/vehicle-mongoose.repository';
import { VEHICLE_REPOSITORY } from './domain/repositories/vehicle.repository';
import { VehiclesController } from './controller/vehicles.controller';
import { AwsSqsModule } from 'src/shared/aws/sqs/sqs.module';
import { VehicleConsumerService } from './application/vehicle.consumer';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Vehicle', schema: VehicleSchema }]),
    AwsSqsModule,
  ],
  controllers: [VehiclesController],
  providers: [
    VehiclesService,
    VehicleConsumerService,
    {
      provide: VEHICLE_REPOSITORY,
      useClass: VehicleMongooseRepository,
    },
  ],
  exports: [
    VehiclesService,
    {
      provide: VEHICLE_REPOSITORY,
      useClass: VehicleMongooseRepository,
    },
  ],
})
export class VehiclesModule {}
