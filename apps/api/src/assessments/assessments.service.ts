import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newInviteToken } from '../common/token';
import { Assessment, Session } from '../entities';
import { normaliseAssessmentInput } from './assessment-input';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessment) private readonly assessments: Repository<Assessment>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
  ) {}

  async list() {
    const rows = await this.assessments.find({ order: { isDemo: 'DESC', createdAt: 'DESC' } });
    const counts: { assessmentId: string; count: string }[] = await this.sessions
      .createQueryBuilder('s')
      .select('s.assessmentId', 'assessmentId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.assessmentId')
      .getRawMany();
    const byId = new Map(counts.map((c) => [c.assessmentId, Number(c.count)]));
    return rows.map((a) => ({
      id: a.id,
      title: a.title,
      role: a.role,
      domain: a.domain,
      summary: a.summary,
      timeLimitMinutes: a.timeLimitMinutes,
      isDemo: a.isDemo,
      sessionCount: byId.get(a.id) ?? 0,
      createdAt: a.createdAt,
    }));
  }

  async get(id: string): Promise<Assessment> {
    const a = await this.assessments.findOne({ where: { id } }).catch(() => null);
    if (!a) throw new NotFoundException('Assessment not found');
    return a;
  }

  async create(body: any): Promise<Assessment> {
    return this.assessments.save(this.assessments.create(normaliseAssessmentInput(body)));
  }

  async update(id: string, body: any): Promise<Assessment> {
    const existing = await this.get(id);
    const data = normaliseAssessmentInput({ ...body, isDemo: body?.isDemo ?? existing.isDemo });
    await this.assessments.update({ id }, data);
    return this.get(id);
  }

  async remove(id: string): Promise<{ ok: true }> {
    await this.get(id);
    const sessionIds = (await this.sessions.find({ where: { assessmentId: id }, select: { id: true } })).map((s) => s.id);
    await this.assessments.manager.transaction(async (em) => {
      if (sessionIds.length) await em.createQueryBuilder().delete().from('messages').where('"sessionId" IN (:...ids)', { ids: sessionIds }).execute();
      await em.delete(Session, { assessmentId: id });
      await em.delete(Assessment, { id });
    });
    return { ok: true };
  }

  async createInvite(id: string, candidateName?: string, token?: string) {
    await this.get(id);
    let inviteToken = token ?? newInviteToken();
    while (!token && (await this.sessions.exist({ where: { inviteToken } }))) inviteToken = newInviteToken();
    const name = typeof candidateName === 'string' && candidateName.trim() ? candidateName.trim() : null;
    const session = await this.sessions.save(this.sessions.create({ assessmentId: id, inviteToken, candidateName: name, status: 'invited' }));
    return { sessionId: session.id, inviteToken, url: `/take/${inviteToken}` };
  }

  async listSessions(id: string) {
    await this.get(id);
    const rows = await this.sessions.find({ where: { assessmentId: id }, order: { createdAt: 'DESC' } });
    return rows.map((s) => ({
      id: s.id,
      inviteToken: s.inviteToken,
      candidateName: s.candidateName,
      status: s.status,
      hintsUsed: s.hintsUsed,
      finalScore: s.evaluation?.finalScore ?? null,
      aiUsageScore: s.insights?.aiUsageScore ?? null,
      createdAt: s.createdAt,
    }));
  }
}
