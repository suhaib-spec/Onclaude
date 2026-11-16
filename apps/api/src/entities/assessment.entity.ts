import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Domain, Guardrails, Material, RubricCriterion } from '../common/types';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ default: '' }) role: string;
  @Column({ type: 'varchar', default: 'other' }) domain: Domain;
  @Column({ type: 'text', default: '' }) summary: string;
  @Column({ type: 'int', default: 45 }) timeLimitMinutes: number;
  @Column({ type: 'text', default: '' }) problemStatement: string;
  @Column({ type: 'jsonb', default: () => "'[]'" }) materials: Material[];
  /** PROTECTED: never sent to candidates or to the tutor model. */
  @Column({ type: 'text', default: '' }) referenceAnswer: string;
  @Column({ type: 'jsonb', default: () => "'[]'" }) rubric: RubricCriterion[];
  @Column({ type: 'jsonb' }) guardrails: Guardrails;
  @Column({ default: false }) isDemo: boolean;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}
