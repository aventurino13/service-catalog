import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Like, Repository, SelectQueryBuilder } from 'typeorm';
import { Service } from 'src/service-catalog/entity/service.entity';
import { Version } from 'src/service-catalog/entity/version.entity';
import GetServiceResponseDto from './dto/getVersionResponseDto';
import { classToPlain, instanceToPlain, plainToClass } from 'class-transformer';
import CreateVersionDto from './dto/createVersionDto';
import CreateServiceDto from './dto/createServiceDto';
import GetVersionResponseDto from './dto/getVersionResponseDto';

@Injectable()
export class ServiceCatalogService {
  constructor(
    @InjectRepository(Version)
    private readonly versionRepository: Repository<Version>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async getAllServices(): Promise<Service[]> {
    return await this.serviceRepository.find();
  }

  async getRecentServices(): Promise<Service[]> {
    return await this.serviceRepository.find({
      order: {
        created_date: 'DESC',
      },
    });
  }

  async getPaginatedServices(
    offset?: number,
    limit?: number,
  ): Promise<Service[]> {
    const services = await this.serviceRepository.find({
      order: {
        created_date: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    if(services.length < 1) {
      throw new NotFoundException();
    }

    return services;
  }

  async getServiceById(serviceId: number): Promise<Service> {
    const matchedService = await this.serviceRepository.findOne({
      where: {
        id: serviceId,
      },
      relations: ['versions'],
    });

    if (!matchedService) {
      throw new NotFoundException();
    }
    return matchedService;
  }

  async getServiceByName(searchName: string): Promise<Service[]> {
    const matchedService = await this.serviceRepository.find({
      where: {
        name: Like('%' + searchName + '%'),
      },
      relations: ['versions'],
    });

    if (matchedService.length < 1) {
      throw new NotFoundException();
    }
    return matchedService;
  }

  async create(serviceDetails: CreateServiceDto): Promise<Service> {
    const newVersion = new Version();
    newVersion.versionNumber = serviceDetails.version;
    newVersion.isActive = true;

    const newService = new Service();
    newService.name = serviceDetails.name;
    newService.description = serviceDetails.description;
    newService.versions = [newVersion];

    return await this.serviceRepository.save(newService);
  }

  async createVersion(versionDetails: CreateVersionDto): Promise<Service> {
    const serviceToUpdate = await this.serviceRepository.findOne({
      where: {
        id: versionDetails.serviceId,
      },
      relations: ['versions'],
    });

    if (!serviceToUpdate) {
      throw new NotFoundException();
    }

    await this.versionRepository.query(
      'UPDATE VERSION set "isActive"=false where "serviceId"=' +
        serviceToUpdate.id,
    );

    const newVersion = new Version();
    newVersion.versionNumber = versionDetails.version;
    newVersion.isActive = true;
    newVersion.service = serviceToUpdate;

    await this.versionRepository.save(newVersion);

    return await this.serviceRepository.findOne({
      where: {
        id: versionDetails.serviceId,
      },
      relations: ['versions'],
    });
  }
}
