import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/logger.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // 创建应用实例，使用自定义logger
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });

  const configService = app.get(ConfigService);

  // 配置CORS
  app.use(cors(configService.get('cors')));

  // 配置Swagger文档
  const config = new DocumentBuilder()
    .setTitle('ggtalkshow')
    .setDescription('ggtalkshow api')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 启动应用
  const port = configService.get('port');
  await app.listen(port);

  const logger = new AppLogger();
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}

bootstrap().catch((err) => {
  console.error('Application failed to start:', err);
  process.exit(1);
});
