import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Evaluation, Insights, SessionStatus } from '../common/types';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'uuid' }) assessmentId: string;
  @Index({ unique: true }) @Column({ type: 'varchar', length: 16 }) inviteToken: string;
  @Column({ type: 'varchar', nullable: true }) candidateName: string | null;
  @Column({ type: 'varchar', default: 'invited' }) status: SessionStatus;
  @Column({ type: 'timestamptz', nullable: true }) startedAt: Date | null;
  @Column({ type: 'timestamptz', nullable: true }) submittedAt: Date | null;
  @Column({ type: 'text', default: '' }) answer: string;
  @Column({ type: 'int', default: 0 }) hintLevelUnlocked: number;
  @Column({ type: 'int', default: 0 }) hintsUsed: number;
  @Column({ type: 'int', default: 0 }) hintPointsSpent: number;
  @Column({ type: 'int', default: 0 }) integrityFlags: number;
  @Column({ type: 'jsonb', nullable: true }) evaluation: Evaluation | null;
  @Column({ type: 'jsonb', nullable: true }) insights: Insights | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}
