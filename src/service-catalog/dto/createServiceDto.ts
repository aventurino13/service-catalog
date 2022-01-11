import { IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export default class CreateServiceDto {
  @Type(() => String)
  @IsString()
  readonly name: string;

  @Type(() => String)
  @IsString()
  readonly description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly version: number;
}
