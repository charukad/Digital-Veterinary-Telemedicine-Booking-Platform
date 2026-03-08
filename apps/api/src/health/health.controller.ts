import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with database' })
  async detailedHealthCheck() {
    let databaseStatus = 'ok';
    let databaseLatency = 0;

    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      databaseLatency = Date.now() - start;
    } catch (error) {
      databaseStatus = 'error';
    }

    return {
      status: databaseStatus === 'ok' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: databaseStatus,
          latency: `${databaseLatency}ms`,
        },
        api: {
          status: 'ok',
          version: '1.0.0',
        },
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  async readinessCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch (error) {
      return { ready: false, error: 'Database not ready' };
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  liveCheck() {
    return { alive: true };
  }
}
