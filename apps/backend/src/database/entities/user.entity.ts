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
import { Analysis } from './analysis.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  steamId: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  profileUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  accountCreatedAt: Date;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true, length: 2 })
  country: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserGame, (userGame) => userGame.user)
  userGames: UserGame[];

  @OneToMany(() => Analysis, (analysis) => analysis.user)
  analyses: Analysis[];
}
