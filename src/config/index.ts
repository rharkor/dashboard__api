import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfiguration from './app.configuration';
import databaseConfiguration from './database.configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

export default [
  ConfigModule.forRoot({
    load: [appConfiguration, databaseConfiguration],
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: configService.getOrThrow<string>('db_kind') as any,
      host: configService.getOrThrow<string>('db_host'),
      port: configService.getOrThrow<number>('db_port'),
      username: configService.getOrThrow<string>('db_user'),
      password: configService.getOrThrow<string>('db_pass'),
      database: configService.getOrThrow<string>('db_name'),
      entities: [],
      autoLoadEntities: true,
    }),
  }),
  ThrottlerModule.forRoot({
    ttl: 60,
    limit: 10,
  }),
  ScheduleModule.forRoot(),
];

const configService = new ConfigService();
export const BACKHEALTH_API_KEY =
  configService.getOrThrow<string>('BACKHEALTH_API_KEY');
export const ENVIRONMENT = configService.getOrThrow<string>('ENV');
export const PROJECT_NAME = configService.getOrThrow<string>('PROJECT_NAME');
