import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { MessageMeta } from '../common/types';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'uuid' }) sessionId: string;
  @Column({ type: 'varchar' }) role: 'candidate' | 'assistant';
  @Column({ type: 'text' }) content: string;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @Column({ type: 'jsonb', nullable: true }) meta: MessageMeta | null;
}
