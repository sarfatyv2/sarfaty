import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { DRIZZLE, type DrizzleDB } from '../../database/database.module';
import { sql } from 'drizzle-orm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  @Public()
  @Get()
  async check() {
    let dbStatus = 'healthy';

    try {
      await this.db.execute(sql`SELECT 1`);
    } catch {
      dbStatus = 'unhealthy';
    }

    return {
      data: {
        status: dbStatus === 'healthy' ? 'ok' : 'degraded',
        version: '0.1.0',
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        database: dbStatus,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
