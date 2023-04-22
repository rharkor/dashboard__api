import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Item from '../items/entities/item.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ItemService } from '../items/item.service';

@Module({
  controllers: [FileController],
  providers: [FileService, ItemService],
  imports: [TypeOrmModule.forFeature([Item])],
})
export class FileModule {}
