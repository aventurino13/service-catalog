import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
  Query,
  Patch,
} from '@nestjs/common';
import CreateServiceDto from 'src/service-catalog/dto/createServiceDto';
import GetServiceResponseDto from 'src/service-catalog/dto/getVersionResponseDto';
import CreateVersionDto from './dto/createVersionDto';
import PaginationParams from './dto/paginationParamsDto';
import { Service } from 'src/service-catalog/entity/service.entity';
import { Version } from 'src/service-catalog/entity/version.entity';
import { ServiceCatalogService } from './service-catalog.service';
import UpdateServiceDto from './dto/updateServiceDto';

@Controller('service-catalog')
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  //GET /service-catalog/id/[id] route
  @Get('/id/:id')
  //ParseIntPipe allows us to convert from string route param to number
  getServiceById(@Param('id', ParseIntPipe) id: number): Promise<Service> {
    return this.serviceCatalogService.getServiceById(id);
  }

  //GET /service-catalog/[name] route
  @Get('/name/:name')
  getServiceByName(@Param('name') name: string): Promise<Service[]> {
    return this.serviceCatalogService.getServiceByName(name);
  }

  //GET /service-catalog/recent
  @Get('/recent')
  getRecentServices(): Promise<Service[]> {
    return this.serviceCatalogService.getRecentServices();
  }

  //GET /service-catalog/paginated
  @Get('/paginated')
  getPaginatedServices(
    @Query() { offset, limit }: PaginationParams,
  ): Promise<Service[]> {
    return this.serviceCatalogService.getPaginatedServices(offset, limit);
  }

  //GET /service-catalog
  @Get()
  getAllServices(): Promise<Service[]> {
    return this.serviceCatalogService.getAllServices();
  }

  //PATCH /service-catalog/service/:id
  @Patch('/service/:id')
  updateService(
    @Param('id') serviceId: number,
    @Body() service: UpdateServiceDto,
  ) {
    return this.serviceCatalogService.updateService(serviceId, service);
  }

  //POST /service-catalog/service
  @Post('/service')
  createService(
    @Body(new ValidationPipe()) service: CreateServiceDto,
  ): Promise<Service> {
    return this.serviceCatalogService.create(service);
  }

  //POST /service-catalog/version
  @Post('/version')
  createVersion(
    @Body(new ValidationPipe()) version: CreateVersionDto,
  ): Promise<Service> {
    return this.serviceCatalogService.createVersion(version);
  }
}
