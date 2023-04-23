import { Logger } from '@nestjs/common';
import databaseConfiguration from '../database.configuration';
import * as dotenv from 'dotenv';
import { hash } from 'bcrypt';
import * as readline from 'readline';
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string) => {
  return new Promise<string>((resolve) =>
    rl.question(query, (answer) => {
      resolve(answer);
    }),
  );
};

const insertUser = async () => {
  const connection = await databaseConfiguration.initialize();

  const userEmail = await askQuestion('Please enter your email: ');
  const userPassword = await askQuestion('Please enter your password: ');

  if (!userEmail || !userPassword) {
    Logger.error('User email or password not found');
    await connection.destroy();
    rl.close();
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
  rl.close();
};

insertUser();
