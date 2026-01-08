import { Injectable, Logger } from '@nestjs/common';
import { MLService } from '../ml/ml.service';
import { GameDataService } from './services/game-data.service';
import { UserDataService } from './services/user-data.service';
import { StatisticsService } from './services/statistics.service';
import { PersonaService } from './services/persona.service';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private mlService: MLService,
    private gameDataService: GameDataService,
    private userDataService: UserDataService,
    private statisticsService: StatisticsService,
    private personaService: PersonaService,
  ) {}

  async generateSummary(steamData: any) {
    const { player, games, recentGames } = steamData;
    const gameList = games?.games || [];

    // No caching for analysis - always generate fresh results
    // (Game details are still cached separately in steam.service.ts)

    // Save or update user data
    await this.userDataService.saveUserData(player);

    // Fetch and save game details (limit to top 50 games to avoid rate limiting)
    const topGamesList = [...gameList]
      .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
      .slice(0, 50);

    const gamesWithDetails = await this.gameDataService.fetchAndSaveGameDetails(topGamesList);

    // Save user-game relationships (only for games that exist in DB)
    const user = await this.userDataService.findBySteamId(player.steamid);
    if (user) {
      // Only get games that exist in DB (top 50)
      const topGamesAppIds = topGamesList.map(g => g.appid);
      const games = await this.gameDataService.findByAppIds(topGamesAppIds);
      const gameIdMap = new Map(games.map(g => [g.appId, g.id]));

      // Only save user-game relationships for top 50 games
      const topGamesListFiltered = gameList.filter((g: any) => topGamesAppIds.includes(g.appid));
      await this.userDataService.saveUserGames(user.id, topGamesListFiltered, gameIdMap);
    }

    // Calculate statistics
    const stats = this.statisticsService.calculateGameStatistics(gameList);
    const { totalGames, totalPlaytime, avgPlaytime, topGames } = stats;

    // Calculate persona
    let persona = this.personaService.calculatePersona(totalGames, totalPlaytime, avgPlaytime);
    let mlInsights = null;

    // Try ML-based analysis if enough games
    if (totalGames >= 5) {
      try {
        // Prepare data for ML service with real game details
        const userGames = gameList.map(game => ({
          appId: game.appid,
          playtimeForever: game.playtime_forever || 0,
          playtimeTwoWeeks: game.playtime_2weeks,
        }));

        const gamesInfo = gamesWithDetails.map(game => ({
          appId: game.appId,
          name: game.name,
          genres: game.genres || [],
          isFree: game.isFree || false,
        }));

        const mlResult = await this.mlService.analyzeUser(
          user?.id || 0,
          userGames,
          gamesInfo,
        );

        persona = mlResult.persona.personaName;
        mlInsights = {
          confidence: mlResult.persona.confidence,
          traits: mlResult.persona.traits,
          insights: mlResult.persona.insights,
          topGenres: mlResult.topGenres,
          featureDetails: mlResult.featureDetails, // Include detailed feature analysis
        };

        this.logger.log(`ML analysis successful: ${persona}`);
      } catch (error) {
        this.logger.warn('ML analysis failed, falling back to basic analysis', error.message);
      }
    }

    const result = {
      steamId: player.steamid,
      displayName: player.personaname,
      avatar: player.avatarfull,
      summary: this.personaService.generateTextSummary(persona, totalGames, totalPlaytime),
      gamingPersona: persona,
      totalGames,
      totalPlaytime: Math.round(totalPlaytime / 60), // Convert to hours
      avgPlaytimePerGame: Math.round(avgPlaytime / 60),
      topGames,
      recentActivity: recentGames?.games?.length || 0,
      mlInsights,
    };

    // No caching - always return fresh analysis results
    return result;
  }

  async generateDashboard(steamData: any) {
    const { games } = steamData;
    const gameList = games?.games || [];

    // Playtime distribution
    const playtimeRanges = this.statisticsService.categorizeByPlaytime(gameList);

    // Top games
    const topGames = this.statisticsService.getTopGames(gameList, 10);

    // Dashboard stats
    const stats = this.statisticsService.calculateDashboardStats(gameList);

    return {
      charts: {
        playtimeDistribution: playtimeRanges,
        topGames,
      },
      stats,
    };
  }
}
