import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Competency, CompetencyScore, InterviewStatus, Question, Scorecard, Turn } from './interview.types';

/** One live AI interview grounded in a job description (T-021). */
@Entity('interview_sessions')
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar' }) jobTitle: string;
  @Column({ type: 'varchar' }) company: string;
  @Column({ type: 'text' }) jobDescription: string;
  @Column({ type: 'varchar' }) candidateName: string;
  @Column({ type: 'varchar', default: 'in_progress' }) status: InterviewStatus;
  @Column({ type: 'jsonb', default: () => "'[]'" }) competencies: Competency[];
  @Column({ type: 'jsonb', default: () => "'[]'" }) questions: Question[];
  @Column({ type: 'int', default: 0 }) currentIndex: number;
  @Column({ type: 'boolean', default: false }) followUpAsked: boolean;
  @Column({ type: 'jsonb', default: () => "'[]'" }) transcript: Turn[];
  @Column({ type: 'jsonb', default: () => "'[]'" }) scores: CompetencyScore[];
  @Column({ type: 'jsonb', nullable: true }) scorecard: Scorecard | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) completedAt: Date | null;
}
