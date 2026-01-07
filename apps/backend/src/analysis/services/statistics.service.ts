import { Injectable } from '@nestjs/common';

export interface PlaytimeRange {
  name: string;
  min: number;
  max: number;
  count: number;
}

export interface GameStatistics {
  totalGames: number;
  totalPlaytime: number;
  avgPlaytime: number;
  topGames: Array<{ name: string; playtime: number }>;
}

@Injectable()
export class StatisticsService {
  /**
   * Calculate basic game statistics from game list
   */
  calculateGameStatistics(gameList: any[]): GameStatistics {
    const totalGames = gameList.length;
    const totalPlaytime = gameList.reduce((sum, game) => sum + (game.playtime_forever || 0), 0);
    const avgPlaytime = totalGames > 0 ? Math.round(totalPlaytime / totalGames) : 0;

    // Top games by playtime
    const topGames = [...gameList]
      .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
      .slice(0, 5)
      .map(game => ({
        name: game.name,
        playtime: game.playtime_forever,
      }));

    return {
      totalGames,
      totalPlaytime,
      avgPlaytime,
      topGames,
    };
  }

  /**
   * Categorize games by playtime ranges
   */
  categorizeByPlaytime(games: any[]): Array<{ name: string; value: number }> {
    const ranges: PlaytimeRange[] = [
      { name: 'Never Played', min: 0, max: 0, count: 0 },
      { name: '< 1h', min: 1, max: 60, count: 0 },
      { name: '1-5h', min: 61, max: 300, count: 0 },
      { name: '5-20h', min: 301, max: 1200, count: 0 },
      { name: '20-50h', min: 1201, max: 3000, count: 0 },
      { name: '50-100h', min: 3001, max: 6000, count: 0 },
      { name: '100h+', min: 6001, max: Infinity, count: 0 },
    ];

    games.forEach(game => {
      const playtime = game.playtime_forever || 0;
      const range = ranges.find(r => playtime >= r.min && playtime <= r.max);
      if (range) range.count++;
    });

    return ranges.map(r => ({ name: r.name, value: r.count }));
  }

  /**
   * Get top games by playtime
   */
  getTopGames(gameList: any[], limit: number = 10): Array<{ name: string; playtime: number; playtimeForever: number }> {
    return [...gameList]
      .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
      .slice(0, limit)
      .map(game => ({
        name: game.name,
        playtime: Math.round((game.playtime_forever || 0) / 60),
        playtimeForever: game.playtime_forever,
      }));
  }

  /**
   * Calculate dashboard statistics
   */
  calculateDashboardStats(gameList: any[]) {
    return {
      totalGames: gameList.length,
      totalPlaytime: Math.round(gameList.reduce((sum, game) => sum + (game.playtime_forever || 0), 0) / 60),
      gamesNeverPlayed: gameList.filter(g => !g.playtime_forever || g.playtime_forever === 0).length,
    };
  }
}
