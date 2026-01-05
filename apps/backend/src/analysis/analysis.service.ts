import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalysisService {
  async generateSummary(steamData: any) {
    const { player, games, recentGames } = steamData;
    const gameList = games?.games || [];

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

    // Simple persona calculation
    const persona = this.calculatePersona(totalGames, totalPlaytime, avgPlaytime);

    return {
      steamId: player.steamid,
      displayName: player.personaname,
      avatar: player.avatarfull,
      summary: this.generateTextSummary(persona, totalGames, totalPlaytime),
      gamingPersona: persona,
      totalGames,
      totalPlaytime: Math.round(totalPlaytime / 60), // Convert to hours
      avgPlaytimePerGame: Math.round(avgPlaytime / 60),
      topGames,
      recentActivity: recentGames?.games?.length || 0,
    };
  }

  async generateDashboard(steamData: any) {
    const { games } = steamData;
    const gameList = games?.games || [];

    // Playtime distribution
    const playtimeRanges = this.categorizeByPlaytime(gameList);

    // Top games
    const topGames = [...gameList]
      .sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))
      .slice(0, 10)
      .map(game => ({
        name: game.name,
        playtime: Math.round((game.playtime_forever || 0) / 60),
        playtimeForever: game.playtime_forever,
      }));

    return {
      charts: {
        playtimeDistribution: playtimeRanges,
        topGames,
      },
      stats: {
        totalGames: gameList.length,
        totalPlaytime: Math.round(gameList.reduce((sum, game) => sum + (game.playtime_forever || 0), 0) / 60),
        gamesNeverPlayed: gameList.filter(g => !g.playtime_forever || g.playtime_forever === 0).length,
      },
    };
  }

  private calculatePersona(totalGames: number, totalPlaytime: number, avgPlaytime: number): string {
    const hoursPlayed = totalPlaytime / 60;

    if (hoursPlayed > 10000) return 'Hardcore Gamer';
    if (hoursPlayed > 5000) return 'Dedicated Gamer';
    if (hoursPlayed > 2000) return 'Enthusiast';
    if (hoursPlayed > 500) return 'Regular Gamer';
    return 'Casual Gamer';
  }

  private generateTextSummary(persona: string, totalGames: number, totalPlaytime: number): string {
    const hours = Math.round(totalPlaytime / 60);
    return `You are a ${persona} with ${totalGames} games and ${hours} hours of total playtime. Your gaming library shows a ${totalGames > 100 ? 'vast' : totalGames > 50 ? 'substantial' : 'growing'} collection.`;
  }

  private categorizeByPlaytime(games: any[]) {
    const ranges = [
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
}
