import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import databaseConfiguration from '../config/database.configuration';

config();

const conf = databaseConfiguration();

export default new DataSource({
  type: conf['db_kind'] as any,
  host: conf['db_host'],
  port: conf['db_port'],
  username: conf['db_user'],
  password: conf['db_pass'],
  database: conf['db_name'],
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['dist/**/migrations/*.js'],
});
