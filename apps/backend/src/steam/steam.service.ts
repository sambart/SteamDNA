import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SteamService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.steampowered.com';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('STEAM_API_KEY');
  }

  async getOwnedGames(steamId: string) {
    const url = `${this.baseUrl}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;
    const response = await fetch(url);
    return response.json();
  }

  async getPlayerSummary(steamId: string) {
    const url = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`;
    const response = await fetch(url);
    return response.json();
  }

  async getRecentlyPlayedGames(steamId: string) {
    const url = `${this.baseUrl}/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${this.apiKey}&steamid=${steamId}`;
    const response = await fetch(url);
    return response.json();
  }

  async getUserStatsForGame(steamId: string, appId: number) {
    const url = `${this.baseUrl}/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${appId}&key=${this.apiKey}&steamid=${steamId}`;
    const response = await fetch(url);
    return response.json();
  }
}
