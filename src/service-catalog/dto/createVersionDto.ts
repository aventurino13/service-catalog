import { IsNumber, Min  } from 'class-validator';
import { Type } from 'class-transformer';

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
