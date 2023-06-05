import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemService, ItemsFiles } from './item.service';
import { CreateItemDto } from './dtos/item-create.dto';
import { UpdateItemDto } from './dtos/item-update.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { uploadConfiguration } from 'src/utils/upload';
import { RequestWithUser } from 'src/types';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll(@Request() req: RequestWithUser) {
    const { user } = req;
    return this.itemService.findAll(user);
  }

  @Get('one/:id')
  findOneItem(@Param('id') id: number, @Request() req: RequestWithUser) {
    const { user } = req;
    return this.itemService.findOneItem(id, user);
  }

  @Get('parent/:id')
  findParentItem(@Param('id') id: number, @Request() req: RequestWithUser) {
    const { user } = req;
    return this.itemService.findParentItem(id, user);
  }

  @Get(':id')
  findByItem(@Param('id') id: number, @Request() req: RequestWithUser) {
    const { user } = req;
    return this.itemService.findByItem(id, user);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'file', maxCount: 1 },
      ],
      uploadConfiguration,
    ),
  )
  create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFiles()
    files: ItemsFiles,
    @Request() req: RequestWithUser,
  ) {
    const { user } = req;
    return this.itemService.create(
      {
        ...createItemDto,
        logo: files.logo,
        file: files.file,
      },
      user,
    );
  }

  @Put('move/:id/:parentId')
  move(
    @Param('id') id: number,
    @Param('parentId', ParseIntPipe) parentId: number,
    @Request() req: RequestWithUser,
  ) {
    const { user } = req;
    return this.itemService.moveItem(id, parentId, user);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'file', maxCount: 1 },
      ],
      uploadConfiguration,
    ),
  )
  update(
    @Param('id') id: number,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFiles()
    files: ItemsFiles,
    @Request() req: RequestWithUser,
  ) {
    const { user } = req;
    return this.itemService.update(
      id,
      {
        ...updateItemDto,
        logo: files.logo,
        file: files.file,
      },
      user,
    );
  }

  @Delete('group/:id')
  removeGroup(@Param('id') id: string, @Request() req: RequestWithUser) {
    const { user } = req;
    return this.itemService.removeGroup(+id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const { user } = req;
    return this.itemService.remove(+id, user);
  }
}
