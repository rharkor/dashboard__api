import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service';
import { ItemService } from '../items/item.service';
import Item from '../items/entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  providers: [CronService, ItemService],
})
export class CronModule {}
