import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { AppLogger } from './common/logger/logger.service';
import { ThrottlerModule } from './common/modules/throttler/throttler.module';
import { ScheduleModule } from './common/modules/schedule/schedule.module';
import { CacheModule } from './common/modules/cache/cache.module';
import { AuthModule } from './common/auth/auth.module';
import { JwtAuthGuard } from './common/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/auth/guards/roles.guard';
import { EncryptionModule } from './common/encryption/encryption.module';
import { SecurityModule } from './common/security/security.module';
import { AuditModule } from './common/audit/audit.module';
import { HealthModule } from './common/health/health.module';
import { MonitoringModule } from './common/monitoring/monitoring.module';
import { MonitoringInterceptor } from './common/monitoring/interceptors/monitoring.interceptor';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule,
    ScheduleModule,
    CacheModule,
    AuthModule,
    EncryptionModule,
    SecurityModule,
    AuditModule,
    HealthModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MonitoringInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
