import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MonitoringService } from '../monitoring.service';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(private readonly monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, path } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000; // 转换为秒
          this.monitoringService.recordHttpRequest(
            method,
            path,
            response.statusCode,
          );
          this.monitoringService.recordHttpRequestDuration(
            method,
            path,
            duration,
          );
        },
        error: () => {
          const duration = (Date.now() - startTime) / 1000;
          this.monitoringService.recordHttpRequest(method, path, 500);
          this.monitoringService.recordHttpRequestDuration(
            method,
            path,
            duration,
          );
        },
      }),
    );
  }
}
