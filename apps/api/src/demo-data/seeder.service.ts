import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource, Repository } from 'typeorm';
import { normaliseAssessmentInput } from '../assessments/assessment-input';
import { DEMO_DIR } from '../config/paths';
import { Assessment, Message, Session } from '../entities';

/** Fixed demo invite tokens so the live demo URLs are stable (spec §6). */
export const DEMO_INVITES: { domain: string; token: string }[] = [
  { domain: 'business', token: 'PRICING1' },
  { domain: 'data', token: 'ABTEST01' },
];

export interface SeedResult {
  assessments: number;
  sessions: number;
  invites: string[];
  skipped?: boolean;
  existing?: number;
}

/** Loads demo/assessments/*.json and demo/sessions/*.json from the repo root on first start and on reset. */
@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly log = new Logger(SeederService.name);
  lastResult: SeedResult = { assessments: 0, sessions: 0, invites: [] };

  constructor(
    @InjectDataSource() private readonly ds: DataSource,
    @InjectRepository(Assessment) private readonly assessments: Repository<Assessment>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
  ) {}

  async onApplicationBootstrap() {
    try {
      const existing = await this.assessments.count();
      if (existing > 0) {
        this.lastResult = { assessments: 0, sessions: 0, invites: [], skipped: true, existing };
        this.log.log(`Database already has ${existing} assessment(s); skipping seed.`);
        return;
      }
      this.lastResult = await this.seed();
    } catch (err: any) {
      this.log.error(`Seeding failed: ${err?.message ?? err}`);
    }
  }

  async reset(): Promise<SeedResult> {
    await this.ds.query('TRUNCATE TABLE "messages", "sessions", "assessments" RESTART IDENTITY CASCADE');
    this.lastResult = await this.seed();
    return this.lastResult;
  }

  private readJsonDir(sub: string): { file: string; data: any }[] {
    const dir = path.resolve(DEMO_DIR, sub);
    if (!fs.existsSync(dir)) {
      this.log.warn(`Demo folder not found: ${dir} (nothing to seed from it).`);
      return [];
    }
    const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.json')).sort();
    if (!files.length) this.log.warn(`Demo folder is empty: ${dir}`);
    const out: { file: string; data: any }[] = [];
    for (const f of files) {
      try {
        out.push({ file: f, data: JSON.parse(fs.readFileSync(path.resolve(dir, f), 'utf8').replace(/^﻿/, '')) });
      } catch (err: any) {
        this.log.error(`Skipping invalid JSON ${f}: ${err?.message}`);
      }
    }
    return out;
  }

  async seed(): Promise<SeedResult> {
    const result: SeedResult = { assessments: 0, sessions: 0, invites: [] };
    const created: Assessment[] = [];

    for (const { file, data } of this.readJsonDir('assessments')) {
      try {
        const a = await this.assessments.save(this.assessments.create({ ...normaliseAssessmentInput(data), isDemo: true }));
        created.push(a);
        result.assessments++;
      } catch (err: any) {
        this.log.error(`Skipping assessment ${file}: ${err?.message}`);
      }
    }

    for (const { file, data } of this.readJsonDir('sessions')) {
      try {
        const a = created.find((x) => x.title === data.assessmentTitle);
        if (!a) {
          this.log.warn(`Skipping session ${file}: no assessment titled "${data.assessmentTitle}".`);
          continue;
        }
        await this.seedSession(a, data);
        result.sessions++;
      } catch (err: any) {
        this.log.error(`Skipping session ${file}: ${err?.message}`);
      }
    }

    for (const { domain, token } of DEMO_INVITES) {
      const a = created.find((x) => x.domain === domain);
      if (!a) {
        this.log.warn(`No demo assessment with domain "${domain}"; invite ${token} not created.`);
        continue;
      }
      if (await this.sessions.exist({ where: { inviteToken: token } })) continue;
      await this.sessions.save(this.sessions.create({ assessmentId: a.id, inviteToken: token, status: 'invited' }));
      result.invites.push(token);
    }

    this.log.log(`Seeded ${result.assessments} assessment(s), ${result.sessions} completed session(s), invites: ${result.invites.join(', ') || 'none'}.`);
    return result;
  }

  private async seedSession(a: Assessment, d: any) {
    const startedAt = d.startedAt ? new Date(d.startedAt) : new Date(Date.now() - 40 * 60000);
    const submittedAt = d.submittedAt ? new Date(d.submittedAt) : new Date(startedAt.getTime() + 35 * 60000);
    const token = String(d.inviteToken || '').trim().toUpperCase().slice(0, 16) || `DEMO${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const session = await this.sessions.save(
      this.sessions.create({
        assessmentId: a.id,
        inviteToken: token,
        candidateName: d.candidateName ?? null,
        status: d.status === 'submitted' ? 'submitted' : 'evaluated',
        startedAt,
        submittedAt,
        answer: String(d.answer ?? ''),
        hintLevelUnlocked: Number(d.hintLevelUnlocked) || 0,
        hintsUsed: Number(d.hintsUsed) || 0,
        hintPointsSpent: Number(d.hintPointsSpent) || 0,
        integrityFlags: Number(d.integrityFlags) || 0,
        evaluation: d.evaluation ?? null,
        insights: d.insights ?? null,
      }),
    );
    const msgs: any[] = Array.isArray(d.messages) ? d.messages : [];
    // Spread messages across the session (unless they carry their own timestamps), keeping order.
    const span = Math.max(1, submittedAt.getTime() - startedAt.getTime());
    const rows = msgs.map((m, i) =>
      this.messages.create({
        sessionId: session.id,
        role: m.role === 'assistant' ? 'assistant' : 'candidate',
        content: String(m.content ?? ''),
        meta: m.meta ?? null,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(startedAt.getTime() + Math.round(((i + 1) / (msgs.length + 1)) * span * 0.9)),
      }),
    );
    if (rows.length) await this.messages.save(rows);
  }
}
