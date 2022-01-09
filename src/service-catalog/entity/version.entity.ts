import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Service } from './service.entity';

@Entity()
export class Version {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  versionNumber: number;
  @Column()
  isActive: boolean;
  @CreateDateColumn()
  created_date: Date;
  @ManyToOne(() => Service, (service) => service.versions, {
    onUpdate: 'CASCADE',
  })
  service: Service;
}
