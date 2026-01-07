import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { GameDataService } from './services/game-data.service';
import { UserDataService } from './services/user-data.service';
import { StatisticsService } from './services/statistics.service';
import { PersonaService } from './services/persona.service';
import { SteamModule } from '../steam/steam.module';
import { MLModule } from '../ml/ml.module';
import { User, Game, UserGame, Analysis } from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Game, UserGame, Analysis]),
    SteamModule,
    MLModule,
  ],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    GameDataService,
    UserDataService,
    StatisticsService,
    PersonaService,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}
