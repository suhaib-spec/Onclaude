import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluator } from '../ai/evaluation';
import { InsightsService } from '../ai/insights';
import { Assessment, Message, Session } from '../entities';

/** Interviewer-side session review + the evaluation runner used after submit. */
@Injectable()
export class SessionsService {
  private readonly log = new Logger(SessionsService.name);
  constructor(
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Assessment) private readonly assessments: Repository<Assessment>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    private readonly evaluator: Evaluator,
    private readonly insights: InsightsService,
  ) {}

  async detail(id: string) {
    const session = await this.sessions.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    const a = await this.assessments.findOne({ where: { id: session.assessmentId } });
    if (!a) throw new NotFoundException('Assessment not found');
    const messages = await this.messages.find({ where: { sessionId: id }, order: { createdAt: 'ASC' } });
    return {
      session,
      assessment: { id: a.id, title: a.title, role: a.role, domain: a.domain, rubric: a.rubric, referenceAnswer: a.referenceAnswer },
      messages,
    };
  }

  /** Runs evaluation + insights and marks the session `evaluated`. Never throws for LLM problems (fallbacks). */
  async evaluate(id: string): Promise<Session> {
    const session = await this.sessions.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    const assessment = await this.assessments.findOne({ where: { id: session.assessmentId } });
    if (!assessment) throw new NotFoundException('Assessment not found');
    const messages = await this.messages.find({ where: { sessionId: id }, order: { createdAt: 'ASC' } });
    const [evaluation, insights] = await Promise.all([
      this.evaluator.evaluate(assessment, session),
      this.insights.analyse(assessment, session, messages),
    ]);
    const status = session.status === 'invited' || session.status === 'in_progress' ? session.status : 'evaluated';
    await this.sessions.update({ id }, { evaluation, insights, status });
    return (await this.sessions.findOne({ where: { id } }))!;
  }

  /** Fire-and-forget evaluation after submit. */
  evaluateInBackground(id: string): void {
    setImmediate(() => {
      this.evaluate(id)
        .then((s) => this.log.log(`Evaluated session ${id}: final score ${s.evaluation?.finalScore}`))
        .catch((err) => this.log.error(`Background evaluation failed for ${id}: ${err?.message ?? err}`));
    });
  }
}
