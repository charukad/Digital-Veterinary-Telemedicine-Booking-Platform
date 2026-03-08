import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class NotFoundExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('404Handler');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.NOT_FOUND) {
      this.logger.warn(`404 Not Found: ${request.method} ${request.url}`);

      response.status(404).json({
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: 'Resource not found',
        error: 'Not Found',
      });
    }
  }
}

@Catch()
export class InternalServerErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('500Handler');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `500 Internal Server Error: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );

      response.status(500).json({
        statusCode: 500,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: 'Internal server error occurred',
        error: 'Internal Server Error',
      });
    }
  }
}
