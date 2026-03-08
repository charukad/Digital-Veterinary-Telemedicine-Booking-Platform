import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;

        // Log slow responses (> 500ms)
        if (duration > 500) {
          this.logger.warn(
            `Slow response: ${method} ${url} - ${statusCode} - ${duration}ms`,
          );
        }

        // Log all requests in development
        if (process.env.NODE_ENV !== 'production') {
          this.logger.log(`${method} ${url} - ${statusCode} - ${duration}ms`);
        }

        // Store metrics for monitoring
        // TODO: Send to monitoring service (Prometheus, Datadog, etc.)
      }),
    );
  }
}
