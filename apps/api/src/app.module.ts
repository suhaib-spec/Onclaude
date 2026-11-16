import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
import { AssessmentsController } from './assessments/assessments.controller';
import { AssessmentsService } from './assessments/assessments.service';
import { CandidateController } from './candidate/candidate.controller';
import { CandidateService } from './candidate/candidate.service';
import { config } from './config/env';
import { DemoController } from './demo-data/demo.controller';
import { SeederService } from './demo-data/seeder.service';
import { ENTITIES } from './entities';
import { HealthController } from './health/health.controller';
import { SessionsController } from './sessions/sessions.controller';
import { SessionsService } from './sessions/sessions.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: config.databaseUrl,
        entities: ENTITIES,
        synchronize: true, // MVP only (spec §3)
        retryAttempts: 3,
        retryDelay: 2000,
      }),
    }),
    TypeOrmModule.forFeature(ENTITIES),
    AiModule,
  ],
  controllers: [HealthController, AssessmentsController, SessionsController, CandidateController, DemoController],
  providers: [AssessmentsService, SessionsService, CandidateService, SeederService],
})
export class AppModule {}
