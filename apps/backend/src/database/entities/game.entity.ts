import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserGame } from './user-game.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  appId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string;

  @Column({ nullable: true })
  headerImage: string;

  @Column({ type: 'simple-array', nullable: true })
  genres: string[];

  @Column({ type: 'simple-array', nullable: true })
  developers: string[];

  @Column({ type: 'simple-array', nullable: true })
  publishers: string[];

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentPrice: number;

  @Column({ default: false })
  isFree: boolean;

  @Column({ type: 'int', nullable: true })
  metacriticScore: number;

  @Column({ type: 'int', nullable: true })
  steamRating: number;

  @Column({ type: 'simple-json', nullable: true })
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserGame, (userGame) => userGame.game)
  userGames: UserGame[];
}
