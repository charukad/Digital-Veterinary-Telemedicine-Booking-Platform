import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  [key: string]: any;
}

@Injectable()
export class EnhancedLoggerService extends Logger {
  constructor(private configService: ConfigService) {
    super('VetCareAPI');
  }

  /**
   * Log with structured context
   */
  logWithContext(level: LogLevel, message: string, context?: LogContext) {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: this.configService.get('NODE_ENV'),
      ...context,
    };

    // In production, send to external logging service (e.g., Datadog, New Relic)
    if (this.configService.get('NODE_ENV') === 'production') {
      // TODO: Send to external logging service
      console.log(JSON.stringify(logData));
    } else {
      // Development: Pretty print
      this[level](message, JSON.stringify(context, null, 2));
    }
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    path: string,
    userId?: string,
    ip?: string,
    userAgent?: string,
  ) {
    this.logWithContext('log', 'API Request', {
      type: 'request',
      method,
      path,
      userId,
      ip,
      userAgent,
    });
  }

  /**
   * Log API response
   */
  logResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
  ) {
    this.logWithContext('log', 'API Response', {
      type: 'response',
      method,
      path,
      statusCode,
      duration,
      userId,
    });
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, params?: any) {
    if (duration > 100) {
      // Log slow queries
      this.logWithContext('warn', 'Slow Query Detected', {
        type: 'slow_query',
        query,
        duration,
        params,
      });
    }
  }

  /**
   * Log business event
   */
  logEvent(event: string, data?: any) {
    this.logWithContext('log', event, {
      type: 'business_event',
      ...data,
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', data?: any) {
    this.logWithContext('warn', `Security: ${event}`, {
      type: 'security',
      severity,
      ...data,
    });
  }
}
