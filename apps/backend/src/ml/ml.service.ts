import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  constructor(private configService: ConfigService) {
    this.mlServiceUrl =
      this.configService.get('ML_SERVICE_URL') || 'http://ml-service:5000';
  }

  async analyzeUser(
    userId: number,
    userGames: UserGameData[],
    gamesInfo: GameInfo[],
  ): Promise<MLAnalysisResponse> {
    try {
      const response = await fetch(`${this.mlServiceUrl}/api/ml/analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userGames,
          gamesInfo,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`ML Service returned ${response.status}: ${errorText}`);
        throw new Error(`ML Service returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
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
      const response = await fetch(`${this.mlServiceUrl}/api/ml/features/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGames,
          gamesInfo,
        }),
      });

      if (!response.ok) {
        throw new Error(`ML Service returned ${response.status}`);
      }

      return response.json();
    } catch (error) {
      this.logger.error('Feature extraction failed:', error.message);
      throw error;
    }
  }

  async getPersonas(): Promise<any[]> {
    try {
      const response = await fetch(`${this.mlServiceUrl}/api/ml/analysis/personas`);

      if (!response.ok) {
        throw new Error(`ML Service returned ${response.status}`);
      }

      const data = await response.json();
      return data.personas;
    } catch (error) {
      this.logger.error('Failed to fetch personas:', error.message);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.mlServiceUrl}/health`);
      return response.ok;
    } catch (error) {
      this.logger.warn('ML Service health check failed:', error.message);
      return false;
    }
  }
}
