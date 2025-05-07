import { Test, TestingModule } from '@nestjs/testing';
import { SqsService } from '@ssut/nestjs-sqs';
import { ConfigService } from '@nestjs/config';
import { ImportedVehicleDto } from 'src/common/interfaces/imported-vehicle.interface';
import { SqsProducerService } from 'src/shared/aws/sqs/sqs.producer.service';

describe('SqsProducerService', () => {
  let service: SqsProducerService;
  let sqsServiceMock: { send: jest.Mock };
  let configServiceMock: { get: jest.Mock };

  beforeEach(async () => {
    sqsServiceMock = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    configServiceMock = {
      get: jest.fn().mockReturnValue('mock-queue'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqsProducerService,
        {
          provide: SqsService,
          useValue: sqsServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<SqsProducerService>(SqsProducerService);
  });

  it('deve enviar mensagem para a fila correta com id e body', async () => {
    const payload: ImportedVehicleDto = {
      placa: 'ABC1234',
      chassi: 'CHASSI123',
      renavam: '12345678900',
      modelo: 'Corolla',
      marca: 'Toyota',
      ano: 2023,
    };

    const originalDateNow = Date.now;
    const mockDate = 1715000000000;
    global.Date.now = jest.fn(() => mockDate); // mock do timestamp

    await service.sendMessage(payload);

    expect(configServiceMock.get).toHaveBeenCalledWith('SQS_QUEUE_NAME');
    expect(sqsServiceMock.send).toHaveBeenCalledWith('mock-queue', {
      id: mockDate.toString(),
      body: payload,
    });

    global.Date.now = originalDateNow; // restaura
  });
});
