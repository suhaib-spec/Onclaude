import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GatedAssistant } from '../ai/gated-assistant';
import { Assessment, Message, Session } from '../entities';
import { SessionsService } from '../sessions/sessions.service';
import { toBudget, toPublicMessage, toTakeView } from './public-view';

const MAX_ANSWER_LENGTH = 50_000;

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Assessment) private readonly assessments: Repository<Assessment>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    private readonly assistant: GatedAssistant,
    private readonly sessionsService: SessionsService,
  ) {}

  private async load(token: string): Promise<{ session: Session; assessment: Assessment }> {
    const session = await this.sessions.findOne({ where: { inviteToken: String(token ?? '').trim().toUpperCase() } });
    if (!session) throw new NotFoundException('Invite not found');
    const assessment = await this.assessments.findOne({ where: { id: session.assessmentId } });
    if (!assessment) throw new NotFoundException('Assessment not found');
    return { session, assessment };
  }

  private assertOpen(session: Session) {
    if (session.status === 'submitted' || session.status === 'evaluated') {
      throw new ConflictException('This assessment has already been submitted.');
    }
  }

  /** Starting is implicit for chat/answer so a candidate never hits a dead end. */
  private async ensureStarted(session: Session, candidateName?: string) {
    if (session.status !== 'invited') return;
    session.status = 'in_progress';
    session.startedAt = new Date();
    if (candidateName?.trim()) session.candidateName = candidateName.trim().slice(0, 120);
    await this.sessions.save(session);
  }

  async view(token: string) {
    const { session, assessment } = await this.load(token);
    return toTakeView(session, assessment);
  }

  async start(token: string, candidateName?: string) {
    const { session, assessment } = await this.load(token);
    if (session.status === 'invited') await this.ensureStarted(session, candidateName);
    else if (candidateName?.trim() && !session.candidateName) {
      session.candidateName = candidateName.trim().slice(0, 120);
      await this.sessions.save(session);
    }
    return toTakeView(session, assessment);
  }

  async listMessages(token: string) {
    const { session } = await this.load(token);
    const rows = await this.messages.find({ where: { sessionId: session.id }, order: { createdAt: 'ASC' } });
    return rows.map(toPublicMessage);
  }

  async chat(token: string, message: string | undefined, hintButton: boolean) {
    const { session, assessment } = await this.load(token);
    this.assertOpen(session);
    if (!hintButton && !String(message ?? '').trim()) throw new BadRequestException('Message is empty.');
    await this.ensureStarted(session);
    const history = await this.messages.find({ where: { sessionId: session.id }, order: { createdAt: 'ASC' } });

    const turn = await this.assistant.respond({ assessment, session, history, message, hintButton });

    const candidateMessage = await this.messages.save(
      this.messages.create({ sessionId: session.id, role: 'candidate', content: turn.candidateText, meta: turn.candidateMeta }),
    );
    // Ensure the reply sorts strictly after the candidate message.
    const reply = await this.messages.save(
      this.messages.create({
        sessionId: session.id,
        role: 'assistant',
        content: turn.replyText,
        meta: turn.replyMeta,
        createdAt: new Date(new Date(candidateMessage.createdAt).getTime() + 1),
      }),
    );
    Object.assign(session, turn.counters);
    await this.sessions.update({ id: session.id }, turn.counters);

    return { candidateMessage: toPublicMessage(candidateMessage), reply: toPublicMessage(reply), budget: toBudget(session, assessment) };
  }

  async saveAnswer(token: string, answer: unknown) {
    const { session } = await this.load(token);
    this.assertOpen(session);
    await this.ensureStarted(session);
    await this.sessions.update({ id: session.id }, { answer: String(answer ?? '').slice(0, MAX_ANSWER_LENGTH) });
    return { ok: true as const };
  }

  async submit(token: string) {
    const { session } = await this.load(token);
    this.assertOpen(session);
    await this.sessions.update({ id: session.id }, { status: 'submitted', submittedAt: new Date(), startedAt: session.startedAt ?? new Date() });
    this.sessionsService.evaluateInBackground(session.id);
    return { status: 'submitted' as const };
  }
}
