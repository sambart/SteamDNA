import { Injectable } from '@nestjs/common';

@Injectable()
export class PersonaService {
  /**
   * Calculate gaming persona based on playtime statistics
   */
  calculatePersona(totalGames: number, totalPlaytime: number, avgPlaytime: number): string {
    const hoursPlayed = totalPlaytime / 60;

    if (hoursPlayed > 10000) return 'Hardcore Gamer';
    if (hoursPlayed > 5000) return 'Dedicated Gamer';
    if (hoursPlayed > 2000) return 'Enthusiast';
    if (hoursPlayed > 500) return 'Regular Gamer';
    return 'Casual Gamer';
  }

  /**
   * Generate text summary for user's gaming profile
   */
  generateTextSummary(persona: string, totalGames: number, totalPlaytime: number): string {
    const hours = Math.round(totalPlaytime / 60);
    const collectionSize = totalGames > 100 ? 'vast' : totalGames > 50 ? 'substantial' : 'growing';

    return `You are a ${persona} with ${totalGames} games and ${hours} hours of total playtime. Your gaming library shows a ${collectionSize} collection.`;
  }
}
