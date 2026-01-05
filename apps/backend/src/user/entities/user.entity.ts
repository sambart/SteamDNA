import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  steamId: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  profileUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  steamData: any;

  @Column({ type: 'jsonb', nullable: true })
  analysisResult: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
