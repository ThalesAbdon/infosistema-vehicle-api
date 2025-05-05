import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehiclesService } from '../application/vehicles.service';
import { ApiTags } from '@nestjs/swagger';
import { FilterVehicleDto } from '../dto/filter-vehicle.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVehicleDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: FilterVehicleDto) {
    return this.service.findAll(query);
  }

  @Get(':_id')
  findOne(@Param('_id') _id: string) {
    return this.service.findOne(_id);
  }

  @Put(':_id')
  update(@Param('_id') _id: string, @Body() dto: UpdateVehicleDto) {
    return this.service.update(_id, dto);
  }

  @Delete(':_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('_id') _id: string) {
    return this.service.remove(_id);
  }
}
