import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import Item from '../entities/item.entity';
import { itemsList } from '../item.service';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(itemsList)
  type: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsOptional()
  @IsString()
  parent?: Item;
}
