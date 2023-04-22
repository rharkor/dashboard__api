import { IsIn, IsOptional, IsString } from 'class-validator';
import { itemsList } from '../item.service';

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  @IsIn(itemsList)
  type?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  text?: string;
}
