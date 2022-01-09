import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCatalogController } from '../service-catalog.controller';

describe('ServiceCatalogController', () => {
  let controller: ServiceCatalogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceCatalogController],
    }).compile();

    controller = module.get<ServiceCatalogController>(ServiceCatalogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
