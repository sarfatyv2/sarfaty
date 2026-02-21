import { Module } from '@nestjs/common';
import { PipelineController } from './controllers/pipeline.controller';
import { GetPipelineClientsUseCase } from './use-cases/get-pipeline-clients.use-case';
import { GetPipelineMetricsUseCase } from './use-cases/get-pipeline-metrics.use-case';
import { DrizzlePipelineRepository } from './infra/drizzle-pipeline.repository';
import { PIPELINE_REPOSITORY } from './domain/pipeline.repository';

@Module({
  controllers: [PipelineController],
  providers: [
    GetPipelineClientsUseCase,
    GetPipelineMetricsUseCase,
    { provide: PIPELINE_REPOSITORY, useClass: DrizzlePipelineRepository },
  ],
})
export class PipelineModule {}
