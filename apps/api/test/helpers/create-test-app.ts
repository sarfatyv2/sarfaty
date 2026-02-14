import { Test, type TestingModule } from '@nestjs/testing';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module';

export async function createTestApp(): Promise<NestFastifyApplication> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
}
