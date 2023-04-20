import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import backhealth from 'src/utils/backhealth';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapter: AbstractHttpAdapter) {}

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: this.httpAdapter.getRequestUrl(ctx.getRequest()),
      error: exception.toString(),
    };

    if (exception.response && exception.response.message) {
      responseBody.error = exception.response.message;
    }

    Logger.error(exception);

    // If the error is critical, emit event to notify the admin
    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
      backhealth
        .emit({
          type: 'all exceptions error',
          content: {
            initial: exception,
            string: exception.toString(),
            message: exception.message,
            stack: exception.stack,
          },
          severity: 'critical',
        })
        .then(() => {
          Logger.log('Backhealth event emitted');
        });
    }

    this.httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
