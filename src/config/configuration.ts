export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
  api: {
    gemini: {
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-pro',
    },
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || 'logs',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300,
    max: parseInt(process.env.CACHE_MAX, 10) || 100,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  auth: {
    saltRounds: parseInt(process.env.AUTH_SALT_ROUNDS, 10) || 10,
  },
  encryption: {
    secret: process.env.ENCRYPTION_SECRET,
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'AES',
    encoding: process.env.ENCRYPTION_ENCODING || 'base64',
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET,
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },
    csrf: {
      enabled: process.env.CSRF_ENABLED === 'true',
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    },
    helmet: {
      contentSecurityPolicy: {
        enabled: process.env.CSP_ENABLED === 'true',
      },
      hsts: {
        enabled: process.env.HSTS_ENABLED === 'true',
        maxAge: parseInt(process.env.HSTS_MAX_AGE, 10) || 31536000,
      },
    },
  },
  audit: {
    logLevel: process.env.AUDIT_LOG_LEVEL || 'info',
    retention: parseInt(process.env.AUDIT_LOG_RETENTION, 10) || 90, // 日志保留天数
    sensitiveFields: (
      process.env.AUDIT_SENSITIVE_FIELDS || 'password,token,secret,credit_card'
    ).split(','),
    storage: {
      type: process.env.AUDIT_STORAGE_TYPE || 'file', // 'file' | 'database'
      path: process.env.AUDIT_LOG_PATH || 'logs/audit',
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: process.env.LOG_FILE_ENABLED === 'true',
      dir: process.env.LOG_DIR || 'logs',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
    },
    fluentd: {
      enabled: process.env.FLUENTD_ENABLED === 'true',
      host: process.env.FLUENTD_HOST || 'localhost',
      port: parseInt(process.env.FLUENTD_PORT, 10) || 24224,
      timeout: parseFloat(process.env.FLUENTD_TIMEOUT) || 3.0,
      reconnectInterval:
        parseInt(process.env.FLUENTD_RECONNECT_INTERVAL, 10) || 600000,
    },
  },
});
