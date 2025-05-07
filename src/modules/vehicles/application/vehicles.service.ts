import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { FilterVehicleDto } from '../dto/filter-vehicle.dto';
import { VehicleEntity } from '../domain/entities/vehicle.entity';
import {
  VEHICLE_REPOSITORY,
  VehicleRepository,
} from '../domain/repositories/vehicle.repository';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';
import * as XLSX from 'xlsx';
import { join } from 'path';
import { readdirSync, readFileSync, statSync } from 'fs';
import { ImportedVehicleDto } from '../../../common/interfaces/imported-vehicle.interface';
import { SqsProducerService } from '../../../shared/aws/sqs/sqs.producer.service';

@Injectable()
export class VehiclesService {
  private readonly REQUIRED_HEADERS = [
    'placa',
    'chassi',
    'renavam',
    'modelo',
    'marca',
    'ano',
  ];

  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly repository: VehicleRepository,
    private readonly producerMessage: SqsProducerService,
  ) {}

  async create(data: Partial<VehicleEntity>): Promise<VehicleResponseDto> {
    try {
      const conflicts = await this.validateUniqueFields(data);
      if (Object.keys(conflicts).length > 0) {
        throw new ConflictException({
          message: `Conflito nos campos: ${Object.keys(conflicts).join(', ')}`,
          conflicts,
        });
      }

      return await this.repository.create(data);
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erro desconhecido');
    }
  }

  async findAll(query: FilterVehicleDto): Promise<{
    data: VehicleResponseDto[];
    page: number;
    limit: number;
    total: number;
    lastPage: number;
  }> {
    try {
      const { page = 1, limit = 10, search } = query;

      const filters: Record<string, any> = {};

      if (search) {
        const regex = { $regex: search, $options: 'i' };
        const searchAsNumber = Number(search);
        const isNumericSearch =
          !isNaN(searchAsNumber) && Number.isInteger(searchAsNumber);

        filters.$or = [
          { placa: regex },
          { chassi: regex },
          { renavam: regex },
          { modelo: regex },
          { marca: regex },
          ...(isNumericSearch ? [{ ano: searchAsNumber }] : []),
        ];
      }

      const total = await this.repository.count(filters);
      const lastPage = Math.ceil(total / limit);

      if (page > lastPage && total > 0) {
        throw new BadRequestException(
          `Página ${page} não existe. Última página disponível é ${lastPage}`,
        );
      }

      const list = await this.repository.find(filters, page, limit);

      return {
        data: list,
        page,
        limit,
        total,
        lastPage,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error);
    }
  }

  async findOne(_id: string): Promise<VehicleResponseDto> {
    try {
      if (!isValidObjectId(_id)) {
        throw new NotFoundException(
          'ID inválido: o valor fornecido não é um ObjectId',
        );
      }

      return await this.repository.findById(_id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error);
    }
  }
  async update(
    _id: string,
    updateData: Partial<VehicleEntity>,
  ): Promise<VehicleResponseDto> {
    try {
      if (!isValidObjectId(_id)) {
        throw new BadRequestException(
          'ID inválido: o valor fornecido não é um ObjectId',
        );
      }

      const conflicts = await this.validateUniqueFields(updateData, _id);
      if (Object.keys(conflicts).length > 0) {
        throw new ConflictException({
          message: `Conflito nos campos: ${Object.keys(conflicts).join(', ')}`,
          conflicts,
        });
      }

      return await this.repository.update(_id, updateData);
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Erro desconhecido');
    }
  }

  async remove(_id: string): Promise<void> {
    try {
      return await this.repository.delete(_id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error);
    }
  }

  async importFromExcel(): Promise<{ sent: number }> {
    try {
      const tempPath = join(process.cwd(), 'temp');
      const files = readdirSync(tempPath);

      const xlsxFiles = files.filter(
        (file) =>
          file.endsWith('.xlsx') && statSync(join(tempPath, file)).isFile(),
      );

      if (xlsxFiles.length === 0) {
        throw new NotFoundException(
          'Nenhum arquivo .xlsx encontrado na pasta assets.',
        );
      }

      if (xlsxFiles.length > 1) {
        throw new BadRequestException(
          `Mais de um arquivo .xlsx encontrado: ${xlsxFiles.join(
            ', ',
          )}. Mantenha apenas um.`,
        );
      }

      const filePath = join(tempPath, xlsxFiles[0]);
      const fileBuffer = readFileSync(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new BadRequestException('Planilha vazia ou mal formatada.');
      }

      const firstRow = jsonData[0] as Record<string, any>;
      const actualHeaders = Object.keys(firstRow).map((h) =>
        h.toLowerCase().trim(),
      );

      const missingHeaders = this.REQUIRED_HEADERS.filter(
        (required) => !actualHeaders.includes(required),
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Cabeçalhos ausentes: ${missingHeaders.join(', ')}`,
        );
      }

      const data = jsonData as ImportedVehicleDto[];

      for (const item of data) {
        try {
          await this.producerMessage.sendMessage(item);
        } catch (error) {
          if (error instanceof Error) {
            throw new BadRequestException(error.message);
          }
          throw new BadRequestException(error);
        }
      }

      return { sent: data.length };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(error);
    }
  }

  private async validateUniqueFields(
    data: Partial<VehicleEntity>,
    ignoreId?: string,
  ): Promise<Record<string, string>> {
    const conflicts: Record<string, string> = {};

    const checks = [
      { field: 'placa', value: data.placa },
      { field: 'chassi', value: data.chassi },
      { field: 'renavam', value: data.renavam },
    ] as const;

    for (const { field, value } of checks) {
      if (!value) continue;
      const exists = await this.repository.findByField(field, value, ignoreId);
      if (exists) {
        conflicts[field] = value;
      }
    }

    return conflicts;
  }
}
