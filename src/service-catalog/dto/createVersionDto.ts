import { IsNumber, Min, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Optional } from '@nestjs/common';

export default class CreateVersionDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly serviceId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly version: number;
}
