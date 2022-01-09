import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Version } from './version.entity';

@Entity()
export class Service extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  description: string;
  @CreateDateColumn()
  created_date: Date;
  @OneToMany(() => Version, (version) => version.service, {
    eager: true,
    cascade: true,
  })
  versions: Version[];
}
