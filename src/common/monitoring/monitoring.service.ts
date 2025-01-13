import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class MonitoringService implements OnModuleInit {
  constructor(
    @InjectMetric('http_request_total')
    private readonly httpRequestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric('active_users_total')
    private readonly activeUsersGauge: Gauge<string>,
  ) {}

  onModuleInit() {
    // 初始化自定义指标
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // 初始化活跃用户数为0
    this.activeUsersGauge.set(0);
  }

  // 记录HTTP请求
  recordHttpRequest(method: string, path: string, statusCode: number) {
    this.httpRequestCounter.inc({
      method,
      path,
      status: statusCode.toString(),
    });
  }

  // 记录请求持续时间
  recordHttpRequestDuration(method: string, path: string, duration: number) {
    this.httpRequestDuration.observe(
      {
        method,
        path,
      },
      duration,
    );
  }

  // 更新活跃用户数
  updateActiveUsers(count: number) {
    this.activeUsersGauge.set(count);
  }

  // 增加活跃用户数
  incrementActiveUsers() {
    this.activeUsersGauge.inc();
  }

  // 减少活跃用户数
  decrementActiveUsers() {
    this.activeUsersGauge.dec();
  }
}
