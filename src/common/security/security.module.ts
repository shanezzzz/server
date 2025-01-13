import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SecurityMiddleware } from './security.middleware';

@Module({
  providers: [SecurityMiddleware],
  exports: [SecurityMiddleware],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
