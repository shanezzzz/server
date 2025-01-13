import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: any;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return next.handle().pipe(
      tap({
        next: (data) => {
          // 记录成功的操作
          this.auditService.log({
            userId: user?.id,
            username: user?.username,
            action: auditMetadata.action,
            resource: auditMetadata.resource,
            resourceId: this.extractResourceId(auditMetadata, request, data),
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
            status: 'success',
            method: request.method,
            path: request.path,
            requestId: request.headers['x-request-id'] as string,
            newValue: this.sanitizeData(data, auditMetadata.sensitiveFields),
          });
        },
        error: (error) => {
          // 记录失败的操作
          this.auditService.log({
            userId: user?.id,
            username: user?.username,
            action: auditMetadata.action,
            resource: auditMetadata.resource,
            resourceId: this.extractResourceId(auditMetadata, request, null),
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
            status: 'failure',
            details: error.message,
            method: request.method,
            path: request.path,
            requestId: request.headers['x-request-id'] as string,
          });
        },
      }),
    );
  }

  private extractResourceId(
    metadata: AuditMetadata,
    request: Request,
    data: any,
  ): string | undefined {
    if (!metadata.resourceIdPath) {
      return undefined;
    }

    // 从请求参数中提取
    if (metadata.resourceIdPath.startsWith('params.')) {
      const param = metadata.resourceIdPath.split('.')[1];
      return request.params[param];
    }

    // 从响应数据中提取
    if (metadata.resourceIdPath.startsWith('response.')) {
      const path = metadata.resourceIdPath.split('.').slice(1);
      return path.reduce((obj, key) => obj?.[key], data);
    }

    return undefined;
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }

  private sanitizeData(data: any, sensitiveFields?: string[]): any {
    if (!sensitiveFields || !data) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '******';
      }
    }

    return sanitized;
  }
}
