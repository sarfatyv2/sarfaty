import { config } from 'dotenv';
config({ path: '.env.local' });

import multipart from '@fastify/multipart';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // Known NestJS 10 strict-TS issue: FastifyAdapter vs AbstractHttpAdapter
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    new FastifyAdapter({ logger: false }) as any,
    { bufferLogs: true },
  );

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
    attachFieldsToBody: true,
  });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: env.CORS_ORIGINS.split(','), credentials: true });
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sarfaty Platform API')
    .setDescription('API backend for the Sarfaty corporate platform')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(env.PORT, '0.0.0.0');
}

void bootstrap();
