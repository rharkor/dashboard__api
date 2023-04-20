import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './middlewares/all-exceptions.middleware';
import * as swStats from 'swagger-stats';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthService } from './modules/auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const authService = app.get(AuthService);
  const port = configService.getOrThrow('app_port');
  app.useGlobalPipes(new ValidationPipe());

  // Add Swagger documentation
  const options = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Useful information about the API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  const statsMiddleware = swStats.getMiddleware({
    swaggerSpec: document,
    uriPath: '/api/stats',
    authentication: true,
    onAuthenticate: (req, username, password) => {
      return authService.validateUser(username, password);
    },
  });
  app.use(statsMiddleware);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  await app.listen(port);
}
bootstrap();
