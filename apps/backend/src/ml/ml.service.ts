import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../common/http';

interface UserGameData {
  appId: number;
  playtimeForever: number;
  playtimeTwoWeeks?: number;
  achievements?: {
    totalAchievements: number;
    unlockedAchievements: number;
    achievementPercentage: number;
  };
}

interface GameInfo {
  appId: number;
  name: string;
  genres?: string[];
  isFree: boolean;
  metacriticScore?: number;
}

interface PersonaResult {
  clusterId: number;
  personaName: string;
  confidence: number;
  description: string;
  traits: string[];
  insights: string[];
}

interface MLAnalysisResponse {
  userId: number;
  featureVector: number[];
  persona: PersonaResult;
  topGenres: string[];
  totalGames: number;
  totalPlaytime: number;
  featureDetails: any;
}

@Injectable()
export class MLService {
  private readonly logger = new Logger(MLService.name);
  private readonly mlServiceUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.mlServiceUrl =
      this.configService.get('ML_SERVICE_URL') || 'http://ml-service:5000';
  }

  async analyzeUser(
    userId: number,
    userGames: UserGameData[],
    gamesInfo: GameInfo[],
  ): Promise<MLAnalysisResponse> {
    try {
      const data = await this.httpService.post<MLAnalysisResponse>(
        `${this.mlServiceUrl}/api/ml/analysis/analyze`,
        { userId, userGames, gamesInfo },
        { timeout: 30000, retries: 2 },
      );

      this.logger.log(`ML analysis completed for user ${userId}`);
      return data;
    } catch (error) {
      this.logger.error(`ML analysis failed for user ${userId}:`, error.message);
      throw error;
    }
  }

  async extractFeatures(
    userGames: UserGameData[],
    gamesInfo: GameInfo[],
  ): Promise<{ featureVector: number[]; featureDetails: any; metadata: any }> {
    try {
      return await this.httpService.post(
        `${this.mlServiceUrl}/api/ml/features/extract`,
        { userGames, gamesInfo },
        { timeout: 15000 },
      );
    } catch (error) {
      this.logger.error('Feature extraction failed:', error.message);
      throw error;
    }
  }

  async getPersonas(): Promise<any[]> {
    try {
      const data = await this.httpService.get<{ personas: any[] }>(
        `${this.mlServiceUrl}/api/ml/analysis/personas`,
        { timeout: 5000 },
      );
      return data.personas;
    } catch (error) {
      this.logger.error('Failed to fetch personas:', error.message);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.httpService.get(`${this.mlServiceUrl}/health`, {
        timeout: 5000,
        retries: 1,
      });
      return true;
    } catch (error) {
      this.logger.warn('ML Service health check failed:', error.message);
      return false;
    }
  }
}
