import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserGame } from '../../database/entities';
import { SteamService } from '../../steam/steam.service';

@Injectable()
export class UserDataService {
  private readonly logger = new Logger(UserDataService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserGame)
    private userGameRepository: Repository<UserGame>,
    private steamService: SteamService,
  ) {}

  /**
   * Save or update user data from Steam player data
   */
  async saveUserData(playerData: any): Promise<User> {
    let user = await this.userRepository.findOne({ where: { steamId: playerData.steamid } });

    if (!user) {
      user = this.userRepository.create({
        steamId: playerData.steamid,
        displayName: playerData.personaname,
        avatar: playerData.avatarfull,
        accountCreatedAt: playerData.timecreated ? new Date(playerData.timecreated * 1000) : null,
        isPublic: playerData.communityvisibilitystate === 3,
      });
    } else {
      user.displayName = playerData.personaname;
      user.avatar = playerData.avatarfull;
      user.isPublic = playerData.communityvisibilitystate === 3;
    }

    return this.userRepository.save(user);
  }

  /**
   * Find user by Steam ID
   */
  async findBySteamId(steamId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { steamId } });
  }

  /**
   * Save user-game relationships in bulk
   * Updates playtime, last played date, and achievements
   */
  async saveUserGames(userId: number, gameList: any[], gameIdMap: Map<number, number>): Promise<void> {
    // Bulk fetch existing user-game relationships
    const gameIds = Array.from(gameIdMap.values());
    const existingUserGames = await this.userGameRepository.find({
      where: { userId, gameId: In(gameIds) },
    });

    const existingUserGameMap = new Map(
      existingUserGames.map(ug => [ug.gameId, ug])
    );

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const userGamesToSave: UserGame[] = [];

    for (const gameData of gameList) {
      try {
        // Validate appId exists
        if (!gameData.appid) {
          this.logger.warn(`Skipping game with missing appId for user ${userId}`);
          continue;
        }

        const gameId = gameIdMap.get(gameData.appid);
        if (!gameId) {
          this.logger.warn(`Game not found in database for appId: ${gameData.appid}`);
          continue;
        }

        const existingUserGame = existingUserGameMap.get(gameId);

        const achievementData = gameData.has_community_visible_stats
          ? await this.steamService.getPlayerAchievements(user?.steamId || '', gameData.appid)
          : null;

        const userGameData = {
          appId: gameData.appid, // Add appId field
          playtimeForever: gameData.playtime_forever || 0,
          lastPlayedAt: gameData.rtime_last_played
            ? new Date(gameData.rtime_last_played * 1000)
            : null,
          achievements: achievementData
            ? {
                totalAchievements: achievementData.totalAchievements,
                unlockedAchievements: achievementData.unlockedAchievements,
                achievementPercentage: achievementData.achievementPercentage,
              }
            : null,
        };

        if (existingUserGame) {
          Object.assign(existingUserGame, userGameData);
          userGamesToSave.push(existingUserGame);
        } else {
          const newUserGame = this.userGameRepository.create({
            userId,
            gameId,
            ...userGameData,
          });
          userGamesToSave.push(newUserGame);
        }
      } catch (error) {
        this.logger.error(`Failed to prepare user-game relationship for appId ${gameData.appid}: ${error.message}`);
      }
    }

    // Bulk save all user-game relationships
    if (userGamesToSave.length > 0) {
      await this.userGameRepository.save(userGamesToSave);
      this.logger.log(`Bulk saved ${userGamesToSave.length} user-game relationships`);
    }
  }

  /**
   * Get user games by user ID
   */
  async findUserGamesByUserId(userId: number): Promise<UserGame[]> {
    return this.userGameRepository.find({
      where: { userId },
      relations: ['game'],
    });
  }
}
