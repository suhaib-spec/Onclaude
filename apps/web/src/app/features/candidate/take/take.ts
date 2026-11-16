import { Component, ElementRef, OnDestroy, OnInit, computed, inject, input, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Budget, PublicMessage, TakeView } from '../../../core/api.models';
import { ApiService, errorMessage } from '../../../core/api.service';
import { ToastService } from '../../../core/ui-state';
import { AiPolicyView } from '../../../shared/ai-policy';
import { DOMAIN_LABEL, LEVEL_INFO, hintName } from '../../../shared/labels';
import { MarkdownPipe } from '../../../shared/markdown';
import { MaterialView } from '../../../shared/material-view';

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'hw-take',
  imports: [FormsModule, RouterLink, MarkdownPipe, MaterialView, AiPolicyView],
  templateUrl: './take.html',
  styleUrl: './take.scss',
})
export class Take implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  token = input.required<string>();

  view = signal<TakeView | null>(null);
  loading = signal(true);
  error = signal('');
  notFound = signal(false);

  // start screen
  name = '';
  starting = signal(false);

  // workspace
  leftTab = signal<string>('brief');
  answer = '';
  answerMode = signal<'write' | 'preview'>('write');
  saveState = signal<SaveState>('idle');
  lastSaved = signal<Date | null>(null);
  messages = signal<PublicMessage[]>([]);
  /** Chat composer text. A signal (not a plain field) so clearing it after Send reliably re-renders the textarea (zoneless app). */
  draft = signal('');
  thinking = signal(false);
  budget = signal<Budget | null>(null);
  confirmOpen = signal(false);
  submitting = signal(false);
  now = signal(Date.now());

  private saveTimer?: ReturnType<typeof setTimeout>;
  private tick?: ReturnType<typeof setInterval>;
  chatEnd = viewChild<ElementRef<HTMLElement>>('chatEnd');
  composer = viewChild<ElementRef<HTMLTextAreaElement>>('composer');

  domainLabel = DOMAIN_LABEL;
  levelInfo = LEVEL_INFO;
  hintName = hintName;

  phase = computed<'start' | 'work' | 'done'>(() => {
    const st = this.view()?.session.status;
    if (st === 'invited') return 'start';
    if (st === 'in_progress') return 'work';
    return 'done';
  });
  a = computed(() => this.view()?.assessment ?? null);
  policy = computed(() => this.a()?.aiPolicy ?? null);

  remainingMs = computed(() => {
    const v = this.view();
    if (!v?.session.startedAt) return null;
    const end = new Date(v.session.startedAt).getTime() + v.assessment.timeLimitMinutes * 60000;
    return end - this.now();
  });
  timerText = computed(() => {
    const ms = this.remainingMs();
    if (ms == null) return '--:--';
    const neg = ms < 0;
    const t = Math.abs(Math.floor(ms / 1000));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    const core = (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + `:${String(s).padStart(2, '0')}`;
    return (neg ? '+' : '') + core;
  });
  timerTone = computed(() => {
    const ms = this.remainingMs();
    if (ms == null) return '';
    if (ms < 0) return 'over';
    if (ms < 5 * 60000) return 'low';
    return '';
  });
  timerPct = computed(() => {
    const ms = this.remainingMs();
    const total = (this.a()?.timeLimitMinutes ?? 1) * 60000;
    if (ms == null) return 100;
    return Math.max(0, Math.min(100, (ms / total) * 100));
  });

  nextCost = computed(() => {
    const b = this.budget();
    const p = this.policy();
    if (!b || !p || !b.nextHintLevel) return 0;
    return (p.hintCosts as unknown as Record<number, number>)[b.nextHintLevel] ?? 0;
  });
  levels = computed(() => [1, 2, 3, 4]);
  /** Highest hint level unlocked so far (from the session, then updated from hint replies / budget). */
  unlocked = signal(0);

  hintBlockedReason = computed(() => {
    const b = this.budget();
    if (!b) return '';
    if (b.hintBudget <= 0) return 'Hints are disabled for this assessment';
    if (b.hintsUsed >= b.hintBudget) return 'No hints left';
    if (!b.nextHintLevel) return 'All hints unlocked';
    return '';
  });

  suggestions = [
    'What exactly is the question asking me to decide?',
    'Can you explain the key concept I need here?',
    'Which part of the materials should I look at first?',
    'How should I structure my answer?',
  ];

  ngOnInit() {
    this.load();
    this.tick = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.tick);
    if (this.saveState() === 'dirty') this.flushSave();
    clearTimeout(this.saveTimer);
  }

  async load() {
    this.loading.set(true);
    this.error.set('');
    this.notFound.set(false);
    try {
      const v = await this.api.getTake(this.token());
      this.apply(v);
      if (v.session.status === 'in_progress') await this.loadMessages();
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) this.notFound.set(true);
      else this.error.set(errorMessage(e, 'Could not open this invite.'));
    } finally {
      this.loading.set(false);
    }
  }

  private apply(v: TakeView) {
    this.view.set(v);
    this.answer = v.session.answer ?? '';
    if (v.session.candidateName && !this.name) this.name = v.session.candidateName;
    const p = v.assessment.aiPolicy;
    const s = v.session;
    const canHint = s.hintsUsed < p.hintBudget && s.hintLevelUnlocked < p.maxHintLevel;
    this.unlocked.set(s.hintLevelUnlocked ?? 0);
    this.budget.set({
      hintsUsed: s.hintsUsed,
      hintBudget: p.hintBudget,
      hintPointsSpent: s.hintPointsSpent,
      nextHintLevel: canHint ? s.hintLevelUnlocked + 1 : 0,
      maxHintLevel: p.maxHintLevel,
    });
  }

  async loadMessages() {
    try {
      this.messages.set(await this.api.getMessages(this.token()));
      this.scrollChat();
    } catch (e) {
      this.toast.error(errorMessage(e, 'Could not load the chat history.'));
    }
  }

  // ---------- start ----------
  async start() {
    if (!this.name.trim()) {
      this.toast.error('Please enter your name to begin.');
      return;
    }
    this.starting.set(true);
    try {
      const v = await this.api.startTake(this.token(), this.name.trim());
      this.apply(v);
      await this.loadMessages();
    } catch (e) {
      this.toast.error(errorMessage(e, 'Could not start the assessment.'));
    } finally {
      this.starting.set(false);
    }
  }

  // ---------- answer autosave ----------
  onAnswerChange() {
    this.saveState.set('dirty');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.flushSave(), 900);
  }

  async flushSave() {
    clearTimeout(this.saveTimer);
    this.saveState.set('saving');
    try {
      await this.api.saveAnswer(this.token(), this.answer);
      this.saveState.set('saved');
      this.lastSaved.set(new Date());
      return true;
    } catch (e) {
      this.saveState.set('error');
      if (e instanceof HttpErrorResponse && e.status === 409) await this.load();
      else this.toast.error(errorMessage(e, 'Autosave failed. Your text is still here; we will retry.'));
      return false;
    }
  }

  wordCount() {
    const t = this.answer.trim();
    return t ? t.split(/\s+/).length : 0;
  }

  // ---------- chat ----------
  async send(text?: string) {
    const msg = (text ?? this.draft()).trim();
    if (!msg || this.thinking()) return;
    this.draft.set('');
    // Also clear the DOM directly: if paste+Enter happen before a render, the signal goes ''→''→'' and ngModel won't rewrite.
    const box = this.composer()?.nativeElement;
    if (box) box.value = '';
    const temp: PublicMessage = { id: 'tmp-' + Date.now(), role: 'candidate', content: msg, createdAt: new Date().toISOString(), meta: null };
    this.messages.update((m) => [...m, temp]);
    this.scrollChat();
    this.thinking.set(true);
    try {
      const r = await this.api.chat(this.token(), msg);
      this.messages.update((m) => [...m.filter((x) => x.id !== temp.id), r.candidateMessage, r.reply]);
      this.applyBudget(r.budget, r.reply);
    } catch (e) {
      this.messages.update((m) => m.filter((x) => x.id !== temp.id));
      this.draft.set(msg);
      this.handleChatError(e);
    } finally {
      this.thinking.set(false);
      this.scrollChat();
    }
  }

  async getHint() {
    if (this.thinking() || this.hintBlockedReason()) return;
    this.thinking.set(true);
    this.scrollChat();
    try {
      const r = await this.api.hint(this.token());
      this.messages.update((m) => [...m, r.candidateMessage, r.reply]);
      this.applyBudget(r.budget, r.reply);
    } catch (e) {
      this.handleChatError(e);
    } finally {
      this.thinking.set(false);
      this.scrollChat();
    }
  }

  private applyBudget(b: Budget, reply: PublicMessage) {
    this.budget.set(b);
    let u = this.unlocked();
    if (reply.meta?.decision === 'hint' && reply.meta.hintLevel) u = Math.max(u, reply.meta.hintLevel);
    if (b.nextHintLevel) u = Math.max(u, b.nextHintLevel - 1);
    this.unlocked.set(u);
  }

  private async handleChatError(e: unknown) {
    if (e instanceof HttpErrorResponse && e.status === 409) {
      this.toast.show('This assessment has already been submitted.', 'info');
      await this.load();
      return;
    }
    this.toast.error(errorMessage(e, 'The AI could not reply. Please try again.'));
  }

  onChatKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.send();
    }
  }

  private scrollChat() {
    setTimeout(() => this.chatEnd()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' }), 30);
  }

  // ---------- submit ----------
  async submit() {
    this.submitting.set(true);
    try {
      await this.flushSave();
      await this.api.submit(this.token());
      this.confirmOpen.set(false);
      const v = this.view();
      if (v) this.view.set({ ...v, session: { ...v.session, status: 'submitted', answer: this.answer } });
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 409) {
        this.confirmOpen.set(false);
        await this.load();
      } else this.toast.error(errorMessage(e, 'Submit failed. Please try again.'));
    } finally {
      this.submitting.set(false);
    }
  }

  levelState(l: number): 'on' | 'next' | 'locked' | 'off' {
    const b = this.budget();
    const max = b?.maxHintLevel ?? this.policy()?.maxHintLevel ?? 0;
    if (l > max) return 'off';
    if (l <= this.unlocked()) return 'on';
    if (b?.nextHintLevel === l) return 'next';
    return 'locked';
  }
  range(n: number) {
    return Array.from({ length: Math.max(0, n || 0) });
  }
  cost(l: number) {
    return (this.policy()?.hintCosts as unknown as Record<number, number>)?.[l] ?? 0;
  }
  time(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
