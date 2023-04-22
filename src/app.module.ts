import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configurations from './config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import {
  PerformanceMonitorInterceptor,
  PerformanceMonitorModule,
} from '@backhealth/nest-sdk';
import { CronModule } from './modules/cron/cron.module';
import { BACKHEALTH_API_KEY, ENVIRONMENT, PROJECT_NAME } from './config';
import { ItemModule } from './modules/items/item.module';
import { FileModule } from './modules/files/file.module';

@Module({
  imports: [
    ...configurations,
    PerformanceMonitorModule.forRoot({
      apiKey: BACKHEALTH_API_KEY,
      projectName: PROJECT_NAME,
      environment: ENVIRONMENT,
    }),
    AuthModule,
    CronModule,
    ItemModule,
    FileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceMonitorInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
