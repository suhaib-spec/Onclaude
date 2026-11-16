import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
  private convo = viewChild<ElementRef<HTMLElement>>('convo');

  s = signal<InterviewSession | null>(null);
  error = signal('');
  view = signal<View>('both');
  answerSig = signal('');
  get answer() { return this.answerSig(); }
  set answer(v: string) { this.answerSig.set(v); }
  /** Live voice preview: words already recognised + words still being recognised. */
  micFinalText = signal('');
  micInterim = signal('');
  /** Learned speaking pace of the chosen voice (ms per character), refined after every sentence. */
  private msPerChar = 62;
  sending = signal(false);
  pending = signal('');
  /** How many transcript turns are revealed (new interviewer turns appear one by one). */
  shownCount = signal(0);
  typing = signal(false);
  speaking = signal(false);
  readAloud = signal(true);
  /** The interviewer turn currently being "typed" live, and how much of it is visible. */
  streamId = signal<string | null>(null);
  streamText = signal('');
  micError = signal('');
  listening = signal(false);
  micSupported = typeof window !== 'undefined' && !!((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);
  ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  recClass = REC_CLASS;
  private rec: any = null;
  private voice: SpeechSynthesisVoice | null = null;
  voices = signal<{ name: string; natural: boolean }[]>([]);
  voiceName = signal('');
  hasNatural = computed(() => this.voices().some((v) => v.natural && /Natural/i.test(v.name)));
  setVoice(name: string) {
    const v = speechSynthesis.getVoices().find((x) => x.name === name);
    if (!v) return;
    this.voice = v;
    this.voiceName.set(name);
    try { localStorage.setItem('hw.voice', name); } catch { /* storage unavailable */ }
    speechSynthesis.cancel();
    const sample = new SpeechSynthesisUtterance("Hi, I'm Ava. Let's get started.");
    sample.voice = v;
    speechSynthesis.speak(sample);
  }
  shortVoice(n: string) {
    return n.replace(/^Microsoft\s+/, '').replace(/\s*-\s*English.*$/, '').replace(/Online\s*/, '');
  }
  private spokeOnce = false;
  private micWanted = false;
  private micBase = '';
  private micFinal = '';
  private streamTimer: ReturnType<typeof setInterval> | null = null;
  private ta = viewChild<ElementRef<HTMLTextAreaElement>>('ta');
  private revealTimer: ReturnType<typeof setTimeout> | null = null;

  turns = computed(() => (this.s()?.transcript ?? []).slice(0, this.shownCount()));
  /** The newest interviewer line that asks something (or the closing line). */
  /** Text for the big question header: follows Ava's voice while she is speaking it. */
  promptText = computed(() => {
    const p = this.prompt();
    if (!p) return '';
    return p.id === this.streamId() ? this.streamText() : p.text;
  });
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
    if (this.ttsSupported) {
      const pick = () => {
        const vs = speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('en'));
        // Natural (neural) voices first: Edge ships Microsoft "Online (Natural)" voices; Chrome has Google voices.
        const rank = (v: SpeechSynthesisVoice) => {
          const n = v.name;
          if (/Ava.*Natural/i.test(n)) return 0;
          if (/(Jenny|Emma|Aria|Michelle).*Natural/i.test(n)) return 1;
          if (/Natural/i.test(n)) return 2;
          if (/Google US English/i.test(n)) return 3;
          if (/Google UK English Female|Samantha|Karen|Moira/i.test(n)) return 4;
          if (/Google/i.test(n)) return 5;
          return 9;
        };
        const sorted = [...vs].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
        this.voices.set(sorted.map((v) => ({ name: v.name, natural: rank(v) <= 3 })));
        let saved: string | null = null;
        try { saved = localStorage.getItem('hw.voice'); } catch { /* storage unavailable */ }
        this.voice = sorted.find((v) => v.name === saved) ?? sorted[0] ?? null;
        this.voiceName.set(this.voice?.name ?? '');
      };
      pick();
      speechSynthesis.onvoiceschanged = pick;
      // Browsers only allow speech after the user has interacted with the page: speak the current question on the first click.
      const unlock = () => {
        document.removeEventListener('pointerdown', unlock);
        if (!this.spokeOnce && this.readAloud() && this.prompt() && !this.done()) this.say(this.prompt()!.text);
      };
      document.addEventListener('pointerdown', unlock);
    }
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
    if (this.streamTimer) clearInterval(this.streamTimer);
    this.micWanted = false;
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
    this.autoGrow();
    if (this.ttsSupported) speechSynthesis.cancel();
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

  /** Show turns from `from` onward one at a time; Ava's lines appear in step with her voice (or typed, if voice is off). */
  private revealFrom(from: number) {
    if (this.revealTimer) clearTimeout(this.revealTimer);
    if (this.streamTimer) clearInterval(this.streamTimer);
    const all = this.s()?.transcript ?? [];
    let i = from;
    const step = () => {
      if (i >= all.length) { this.streamId.set(null); return; }
      const t = all[i++];
      this.shownCount.set(i);
      this.scrollSoon();
      if (t.role !== 'interviewer') { this.revealTimer = setTimeout(step, 250); return; }
      this.streamTurn(t, step);
    };
    step();
  }

  private streamTurn(t: Turn, next: () => void) {
    const full = t.text;
    const words = full.split(/(\s+)/); // words and the spaces between them
    let shown = 0; // characters visible
    let finished = false;
    let voiceStarted = false;
    let fallback: ReturnType<typeof setTimeout> | null = null;
    let backstop: ReturnType<typeof setTimeout> | null = null;
    this.streamId.set(t.id);
    this.streamText.set('');

    const show = (chars: number) => {
      if (chars <= shown) return;
      shown = Math.min(full.length, chars);
      this.streamText.set(full.slice(0, shown));
      this.scrollSoon();
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      if (this.streamTimer) { clearInterval(this.streamTimer); this.streamTimer = null; }
      if (fallback) clearTimeout(fallback);
      if (backstop) clearTimeout(backstop);
      this.speaking.set(false);
      this.streamText.set(full);
      this.streamId.set(null);
      this.scrollSoon();
      this.revealTimer = setTimeout(next, 350);
    };
    /** Reveal word by word; msPerWord ≈ speaking pace when the voice is on. */
    const type = (msPerWord: number, endWhenDone: boolean) => {
      if (this.streamTimer) clearInterval(this.streamTimer);
      let w = 0;
      this.streamTimer = setInterval(() => {
        w = Math.min(words.length, w + 2);
        show(words.slice(0, w).join('').length);
        if (w >= words.length) {
          clearInterval(this.streamTimer!);
          this.streamTimer = null;
          if (endWhenDone) finish();
        }
      }, msPerWord);
    };

    if (!this.readAloud() || !this.ttsSupported) return type(60, true);

    this.spokeOnce = true;
    const u = new SpeechSynthesisUtterance(full);
    if (this.voice) u.voice = this.voice;
    u.rate = 1;
    u.pitch = 1;
    let t0 = 0;
    let sawBoundary = false;
    u.onstart = () => {
      voiceStarted = true;
      if (fallback) clearTimeout(fallback);
      this.speaking.set(true);
      t0 = performance.now();
      // Reveal by elapsed time at the voice's learned pace, slightly ahead so the text never trails the voice.
      if (this.streamTimer) clearInterval(this.streamTimer);
      this.streamTimer = setInterval(() => {
        const chars = ((performance.now() - t0) / this.msPerChar) * 1.12 + 6;
        const cut = full.indexOf(' ', Math.floor(chars));
        show(cut === -1 ? full.length : cut);
      }, 50);
      backstop = setTimeout(finish, full.length * 120 + 4000); // some voices never fire 'end'
    };
    u.onboundary = (e: SpeechSynthesisEvent) => {
      sawBoundary = true;
      const len = e.charLength || (full.slice(e.charIndex).match(/^\S+/)?.[0].length ?? 0);
      show(e.charIndex + len);
    };
    u.onend = () => {
      if (t0 && full.length > 40) {
        const measured = (performance.now() - t0) / full.length;
        if (measured > 25 && measured < 140) this.msPerChar = this.msPerChar * 0.4 + measured * 0.6; // learn the real pace
      }
      void sawBoundary;
      finish();
    };
    u.onerror = () => (voiceStarted ? finish() : type(60, true));
    speechSynthesis.speak(u);
    // Autoplay blocked (no click on the page yet): show the text anyway; the voice starts after the first click.
    fallback = setTimeout(() => { if (!voiceStarted) { speechSynthesis.cancel(); type(60, true); } }, 1500);
  }

  shown(t: Turn) {
    return t.id === this.streamId() ? this.streamText() : t.text;
  }

  private say(text: string) {
    if (!this.readAloud() || !this.ttsSupported) return;
    this.spokeOnce = true;
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.rate = 1;
    u.pitch = 1;
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
    this.micError.set('');
    const Ctor = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!Ctor) {
      this.micError.set('Voice input needs Chrome or Edge. You can still type your answer.');
      return;
    }
    if (this.ttsSupported) speechSynthesis.cancel(); // don't transcribe Ava's own voice
    this.micWanted = true;
    this.micBase = this.answer ? this.answer.trimEnd() + ' ' : '';
    this.micFinal = '';
    this.micFinalText.set('');
    this.micInterim.set('');
    const start = () => {
      const rec = new Ctor();
      rec.lang = 'en-US';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e: any) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) this.micFinal += r[0].transcript.trim() + ' ';
          else interim += r[0].transcript;
        }
        this.micFinalText.set(this.micFinal.trim());
        this.micInterim.set(interim.trim());
        this.answer = (this.micBase + this.micFinal + interim).replace(/\s+/g, ' ').trimStart();
        this.cdr.markForCheck(); // zoneless app: speech events don't trigger a re-render on their own
        this.autoGrow();
      };
      rec.onerror = (e: any) => {
        if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
          this.micWanted = false;
          this.micError.set('Microphone is blocked. Allow it from the icon in the address bar, then try again.');
        } else if (e?.error === 'audio-capture') {
          this.micWanted = false;
          this.micError.set('No microphone found.');
        } else if (e?.error === 'network') {
          this.micWanted = false;
          this.listening.set(false);
          this.micError.set('Voice typing is not available in this browser. Open the app in Google Chrome, or type your answer.');
        }
        this.cdr.markForCheck();
      };
      // Chrome stops after a pause: keep listening until the user presses stop.
      rec.onend = () => (this.micWanted ? setTimeout(() => this.micWanted && start(), 120) : this.listening.set(false));
      this.rec = rec;
      try { rec.start(); } catch { /* already started */ }
    };
    start();
    this.listening.set(true);
  }
  private stopMic() {
    this.micInterim.set('');
    this.micWanted = false;
    this.rec?.stop?.();
    this.listening.set(false);
  }

  autoGrow() {
    setTimeout(() => {
      const el = this.ta()?.nativeElement;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 180) + 'px';
    });
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
