import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Environment } from '../../config/types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, string>;
        message = resp.message ?? message;
        error = resp.error ?? error;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );

      // TODO: refactor
      if (exception.constructor.name === 'OptimisticLockVersionMismatchError') {
        status = HttpStatus.CONFLICT;
        message =
          'The application was modified by another user. Please refresh and try again.';
        error = 'Conflict';
      }
    }

    this.logger.warn(
      `[${request.method}] ${request.url} -> ${status}: ${JSON.stringify(message)}`,
    );

    const errorResponse = {
      statusCode: status,
      method: request.method,
      path: request.url,
      error,
      devError:
        (process.env.NODE_ENV as Environment) === Environment.Dev ||
        (process.env.NODE_ENV as Environment) === Environment.Development
          ? exception.stack || exception.message
          : undefined,
      message,
      timestamp: new Date().toISOString(),
    };

    return response.status(status).json(errorResponse);
  }
}
