import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as csurf from 'csurf';
import { rateLimit } from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly csrfProtection: any;
  private readonly limiter: any;

  constructor(private readonly configService: ConfigService) {
    // 配置 CSRF 保护
    this.csrfProtection = csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    });

    // 配置速率限制
    this.limiter = rateLimit({
      windowMs: this.configService.get(
        'security.rateLimit.windowMs',
        15 * 60 * 1000,
      ),
      max: this.configService.get('security.rateLimit.max', 100),
      message: '请求过于频繁，请稍后再试',
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // 使用 Helmet 设置各种 HTTP 头
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    })(req, res, () => {});

    // 防止参数污染
    hpp()(req, res, () => {});

    // 解析 Cookie
    cookieParser()(req, res, () => {});

    // 设置会话
    session({
      secret: this.configService.get<string>(
        'security.sessionSecret',
        'your-secret-key',
      ),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24小时
        sameSite: 'strict',
      },
    })(req, res, () => {});

    // 应用速率限制
    this.limiter(req, res, () => {});

    // 应用 CSRF 保护（对非 GET 请求）
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      this.csrfProtection(req, res, () => {});
    }

    // 设置安全相关的响应头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );

    // 继续处理请求
    next();
  }
}
