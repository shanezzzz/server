import { Injectable, LoggerService, Scope } from '@nestjs/common';
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context?: string;
  private logger: WinstonLogger;

  constructor() {
    this.initializeLogger();
  }

  setContext(context: string) {
    this.context = context;
  }

  private initializeLogger() {
    const logDir = 'logs';
    const errorLogPath = path.join(logDir, 'error-%DATE%.log');
    const combinedLogPath = path.join(logDir, 'combined-%DATE%.log');

    const customFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    );

    this.logger = createLogger({
      format: customFormat,
      transports: [
        // 错误日志
        new DailyRotateFile({
          filename: errorLogPath,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
        }),
        // 所有级别日志
        new DailyRotateFile({
          filename: combinedLogPath,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });

    // 开发环境添加控制台输出
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(({ timestamp, level, message, context, ...meta }) => {
              return `${timestamp} [${level}] ${
                context ? '[' + context + '] ' : ''
              }${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            }),
          ),
        }),
      );
    }
  }

  private formatMessage(message: any, context?: string): string {
    return `${context || this.context ? '[' + (context || this.context) + '] ' : ''}${message}`;
  }

  private logWithMetadata(
    level: string,
    message: any,
    context?: string,
    metadata?: any,
  ) {
    const formattedMessage = this.formatMessage(message, context);
    this.logger.log(level, formattedMessage, { ...metadata, context });
  }

  log(message: any, context?: string, metadata?: any) {
    this.logWithMetadata('info', message, context, metadata);
  }

  error(message: any, trace?: string, context?: string, metadata?: any) {
    this.logWithMetadata('error', message, context, {
      ...metadata,
      trace,
    });
  }

  warn(message: any, context?: string, metadata?: any) {
    this.logWithMetadata('warn', message, context, metadata);
  }

  debug(message: any, context?: string, metadata?: any) {
    this.logWithMetadata('debug', message, context, metadata);
  }

  verbose(message: any, context?: string, metadata?: any) {
    this.logWithMetadata('verbose', message, context, metadata);
  }
}
