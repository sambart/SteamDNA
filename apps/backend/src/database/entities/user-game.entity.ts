import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Game } from './game.entity';

@Entity('user_games')
@Index(['userId', 'gameId'], { unique: true })
export class UserGame {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column()
  @Index()
  gameId: number;

  @Column()
  appId: number;

  @Column({ type: 'int', default: 0 })
  playtimeForever: number; // in minutes

  @Column({ type: 'int', default: 0, nullable: true })
  playtimeTwoWeeks: number; // in minutes

  @Column({ type: 'timestamp', nullable: true })
  lastPlayedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstPurchasedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: 'simple-json', nullable: true })
  achievements: {
    totalAchievements: number;
    unlockedAchievements: number;
    achievementPercentage: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.userGames, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Game, (game) => game.userGames, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;
}
