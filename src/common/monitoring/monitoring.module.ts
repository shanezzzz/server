import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import {
  httpRequestCounter,
  httpRequestDuration,
  activeUsersGauge,
} from './metrics/custom.metrics';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'app_',
        },
      },
    }),
  ],
  providers: [
    MonitoringService,
    httpRequestCounter,
    httpRequestDuration,
    activeUsersGauge,
  ],
  controllers: [MonitoringController],
  exports: [MonitoringService],
})
export class MonitoringModule {}
