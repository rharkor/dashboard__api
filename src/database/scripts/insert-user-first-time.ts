import { Logger } from '@nestjs/common';
import databaseConfiguration from '../database.configuration';
import * as dotenv from 'dotenv';
import { hash } from 'bcrypt';
dotenv.config();

const insertUser = async () => {
  const connection = await databaseConfiguration.initialize();

  const isUser = await connection.query('SELECT COUNT(*) FROM "user";');
  if (isUser[0].count > 0) {
    Logger.log('User already exists');
    await connection.destroy();
    return;
  }

  const userEmail = process.env.USER_EMAIL;
  const userPassword = process.env.USER_PASSWORD;

  if (!userEmail || !userPassword) {
    Logger.error('User email or password not found');
    await connection.destroy();
    return;
  }

  const user = {
    email: userEmail,
    password: await hash(userPassword, 10),
  };
  await connection.query(
    'INSERT INTO "user" (email, password) VALUES ($1, $2);',
    [user.email, user.password],
  );

  Logger.log('User created');

  await connection.destroy();
};

insertUser();
