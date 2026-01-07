import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Game } from '../../database/entities';
import { SteamService } from '../../steam/steam.service';

@Injectable()
export class GameDataService {
  private readonly logger = new Logger(GameDataService.name);

  constructor(
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    private steamService: SteamService,
  ) {}

  /**
   * Fetch and save game details for a list of games (bulk operation)
   * Only fetches missing games from Steam API, uses DB cache for existing ones
   */
  async fetchAndSaveGameDetails(gameList: any[]): Promise<Game[]> {
    const appIds = gameList.map(g => g.appid);

    // Bulk fetch existing games from DB
    const existingGames = await this.gameRepository.find({
      where: { appId: In(appIds) },
    });

    const existingAppIds = new Set(existingGames.map(g => g.appId));
    const missingGameData = gameList.filter(g => !existingAppIds.has(g.appid));

    const newGames: Game[] = [];

    // Fetch details for missing games
    for (const gameData of missingGameData) {
      try {
        const gameDetails: any = await this.steamService.getGameDetails(gameData.appid);

        if (gameDetails) {
          const game = this.gameRepository.create({
            appId: gameDetails.appId,
            name: gameDetails.name,
            shortDescription: gameDetails.description,
            headerImage: gameDetails.headerImage,
            genres: gameDetails.genres,
            developers: gameDetails.developers,
            publishers: gameDetails.publishers,
            releaseDate: gameDetails.releaseDate ? new Date(gameDetails.releaseDate) : null,
            currentPrice: gameDetails.currentPrice,
            isFree: gameDetails.isFree,
            metacriticScore: gameDetails.metacriticScore,
          });

          newGames.push(game);
          this.logger.log(`Prepared game details for: ${game.name}`);
        }

        // Add delay to avoid rate limiting (Steam allows ~200 requests per 5 minutes)
        await this.delay(200);
      } catch (error) {
        this.logger.error(`Failed to fetch game ${gameData.appid}: ${error.message}`);
      }
    }

    // Bulk save new games
    if (newGames.length > 0) {
      await this.gameRepository.save(newGames);
      this.logger.log(`Bulk saved ${newGames.length} new games`);
    }

    return [...existingGames, ...newGames];
  }

  /**
   * Get games by app IDs (bulk operation)
   */
  async findByAppIds(appIds: number[]): Promise<Game[]> {
    return this.gameRepository.find({
      where: { appId: In(appIds) },
    });
  }

  /**
   * Get game by app ID
   */
  async findByAppId(appId: number): Promise<Game | null> {
    return this.gameRepository.findOne({
      where: { appId },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
