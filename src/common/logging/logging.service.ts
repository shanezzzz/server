import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { transport } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as FluentD from 'fluent-logger';
import { hostname } from 'os';

interface LogData {
  timestamp: number;
  level: string;
  message: string;
  context?: string;
  hostname: string;
  pid: number;
}

@Injectable()
export class LoggingService implements LoggerService {
  private logger: winston.Logger;
  private fluentd: FluentD.FluentSender<LogData>;

  constructor(private readonly configService: ConfigService) {
    this.initializeFluentd();
    this.initializeLogger();
  }

  private initializeFluentd() {
    const fluentConfig = this.configService.get('logging.fluentd');
    if (fluentConfig?.enabled) {
      this.fluentd = FluentD.createFluentSender('app', {
        host: fluentConfig.host || 'localhost',
        port: fluentConfig.port || 24224,
        timeout: fluentConfig.timeout || 3.0,
        reconnectInterval: fluentConfig.reconnectInterval || 600000,
      });
    }
  }

  private initializeLogger() {
    const transports: transport[] = [];

    // 控制台输出
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `[${timestamp}] ${level}: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`;
          }),
        ),
      }),
    );

    // 文件日志
    const fileConfig = this.configService.get('logging.file');
    if (fileConfig?.enabled) {
      transports.push(
        new DailyRotateFile({
          dirname: fileConfig.dir || 'logs',
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles: fileConfig.maxFiles || '14d',
          maxSize: fileConfig.maxSize || '20m',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: this.configService.get('logging.level', 'info'),
      transports,
    });
  }

  private formatMessage(message: any, context?: string): string {
    return context ? `[${context}] ${message}` : message;
  }

  private logToFluentd(level: string, message: any, context?: string) {
    if (this.fluentd) {
      const timestamp = new Date().getTime() / 1000;
      this.fluentd.emit(level, {
        timestamp,
        level,
        message: this.formatMessage(message, context),
        context,
        hostname: hostname(),
        pid: process.pid,
      });
    }
  }

  log(message: any, context?: string) {
    this.logger.info(this.formatMessage(message, context));
    this.logToFluentd('info', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(this.formatMessage(message, context), { trace });
    this.logToFluentd('error', message, context);
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.formatMessage(message, context));
    this.logToFluentd('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.formatMessage(message, context));
    this.logToFluentd('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(this.formatMessage(message, context));
    this.logToFluentd('verbose', message, context);
  }
}
