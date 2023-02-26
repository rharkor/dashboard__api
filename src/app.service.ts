import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getStatus() {
    return {
      status: 'working',
      version: this.configService.get('app_version'),
    };
  }
}
