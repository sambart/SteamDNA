import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { SteamModule } from '../steam/steam.module';
import { MLModule } from '../ml/ml.module';

@Module({
  imports: [SteamModule, MLModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
