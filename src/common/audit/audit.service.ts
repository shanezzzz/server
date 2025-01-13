import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/logger.service';
import { AuditLog } from './interfaces/audit-log.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditService {
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext('AuditService');
  }

  async log(auditLog: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const log: AuditLog = {
      id: uuidv4(),
      timestamp: new Date(),
      ...auditLog,
    };

    // 脱敏处理
    const sensitiveFields = ['password', 'token', 'secret', 'credit_card'];
    if (log.oldValue) {
      log.oldValue = this.maskSensitiveData(log.oldValue, sensitiveFields);
    }
    if (log.newValue) {
      log.newValue = this.maskSensitiveData(log.newValue, sensitiveFields);
    }

    // 根据配置决定日志输出方式
    const logLevel = this.configService.get<string>('audit.logLevel', 'info');

    // 构建结构化日志消息
    const logMessage = {
      type: 'AUDIT',
      ...log,
      oldValue: log.oldValue ? JSON.stringify(log.oldValue) : undefined,
      newValue: log.newValue ? JSON.stringify(log.newValue) : undefined,
    };

    // 写入日志
    this.logger[logLevel](logMessage);

    // TODO: 如果需要，这里可以添加将日志写入数据库的逻辑
  }

  private maskSensitiveData(data: any, sensitiveFields: string[]): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };
    for (const field of sensitiveFields) {
      if (field in masked) {
        masked[field] = '******';
      }
    }

    return masked;
  }
}
