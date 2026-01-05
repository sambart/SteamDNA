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

@Entity('analyses')
export class Analysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ length: 100 })
  gamingPersona: string;

  @Column({ type: 'simple-array', nullable: true })
  topGenres: string[];

  @Column({ type: 'int', default: 0 })
  totalGames: number;

  @Column({ type: 'int', default: 0 })
  totalPlaytime: number; // in hours

  @Column({ type: 'int', default: 0 })
  avgPlaytimePerGame: number; // in hours

  @Column({ type: 'jsonb', nullable: true })
  analysisData: {
    topGames?: Array<{ name: string; playtime: number; appId: number }>;
    playtimeDistribution?: Array<{ name: string; value: number }>;
    genreDistribution?: Array<{ genre: string; count: number; totalPlaytime: number }>;
    recentActivity?: number;
    gamesNeverPlayed?: number;
    favoriteGenres?: string[];
    gamingPatterns?: {
      averageSessionLength?: number;
      mostActiveTimeOfDay?: string;
      preferredGameTypes?: string[];
    };
  };

  @Column({ type: 'timestamp' })
  analyzedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.analyses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
