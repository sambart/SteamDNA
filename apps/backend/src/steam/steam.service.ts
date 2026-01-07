import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService, HttpError } from '../common/http';

@Injectable()
export class SteamService {
  private readonly logger = new Logger(SteamService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.steampowered.com';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get('STEAM_API_KEY');
  }

  async getOwnedGames(steamId: string) {
    const url = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;

    try {
      const data = await this.httpService.get<any>(url, { timeout: 10000 });

      if (!data.response) {
        throw new NotFoundException('Steam user not found or profile is private');
      }

      return data;
    } catch (error) {
      if (error instanceof HttpError) {
        throw new BadRequestException(`Failed to fetch owned games: ${error.message}`);
      }
      throw error;
    }
  }

  async getPlayerSummary(steamId: string) {
    const url = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`;

    try {
      const data = await this.httpService.get<any>(url, { timeout: 10000 });

      if (!data.response?.players?.length) {
        throw new NotFoundException('Steam user not found');
      }

      return data;
    } catch (error) {
      if (error instanceof HttpError) {
        throw new BadRequestException(`Failed to fetch player summary: ${error.message}`);
      }
      throw error;
    }
  }

  async getRecentlyPlayedGames(steamId: string) {
    const url = `${this.baseUrl}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${this.apiKey}&steamid=${steamId}`;
    return this.httpService.get<any>(url, { timeout: 10000 });
  }

  async getUserStatsForGame(steamId: string, appId: number) {
    const url = `${this.baseUrl}/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appId}&key=${this.apiKey}&steamid=${steamId}`;
    return this.httpService.get<any>(url, { timeout: 10000 });
  }

  async getGameDetails(appId: number) {
    const cacheKey = `game:${appId}`;

    try {
      // Check cache first
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Steam Store API
      const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`;
      const data = await this.httpService.get<any>(url, {
        timeout: 15000,
        retries: 2,
      });

      // Steam API returned success: false (game not found or removed)
      if (!data[appId]?.success) {
        this.logger.warn(`Steam API returned success=false for appId ${appId} (game may not exist or be removed)`);
        return null;
      }

      const gameData = data[appId].data;

      // Validate required fields
      if (!gameData?.name) {
        this.logger.error(`Steam API returned invalid data for appId ${appId}: missing required fields`);
        return null;
      }

      const gameDetails = {
        appId,
        name: gameData.name,
        type: gameData.type, // game, dlc, demo, etc.
        description: gameData.short_description,
        headerImage: gameData.header_image,
        developers: gameData.developers || [],
        publishers: gameData.publishers || [],
        genres: gameData.genres?.map((g: any) => g.description) || [],
        categories: gameData.categories?.map((c: any) => c.description) || [],
        releaseDate: gameData.release_date?.date,
        isFree: gameData.is_free,
        currentPrice: gameData.price_overview?.final || 0,
        originalPrice: gameData.price_overview?.initial || 0,
        discountPercent: gameData.price_overview?.discount_percent || 0,
        metacriticScore: gameData.metacritic?.score || null,
        metacriticUrl: gameData.metacritic?.url || null,
        recommendations: gameData.recommendations?.total || 0,
        screenshots: gameData.screenshots?.map((s: any) => s.path_full) || [],
        movies: gameData.movies?.map((m: any) => m.mp4?.max) || [],
      };

      // Only cache successful responses with valid data
      await this.cacheManager.set(cacheKey, gameDetails, 604800000);
      this.logger.log(`Successfully cached game details for appId ${appId}: ${gameData.name}`);

      return gameDetails;
    } catch (error) {
      if (error instanceof HttpError) {
        this.logger.error(`HTTP error fetching game details for appId ${appId}: ${error.statusCode} ${error.message}`);
      } else {
        this.logger.error(`Exception while fetching game details for appId ${appId}:`, error.message);
      }
      // Do NOT cache failures - return null without caching
      return null;
    }
  }

  async getPlayerAchievements(steamId: string, appId: number) {
    try {
      const url = `${this.baseUrl}/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${this.apiKey}&steamid=${steamId}`;
      const data = await this.httpService.get<any>(url, { timeout: 10000, retries: 2 });

      if (!data.playerstats?.success) {
        return null;
      }

      const achievements = data.playerstats.achievements || [];
      const unlockedCount = achievements.filter((a: any) => a.achieved === 1).length;
      const totalCount = achievements.length;

      return {
        totalAchievements: totalCount,
        unlockedAchievements: unlockedCount,
        achievementPercentage: totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0,
        achievements: achievements.map((a: any) => ({
          apiName: a.apiname,
          achieved: a.achieved === 1,
          unlockTime: a.unlocktime,
          name: a.name,
          description: a.description,
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch achievements for appId ${appId}:`, error.message);
      return null;
    }
  }

  async getCompleteUserData(steamId: string) {
    try {
      const [playerSummary, ownedGames, recentGames] = await Promise.all([
        this.getPlayerSummary(steamId),
        this.getOwnedGames(steamId),
        this.getRecentlyPlayedGames(steamId),
      ]);

      return {
        player: playerSummary.response.players[0],
        games: ownedGames.response,
        recentGames: recentGames.response,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch Steam data');
    }
  }

  async resolveVanityUrl(vanityUrl: string): Promise<string> {
    const url = `${this.baseUrl}/ISteamUser/ResolveVanityURL/v0001/?key=${this.apiKey}&vanityurl=${vanityUrl}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.response?.success !== 1) {
      throw new NotFoundException('Steam user not found with this vanity URL');
    }

    return data.response.steamid;
  }

  async resolveIdentifier(identifier: string): Promise<string> {
    // If already a Steam ID64, return it
    if (this.validateSteamId(identifier)) {
      return identifier;
    }

    // If it's a profile URL, extract vanity name
    const urlMatch = identifier.match(/steamcommunity\.com\/id\/([^/]+)/);
    if (urlMatch) {
      return this.resolveVanityUrl(urlMatch[1]);
    }

    // Otherwise treat as vanity URL name
    return this.resolveVanityUrl(identifier);
  }

  validateSteamId(steamId: string): boolean {
    // Steam ID64 format validation (17 digits starting with 7656119)
    const steamIdRegex = /^7656119\d{10}$/;
    return steamIdRegex.test(steamId);
  }
}
