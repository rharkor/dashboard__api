import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ItemService } from '../items/item.service';

@Injectable()
export class CronService {
  constructor(private readonly itemService: ItemService) {}

  private readonly logger = new Logger(CronService.name);

  @Cron('0 * * * *') // Every hour
  async handleCron() {
    await this.itemService.cleanUnused();
  }
}
