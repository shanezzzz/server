import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private mongo: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      // 检查数据库连接
      () => this.db.pingCheck('database'),
      // 检查MongoDB连接
      () => this.mongo.pingCheck('mongodb'),
      // 检查外部API
      () => this.http.pingCheck('google-api', 'https://api.google.com'),
      // 检查内存使用
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // 150MB
      // 检查磁盘空间
      () =>
        this.disk.checkStorage('disk_storage', {
          thresholdPercent: 0.75, // 75%
          path: '/',
        }),
    ]);
  }

  @Get('liveness')
  @Public()
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      // 基本存活检查
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('readiness')
  @Public()
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      // 检查所有依赖服务是否就绪
      () => this.db.pingCheck('database'),
      () => this.mongo.pingCheck('mongodb'),
      () => this.http.pingCheck('google-api', 'https://api.google.com'),
    ]);
  }
}
