import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

export type Role = 'interviewer' | 'candidate';

export interface Toast {
  id: number;
  kind: 'error' | 'success' | 'info';
  text: string;
}

/** Toast notifications (top-right). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  show(text: string, kind: Toast['kind'] = 'info', ms = 4200) {
    const id = ++this.seq;
    // collapse duplicates so a dead backend doesn't stack ten identical errors
    this.toasts.update((t) => [...t.filter((x) => x.text !== text), { id, kind, text }].slice(-4));
    setTimeout(() => this.dismiss(id), ms);
  }
  error(text: string) {
    this.show(text, 'error', 6000);
  }
  success(text: string) {
    this.show(text, 'success');
  }
  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

/** Demo role switch (no auth), persisted in localStorage, plus API health / LLM mode. */
@Injectable({ providedIn: 'root' })
export class AppState {
  private api = inject(ApiService);

  readonly role = signal<Role>((localStorage.getItem('hintwise.role') as Role) || 'interviewer');
  readonly llmMode = signal<'live' | 'mock' | null>(null);
  readonly apiDown = signal(false);
  readonly apiChecked = signal(false);
  readonly modeLabel = computed(() => (this.apiDown() ? 'API offline' : this.llmMode() === 'live' ? 'LLM: Live' : this.llmMode() === 'mock' ? 'LLM: Mock' : 'LLM: …'));

  setRole(r: Role) {
    this.role.set(r);
    localStorage.setItem('hintwise.role', r);
  }

  async checkHealth() {
    try {
      const h = await this.api.health();
      this.llmMode.set(h.llmMode);
      this.apiDown.set(false);
    } catch {
      this.apiDown.set(true);
    } finally {
      this.apiChecked.set(true);
    }
  }
}
