import {
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { makeHistogramBuckets } from '../utils/metric.utils';

// HTTP请求计数器
export const httpRequestCounter = makeCounterProvider({
  name: 'http_request_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

// HTTP请求持续时间直方图
export const httpRequestDuration = makeHistogramProvider({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: makeHistogramBuckets(0.1, 0.1, 10), // 0.1s到1s，步长0.1s
});

// 活跃用户数量计量器
export const activeUsersGauge = makeGaugeProvider({
  name: 'active_users_total',
  help: 'Total number of active users',
});
