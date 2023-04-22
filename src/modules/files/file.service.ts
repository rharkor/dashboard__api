import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import User from '../users/entities/user.entity';
import * as path from 'path';
import { ItemService } from '../items/item.service';

@Injectable()
export class FileService {
  constructor(private readonly itemService: ItemService) {}

  async ensureFileExist(file: string): Promise<void> {
    if (!fs.existsSync(path.join('upload', file))) {
      throw new NotFoundException();
    }
  }

  async ensureHaveRights(file: string, user: User): Promise<void> {
    const item = await this.itemService.findOneByFile(file);
    if (item.user.id !== user.id) {
      throw new ForbiddenException();
    }
  }

  async ensureIsLogo(file: string): Promise<void> {
    await this.itemService.findOneByLogo(file);
  }
}
