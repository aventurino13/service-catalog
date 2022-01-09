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
import CreateServiceDto from 'src/service-catalog/dto/createServiceDto';
import GetServiceResponseDto from './dto/getServiceResponseDto';
import { classToPlain, instanceToPlain, plainToClass } from 'class-transformer';
import CreateVersionDto from './dto/createVersionDto';

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

  async getServiceById(serviceId: number): Promise<Service> {
    return await this.serviceRepository.findOne({
      where: {
        id: serviceId,
      },
      relations: ['versions'],
    });
  }

  async getServiceByName(searchName: string): Promise<Service[]> {
    return await this.serviceRepository.find({
      where: {
        name: Like('%' + searchName + '%'),
      },
      relations: ['versions'],
    });

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
