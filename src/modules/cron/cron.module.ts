import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [CronService],
})
export class CronModule {}
