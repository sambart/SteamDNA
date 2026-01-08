import { Injectable } from '@nestjs/common';

@Injectable()
export class PersonaService {
  /**
   * Calculate gaming persona based on playtime statistics
   */
  calculatePersona(totalGames: number, totalPlaytime: number, avgPlaytime: number): string {
    const hoursPlayed = totalPlaytime;

    if (hoursPlayed > 10000) return '하드코어 게이머';
    if (hoursPlayed > 5000) return '헌신적인 게이머';
    if (hoursPlayed > 2000) return '열정적인 게이머';
    if (hoursPlayed > 500) return '일반적인 게이머';
    return '캐쥬얼 게이머';
  }

  /**
   * Generate text summary for user's gaming profile
   */
  generateTextSummary(persona: string, totalGames: number, totalPlaytime: number): string {
    const hours = Math.round(totalPlaytime / 60);
    const collectionSize = totalGames > 100 ? '방대한 규모' : totalGames > 50 ? '상당한 규모' : '성장 중인 규모';

    return `당신은 총 ${totalGames}개 게임을 보유하고, 누적 플레이 시간 ${hours}시간을 기록한 ${persona} 성향의 게이머입니다. 현재 게임 라이브러리는 ${collectionSize}로 구성되어 있습니다.`;
  }
}
