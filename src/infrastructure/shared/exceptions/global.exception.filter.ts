import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from 'src/application/domain/errors/app.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      typeof exception === 'object' &&
      exception !== null &&
      'status' in exception
    ) {
      status = (exception.status as number) ?? HttpStatus.INTERNAL_SERVER_ERROR;
    }

    let message = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof AppError) {
      status = exception.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;

      const responseBody = exception.response;

      if (typeof responseBody === 'object' && responseBody !== null) {
        const typedResponse = responseBody as {
          message?: string;
          error?: string;
          details?: unknown;
        };

        message = typedResponse.message ?? message;
        error = typedResponse.error ?? error;
      } else {
        message = String(responseBody);
      }
    } else if (exception instanceof Error) {
      error = exception.name;
      message = exception.message;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status}: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
