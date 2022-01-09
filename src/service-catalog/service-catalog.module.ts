import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from 'src/service-catalog/entity/service.entity';
import { Version } from 'src/service-catalog/entity/version.entity';
import { ServiceCatalogController } from './service-catalog.controller';
import { ServiceCatalogService } from './service-catalog.service';

@Module({
  controllers: [ServiceCatalogController],
  providers: [ServiceCatalogService],
  imports: [TypeOrmModule.forFeature([Service, Version])],
  exports: [ServiceCatalogService, TypeOrmModule],
})
export class ServiceCatalogModule {}
