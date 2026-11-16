import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AssessmentSummary } from '../../../core/api.models';
import { ApiService, errorMessage } from '../../../core/api.service';
import { ToastService } from '../../../core/ui-state';
import { LiveInterviewsList } from '../../interview/components/live-interviews-list';
import { DOMAIN_ICON, DOMAIN_LABEL, relTime } from '../../../shared/labels';

@Component({
  selector: 'hw-dashboard',
  imports: [RouterLink, LiveInterviewsList],
  template: `
    <div class="page">
      <div class="hero-band">
        <div>
          <span class="chip grad">Interviewer workspace</span>
          <h1>Your assessments</h1>
          <p class="sub">Create a case, set the rules for the AI helper, invite candidates, and see how well they work with AI.</p>
        </div>
        <div class="row">
          <button class="btn ghost light" (click)="reset()" [disabled]="resetting()" title="Wipe and reseed demo data">
            @if (resetting()) { <span class="spinner"></span> } ↺ Reset demo
          </button>
          <a class="btn lg white" routerLink="/interviewer/assessments/new">＋ New assessment</a>
        </div>
      </div>

      <hw-live-interviews-list />
      <h2 class="sec">🧩 Case assessments</h2>

      @if (loading()) {
        <div class="cards">
          @for (i of [1, 2, 3]; track i) {
            <div class="skeleton" style="height: 200px"></div>
          }
        </div>
      } @else if (error()) {
        <div class="banner">⚠️ {{ error() }} <span class="spacer"></span><button class="btn sm" (click)="load()">Retry</button></div>
      } @else if (!items().length) {
        <div class="empty">
          <div class="big">🧩</div>
          <h3>No assessments yet</h3>
          <p>Create your first one, or reset the demo data to load the two sample cases.</p>
          <div class="row" style="justify-content: center; margin-top: 16px">
            <a class="btn primary" routerLink="/interviewer/assessments/new">＋ New assessment</a>
            <button class="btn" (click)="reset()">↺ Load demo data</button>
          </div>
        </div>
      } @else {
        <div class="cards">
          @for (a of items(); track a.id; let i = $index) {
            <div class="card hover acard" [style.animation-delay.ms]="i * 50" (click)="open(a)">
              <div class="row">
                <span class="dom-ic">{{ icon[a.domain] }}</span>
                <span class="chip accent">{{ label[a.domain] }}</span>
                @if (a.isDemo) { <span class="chip warn">★ Demo</span> }
                <span class="spacer"></span>
                <span class="muted small">{{ rel(a.createdAt) }}</span>
              </div>
              <h3>{{ a.title }}</h3>
              <p class="summary">{{ a.summary }}</p>
              <div class="meta">
                <span>👤 {{ a.role }}</span>
                <span>⏱ {{ a.timeLimitMinutes }} min</span>
                <span class="sessions"><strong>{{ a.sessionCount }}</strong> session{{ a.sessionCount === 1 ? '' : 's' }}</span>
              </div>
            </div>
          }
          <a class="card new-card" routerLink="/interviewer/assessments/new">
            <span class="plus">＋</span>
            <strong>New assessment</strong>
            <span class="muted small">Any domain: business, data, math, coding…</span>
          </a>
        </div>
      }
    </div>
  `,
  styles: `
    .hero-band { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap;
      padding: 30px 32px; border-radius: var(--r-xl); color: #fff; margin-bottom: 28px; position: relative; overflow: hidden;
      background: radial-gradient(600px 240px at 90% 0%, rgba(255,255,255,.22), transparent 60%), var(--grad); box-shadow: var(--sh-3); }
    .hero-band h1 { margin: 12px 0 6px; font-size: 32px; }
    .hero-band .sub { opacity: .9; max-width: 560px; }
    .hero-band .chip.grad { background: rgba(255,255,255,.2); }
    .btn.white { background: #fff; color: var(--accent-ink); border-color: transparent; }
    .btn.light { color: #fff; } .btn.light:hover:not(:disabled) { background: rgba(255,255,255,.15); color: #fff; }
    .sec { margin-bottom: 14px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .acard { display: flex; flex-direction: column; gap: 10px; animation: fadeUp .4s ease both; }
    .dom-ic { font-size: 18px; }
    .acard h3 { font-size: 18px; margin-top: 4px; }
    .summary { color: var(--text-2); flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .meta { display: flex; gap: 14px; font-size: 13px; color: var(--text-3); border-top: 1px solid var(--border); padding-top: 12px; margin-top: 4px; }
    .sessions { margin-left: auto; color: var(--accent-ink); }
    .new-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; border: 1.5px dashed var(--border-strong);
      background: transparent; box-shadow: none; color: var(--text-2); min-height: 200px; text-decoration: none !important; transition: all .18s; }
    .new-card:hover { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-ink); }
    .plus { font-size: 28px; width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; background: var(--surface); box-shadow: var(--sh-2); }
  `,
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  items = signal<AssessmentSummary[]>([]);
  loading = signal(true);
  error = signal('');
  resetting = signal(false);
  label = DOMAIN_LABEL;
  icon = DOMAIN_ICON;
  rel = relTime;

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      this.items.set(await this.api.listAssessments());
    } catch (e) {
      this.error.set(errorMessage(e, 'Could not load assessments.'));
    } finally {
      this.loading.set(false);
    }
  }

  open(a: AssessmentSummary) {
    this.router.navigate(['/interviewer/assessments', a.id]);
  }

  async reset() {
    if (!confirm('Reset demo data? This wipes all assessments and sessions and reseeds the demo cases.')) return;
    this.resetting.set(true);
    try {
      await this.api.resetDemo();
      this.toast.success('Demo data reset.');
      await this.load();
    } catch (e) {
      this.toast.error(errorMessage(e, 'Reset failed.'));
    } finally {
      this.resetting.set(false);
    }
  }
}
