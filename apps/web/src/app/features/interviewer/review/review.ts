import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Message, SessionDetail } from '../../../core/api.models';
import { ApiService, errorMessage } from '../../../core/api.service';
import { ToastService } from '../../../core/ui-state';
import { DECISION_LABEL, DOMAIN_LABEL, INTENT_LABEL, INTENT_TONE, STATUS_LABEL, hintName } from '../../../shared/labels';
import { MarkdownPipe } from '../../../shared/markdown';
import { ScoreRing } from '../../../shared/score-ring';

type Filter = 'all' | 'flagged' | 'hints';

@Component({
  selector: 'hw-review',
  imports: [RouterLink, MarkdownPipe, ScoreRing],
  templateUrl: './review.html',
  styleUrl: './review.scss',
})
export class Review implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  id = input.required<string>();

  data = signal<SessionDetail | null>(null);
  loading = signal(true);
  error = signal('');
  reevaluating = signal(false);
  filter = signal<Filter>('all');
  answerView = signal<'side' | 'answer' | 'reference'>('side');
  private poll?: ReturnType<typeof setInterval>;

  intentLabel = INTENT_LABEL;
  intentTone = INTENT_TONE;
  decisionLabel = DECISION_LABEL;
  domainLabel = DOMAIN_LABEL;
  statusLabel = STATUS_LABEL;
  hintName = hintName;

  s = computed(() => this.data()?.session ?? null);
  ev = computed(() => this.s()?.evaluation ?? null);
  ins = computed(() => this.s()?.insights ?? null);

  /** Pair each candidate message with the assistant reply that follows it. */
  turns = computed(() => {
    const msgs = this.data()?.messages ?? [];
    const out: { q: Message | null; a: Message | null; idx: number }[] = [];
    let i = 0;
    while (i < msgs.length) {
      const m = msgs[i];
      if (m.role === 'candidate') {
        const next = msgs[i + 1];
        if (next && next.role === 'assistant') {
          out.push({ q: m, a: next, idx: out.length + 1 });
          i += 2;
          continue;
        }
        out.push({ q: m, a: null, idx: out.length + 1 });
      } else {
        out.push({ q: null, a: m, idx: out.length + 1 });
      }
      i++;
    }
    return out;
  });

  filteredTurns = computed(() => {
    const f = this.filter();
    return this.turns().filter((t) => {
      const meta = t.a?.meta ?? t.q?.meta;
      if (f === 'flagged') return this.isFlagged(t.a) || ['solution_request', 'injection'].includes(meta?.intent ?? '');
      if (f === 'hints') return meta?.decision === 'hint' || meta?.intent === 'hint_request';
      return true;
    });
  });

  counts = computed(() => {
    const t = this.turns();
    return {
      all: t.length,
      flagged: t.filter((x) => this.isFlagged(x.a) || ['solution_request', 'injection'].includes((x.a?.meta ?? x.q?.meta)?.intent ?? '')).length,
      hints: t.filter((x) => (x.a?.meta ?? x.q?.meta)?.decision === 'hint' || (x.a?.meta ?? x.q?.meta)?.intent === 'hint_request').length,
      judged: t.filter((x) => this.isFlagged(x.a)).length,
    };
  });

  goodBehaviours = computed(() => (this.ins()?.behaviours ?? []).filter((b) => b.polarity === 'good'));
  concernBehaviours = computed(() => (this.ins()?.behaviours ?? []).filter((b) => b.polarity === 'concern'));

  ngOnInit() {
    this.load();
  }
  ngOnDestroy() {
    clearInterval(this.poll);
  }

  async load(quiet = false) {
    if (!quiet) this.loading.set(true);
    this.error.set('');
    try {
      const d = await this.api.getSession(this.id());
      this.data.set(d);
      // While the background evaluation (or the live session) is running, keep polling.
      const st = d.session.status;
      if ((st === 'submitted' || st === 'in_progress') && !this.poll) {
        this.poll = setInterval(() => this.load(true), st === 'submitted' ? 2500 : 5000);
      } else if (st === 'evaluated' && this.poll) {
        clearInterval(this.poll);
        this.poll = undefined;
      }
    } catch (e) {
      if (!quiet) this.error.set(errorMessage(e, 'Could not load this session.'));
    } finally {
      this.loading.set(false);
    }
  }

  async reevaluate() {
    this.reevaluating.set(true);
    try {
      const session = await this.api.evaluateSession(this.id());
      const d = this.data();
      if (d) this.data.set({ ...d, session });
      this.toast.success('Re-evaluated.');
    } catch (e) {
      this.toast.error(errorMessage(e, 'Evaluation failed.'));
    } finally {
      this.reevaluating.set(false);
    }
  }

  isFlagged(m: Message | null) {
    const v = m?.meta?.judge?.verdict;
    return v === 'rewritten' || v === 'fallback';
  }

  tone(v: number | null | undefined) {
    const x = v ?? 0;
    return x >= 70 ? 'good' : x >= 45 ? 'warn' : 'bad';
  }
  critTone(score: number) {
    return score >= 4 ? 'good' : score >= 2.5 ? 'warn' : 'bad';
  }
  decisionTone(d?: string) {
    return d === 'answer' ? 'good' : d === 'hint' ? 'warn' : d === 'decline' ? 'bad' : 'info';
  }
  verdictWord(v?: string) {
    return v === 'strong' ? 'Strong' : v === 'acceptable' ? 'Acceptable' : v === 'weak' ? 'Weak' : '—';
  }

  /** Plain-English headline, e.g. "Strong · solid answer · used AI well". */
  headlineParts = computed(() => {
    const e = this.ev();
    const i = this.ins();
    const s = this.s();
    if (!e) return [];
    const parts: string[] = [];
    const o = e.overallScore;
    parts.push(o >= 80 ? 'nailed the answer' : o >= 65 ? 'solid answer' : o >= 45 ? 'partly there' : 'missed the key point');
    if (i) {
      const u = i.aiUsageScore;
      parts.push(u >= 70 ? 'used AI well' : u >= 45 ? 'mixed use of AI' : 'leaned on AI too much');
    }
    const flags = s?.integrityFlags ?? 0;
    if (flags > 0) parts.push(`${flags} integrity event${flags === 1 ? '' : 's'}`);
    else if ((s?.hintsUsed ?? 0) === 0) parts.push('no hints needed');
    return parts;
  });
  time(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  duration() {
    const s = this.s();
    if (this.ins()?.stats?.durationMinutes != null) return Math.round(this.ins()!.stats.durationMinutes);
    if (!s?.startedAt || !s?.submittedAt) return null;
    return Math.round((new Date(s.submittedAt).getTime() - new Date(s.startedAt).getTime()) / 60000);
  }
}
