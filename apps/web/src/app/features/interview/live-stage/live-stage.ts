import { Component, ElementRef, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InterviewSession, LiveScore, Recommendation, Turn } from '../../../core/api.models';
import { ApiService, errorMessage } from '../../../core/api.service';
import { ScoreRing } from '../../../shared/score-ring';
import { RubricCard } from '../components/rubric-card';
import { Typewriter } from '../components/typewriter';

type View = 'both' | 'candidate' | 'interviewer';

function recommend(overall: number): Recommendation {
  return overall >= 80 ? 'Strong hire' : overall >= 65 ? 'Hire' : overall >= 50 ? 'Lean no' : 'No hire';
}
export const REC_CLASS: Record<Recommendation, string> = { 'Strong hire': 'good', Hire: 'good', 'Lean no': 'warn', 'No hire': 'bad' };

/** /live/:id — the stage view: candidate room (left) and live interviewer scoring (right). T-021. */
@Component({
  selector: 'hw-live-stage',
  imports: [FormsModule, RouterLink, ScoreRing, RubricCard, Typewriter],
  templateUrl: './live-stage.html',
  styleUrl: './live-stage.scss',
})
export class LiveStage implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private convo = viewChild<ElementRef<HTMLElement>>('convo');

  s = signal<InterviewSession | null>(null);
  error = signal('');
  view = signal<View>('both');
  answer = '';
  sending = signal(false);
  pending = signal('');
  /** How many transcript turns are revealed (new interviewer turns appear one by one). */
  shownCount = signal(0);
  typing = signal(false);
  speaking = signal(false);
  readAloud = signal(false);
  listening = signal(false);
  micSupported = typeof window !== 'undefined' && !!((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
  ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  recClass = REC_CLASS;
  private rec: any = null;
  private revealTimer: ReturnType<typeof setTimeout> | null = null;

  turns = computed(() => (this.s()?.transcript ?? []).slice(0, this.shownCount()));
  /** The newest interviewer line that asks something (or the closing line). */
  prompt = computed<Turn | undefined>(() => {
    const t = this.turns();
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i].role === 'interviewer' && t[i].kind !== 'ack') return t[i];
    }
    return undefined;
  });
  revealing = computed(() => this.shownCount() < (this.s()?.transcript.length ?? 0));
  done = computed(() => this.s()?.status === 'completed' && !this.revealing());
  total = computed(() => this.s()?.questions.length ?? 4);
  qIndex = computed(() => {
    const p = this.prompt();
    const idx = p?.questionIndex ?? this.s()?.currentIndex ?? 0;
    return Math.min(idx, this.total() - 1);
  });
  progress = computed(() => (this.done() ? 100 : ((this.qIndex() + (this.prompt()?.kind === 'follow_up' ? 0.5 : 0)) / this.total()) * 100));
  currentComp = computed(() => {
    const s = this.s();
    if (!s || this.done()) return undefined;
    const cid = this.prompt()?.competencyId ?? s.questions[this.qIndex()]?.competencyId;
    return s.competencies.find((c) => c.id === cid);
  });
  speakingNow = computed(() => this.typing() || this.speaking() || this.revealing());

  /** Latest per-answer score for each skill. */
  latestByComp = computed(() => {
    const m: Record<string, LiveScore> = {};
    for (const t of this.s()?.transcript ?? []) if (t.liveScore) m[t.liveScore.competencyId] = t.liveScore;
    return m;
  });
  scoreFor(id: string) {
    return this.s()?.scores.find((x) => x.competencyId === id);
  }
  answeredCount = computed(() => (this.s()?.transcript ?? []).filter((t) => t.role === 'candidate').length);
  overall = computed<number | null>(() => {
    const s = this.s();
    if (!s) return null;
    if (s.scorecard) return s.scorecard.overall;
    let w = 0, sum = 0;
    for (const c of s.scores) if (c.score > 0) { w += c.weight; sum += c.score * c.weight; }
    return w ? Math.round((sum / w) * 20) : null;
  });
  recommendation = computed<Recommendation | null>(() => {
    const s = this.s();
    if (s?.scorecard) return s.scorecard.recommendation;
    const o = this.overall();
    return o == null ? null : recommend(o);
  });
  cta = computed(() => {
    const s = this.s();
    if (s?.scorecard) return s.scorecard.cta;
    const r = this.recommendation();
    if (!r) return 'Live read: waiting for the first answer…';
    const n = this.answeredCount();
    return `Live read: leaning ${r} after ${n} answer${n === 1 ? '' : 's'}. Final call when the interview ends.`;
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    try {
      const s = await this.api.getInterview(id);
      this.s.set(s);
      // Fresh interview: reveal greeting then question; otherwise show everything.
      if (s.transcript.length <= 2 && s.status === 'in_progress') this.revealFrom(0);
      else this.shownCount.set(s.transcript.length);
      this.scrollSoon();
    } catch (e) {
      this.error.set(errorMessage(e, 'Could not load this interview.'));
    }
  }
  ngOnDestroy() {
    if (this.revealTimer) clearTimeout(this.revealTimer);
    this.rec?.stop?.();
    if (this.ttsSupported) speechSynthesis.cancel();
  }

  setView(v: View) {
    this.view.set(v);
  }

  async send() {
    const text = this.answer.trim();
    const s = this.s();
    if (!text || !s || this.sending() || s.status === 'completed') return;
    this.stopMic();
    this.sending.set(true);
    this.pending.set(text);
    this.answer = '';
    this.scrollSoon();
    const before = s.transcript.length;
    try {
      const next = await this.api.answerInterview(s.id, text);
      this.pending.set('');
      this.s.set(next);
      this.shownCount.set(before);
      this.revealFrom(before);
    } catch (e) {
      this.answer = text;
      this.pending.set('');
      this.error.set(errorMessage(e, 'Could not send your answer.'));
    } finally {
      this.sending.set(false);
    }
  }

  async finish() {
    const s = this.s();
    if (!s || s.status === 'completed') return;
    if (!confirm('End the interview now and produce the scorecard?')) return;
    const before = s.transcript.length;
    try {
      const next = await this.api.finishInterview(s.id);
      this.s.set(next);
      this.revealFrom(before);
    } catch (e) {
      this.error.set(errorMessage(e, 'Could not finish the interview.'));
    }
  }

  onKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.send();
    }
  }

  /** Show turns from `from` onward one at a time so the interviewer appears to respond live. */
  private revealFrom(from: number) {
    if (this.revealTimer) clearTimeout(this.revealTimer);
    const all = this.s()?.transcript ?? [];
    let i = from;
    const step = () => {
      if (i >= all.length) return;
      const t = all[i++];
      this.shownCount.set(i);
      this.scrollSoon();
      if (t.role === 'interviewer') this.say(t.text);
      const delay = t.role === 'candidate' ? 350 : Math.min(2200, 500 + t.text.length * 12);
      this.revealTimer = setTimeout(step, delay);
    };
    step();
  }

  private say(text: string) {
    if (!this.readAloud() || !this.ttsSupported) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.03;
    u.onstart = () => this.speaking.set(true);
    u.onend = () => this.speaking.set(false);
    speechSynthesis.speak(u);
  }

  toggleRead() {
    this.readAloud.update((v) => !v);
    if (!this.readAloud() && this.ttsSupported) {
      speechSynthesis.cancel();
      this.speaking.set(false);
    } else if (this.prompt()) this.say(this.prompt()!.text);
  }

  toggleMic() {
    if (this.listening()) return this.stopMic();
    const Ctor = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    const base = this.answer ? this.answer.trimEnd() + ' ' : '';
    rec.onresult = (e: any) => {
      let txt = '';
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      this.answer = base + txt;
    };
    rec.onend = () => this.listening.set(false);
    rec.onerror = () => this.listening.set(false);
    this.rec = rec;
    rec.start();
    this.listening.set(true);
  }
  private stopMic() {
    this.rec?.stop?.();
    this.listening.set(false);
  }

  compName(id?: string) {
    return this.s()?.competencies.find((c) => c.id === id)?.name ?? '';
  }

  private scrollSoon() {
    setTimeout(() => {
      const el = this.convo()?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 30);
  }
}
