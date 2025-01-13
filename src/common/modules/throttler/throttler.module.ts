import { Module } from '@nestjs/common';
import {
  ThrottlerModule as NestThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from './throttler.guard';

@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.get('throttler.ttl', 60),
            limit: config.get('throttler.limit', 10),
          },
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class ThrottlerModule {}
