import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InterviewSummary } from '../../../core/api.models';
import { ApiService } from '../../../core/api.service';
import { relTime } from '../../../shared/labels';
import { REC_CLASS } from '../live-stage/live-stage';

/** "Live interviews" section on the interviewer dashboard (T-021). */
@Component({
  selector: 'hw-live-interviews-list',
  imports: [RouterLink],
  template: `
    <section class="live">
      <div class="head">
        <div>
          <h2>🎙 Live interviews</h2>
          <p class="muted">AI-run interviews built from a job description, scored live.</p>
        </div>
        <a class="btn primary" routerLink="/interview/new">🎙 Start a live interview</a>
      </div>
      @if (loading()) {
        <div class="skeleton" style="height: 72px"></div>
      } @else if (!items().length) {
        <div class="empty slim">No live interviews yet. Start one from a job description.</div>
      } @else {
        <div class="list">
          @for (i of items(); track i.id; let n = $index) {
            <a class="item card hover" [routerLink]="['/live', i.id]" [style.animation-delay.ms]="n * 40">
              <span class="av">{{ i.candidateName.charAt(0) }}</span>
              <span class="txt">
                <strong>{{ i.candidateName }}</strong>
                <span class="muted small">{{ i.jobTitle }} · {{ i.company }} · {{ rel(i.createdAt) }}</span>
              </span>
              @if (i.status === 'in_progress') { <span class="chip info"><span class="dot pulse"></span> In progress</span> }
              @else { <span class="chip">Completed</span> }
              @if (i.recommendation) { <span class="chip {{ recClass[i.recommendation] }}">{{ i.recommendation }}</span> }
              <span class="score">{{ i.overall ?? '–' }}</span>
              <span class="go">→</span>
            </a>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .live { margin-bottom: 32px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 14px; }
    .head p { margin-top: 4px; }
    .list { display: flex; flex-direction: column; gap: 10px; }
    .item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; text-decoration: none !important; color: var(--text); animation: fadeUp .4s ease both; }
    .av { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; color: #fff; background: var(--grad); flex: none; }
    .txt { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .score { font-size: 22px; font-weight: 800; min-width: 44px; text-align: right; font-variant-numeric: tabular-nums; }
    .go { color: var(--text-3); font-size: 18px; }
    .dot.pulse { animation: pulse 1.2s infinite; }
    .empty.slim { padding: 20px; }
  `,
})
export class LiveInterviewsList implements OnInit {
  private api = inject(ApiService);
  items = signal<InterviewSummary[]>([]);
  loading = signal(true);
  recClass = REC_CLASS;
  rel = relTime;
  async ngOnInit() {
    try {
      this.items.set(await this.api.listInterviews());
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
