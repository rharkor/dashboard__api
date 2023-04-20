import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {
  constructor() {
    //
  }

  private readonly logger = new Logger(CronService.name);

  @Cron('0 * * * *') // Every hour
  async handleCron() {
    //
  }
}
