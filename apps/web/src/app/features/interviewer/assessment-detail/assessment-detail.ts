import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Assessment, SessionRow } from '../../../core/api.models';
import { ApiService, errorMessage } from '../../../core/api.service';
import { ToastService } from '../../../core/ui-state';
import { DOMAIN_ICON, DOMAIN_LABEL, HELP_INFO, STATUS_LABEL, TIER_LABEL, relTime } from '../../../shared/labels';
import { MarkdownPipe } from '../../../shared/markdown';

@Component({
  selector: 'hw-assessment-detail',
  imports: [FormsModule, RouterLink, MarkdownPipe],
  template: `
    <div class="page">
      <div class="crumbs"><a routerLink="/interviewer">Assessments</a> <span>›</span> <span>{{ a()?.title ?? '…' }}</span></div>

      @if (loading()) {
        <div class="skeleton" style="height: 160px; margin-bottom: 20px"></div>
        <div class="skeleton" style="height: 300px"></div>
      } @else if (error()) {
        <div class="banner">⚠️ {{ error() }} <span class="spacer"></span><button class="btn sm" (click)="load()">Retry</button></div>
      } @else if (a(); as a) {
        <div class="overview card">
          <div class="ov-main">
            <div class="row wrap">
              <span class="chip accent">{{ icon[a.domain] }} {{ label[a.domain] }}</span>
              <span class="chip">👤 {{ a.role }}</span>
              <span class="chip">⏱ {{ a.timeLimitMinutes }} min</span>
              @if (a.isDemo) { <span class="chip warn">★ Demo</span> }
            </div>
            <h1>{{ a.title }}</h1>
            <p class="sub">{{ a.summary }}</p>
            <div class="row wrap" style="margin-top: 14px">
              <a class="btn" [routerLink]="['/interviewer/assessments', a.id, 'edit']">✎ Edit</a>
              <button class="btn ghost danger" (click)="remove()">Delete</button>
            </div>
          </div>
          <div class="guard-sum">
            <h4>🛡 AI helper rules</h4>
            <div class="gs-row"><span>Mode</span><strong>{{ tierLabel[a.guardrails.tier] }}</strong></div>
            <div class="gs-row"><span>Hints allowed</span><strong>{{ a.guardrails.hintBudget }}</strong></div>
            <div class="gs-row"><span>Blocked phrases</span><strong>{{ a.guardrails.forbiddenTerms.length }}</strong></div>
            <div class="gs-row"><span>Scoring criteria</span><strong>{{ a.rubric.length }}</strong></div>
            <div class="helps">
              @for (h of helpInfo; track h.key) {
                <span class="chip" [class.good]="a.guardrails.allowedHelp[h.key]" [class.outline]="!a.guardrails.allowedHelp[h.key]">
                  {{ a.guardrails.allowedHelp[h.key] ? '✓' : '✕' }} {{ h.label }}
                </span>
              }
            </div>
          </div>
        </div>

        <div class="cols">
          <div class="card invite">
            <h2>Invite a candidate</h2>
            <p class="muted small">Creates a unique link. No account needed.</p>
            <form class="row" style="margin-top: 14px" (ngSubmit)="invite()">
              <input class="input" [(ngModel)]="candidateName" name="cn" placeholder="Candidate name (optional)" />
              <button class="btn primary" type="submit" [disabled]="inviting()">
                @if (inviting()) { <span class="spinner"></span> } Create link
              </button>
            </form>
            @if (lastLink(); as l) {
              <div class="link-box">
                <span class="mono">{{ l }}</span>
                <button class="btn sm soft" (click)="copy(l)">{{ copied() ? '✓ Copied' : '⧉ Copy' }}</button>
                <a class="btn sm ghost" [href]="l" target="_blank">Open ↗</a>
              </div>
            }
          </div>

          <div class="card brief">
            <h2>Brief</h2>
            <div class="md brief-md" [innerHTML]="a.problemStatement | md: 'doc'"></div>
          </div>
        </div>

        <div class="card sessions">
          <div class="card-head">
            <h2>Sessions <span class="chip">{{ sessions().length }}</span></h2>
            <button class="btn sm ghost" (click)="loadSessions()">↻ Refresh</button>
          </div>
          @if (!sessions().length) {
            <div class="empty"><div class="big">📭</div><h3>No sessions yet</h3><p>Create an invite link above and share it with a candidate.</p></div>
          } @else {
            <p class="same-case">Same case. Same AI. Same {{ a.timeLimitMinutes }} minutes.</p>
            <div style="overflow-x: auto">
              <table class="table">
                <thead>
                  <tr><th>Candidate</th><th>Status</th><th>Invite</th><th>Hints</th><th>Score</th><th>How they used AI</th><th>Created</th><th></th></tr>
                </thead>
                <tbody>
                  @for (s of sessions(); track s.id) {
                    <tr class="click" (click)="openSession(s)">
                      <td><strong>{{ s.candidateName || 'Unnamed candidate' }}</strong></td>
                      <td><span class="chip" [class]="'chip ' + statusTone(s.status)">{{ statusLabel[s.status] }}</span></td>
                      <td>
                        <span class="mono small">{{ s.inviteToken }}</span>
                        <button class="btn sm ghost" (click)="$event.stopPropagation(); copy(linkFor(s.inviteToken))" title="Copy link">⧉</button>
                      </td>
                      <td>{{ s.hintsUsed }}</td>
                      <td>
                        @if (s.finalScore != null) {
                          <span class="score" [class]="'score ' + tone(s.finalScore)">{{ s.finalScore }}</span>
                        } @else { <span class="muted">—</span> }
                      </td>
                      <td>
                        @if (s.aiUsageScore != null) {
                          <div class="mini"><div class="bar" [class]="'bar ' + tone(s.aiUsageScore)"><span [style.width.%]="s.aiUsageScore"></span></div><span>{{ s.aiUsageScore }}</span></div>
                        } @else { <span class="muted">—</span> }
                      </td>
                      <td class="muted">{{ rel(s.createdAt) }}</td>
                      <td>
                        @if (s.status !== 'invited') {
                          <span class="btn sm soft">{{ s.status === 'in_progress' ? 'Watch →' : 'Review →' }}</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .same-case { margin: -4px 0 12px; font-size: 15px; font-weight: 700; color: var(--accent, #4f46e5); letter-spacing: -0.01em; }
    .overview { display: grid; grid-template-columns: 1fr 340px; gap: 24px; padding: 28px; margin-bottom: 20px;
      background: radial-gradient(700px 200px at 0% 0%, #f1efff, transparent 70%), var(--surface); }
    .overview h1 { margin: 14px 0 8px; }
    .overview .sub { color: var(--text-2); }
    .guard-sum { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 16px; display: flex; flex-direction: column; gap: 8px; }
    .gs-row { display: flex; justify-content: space-between; font-size: 13px; span { color: var(--text-3); } }
    .helps { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .invite { background: linear-gradient(160deg, #fff 60%, #f6f3ff); }
    .link-box { margin-top: 14px; display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 12px; background: var(--accent-soft); border: 1px dashed #c7c9ff; animation: pop .25s ease both;
      .mono { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--accent-ink); font-weight: 500; } }
    .brief-md { max-height: 220px; overflow: auto; margin-top: 10px; font-size: 13.5px; mask-image: linear-gradient(180deg, #000 80%, transparent); }
    .sessions h2 { display: flex; gap: 8px; align-items: center; }
    .score { font-weight: 800; font-size: 15px; padding: 2px 10px; border-radius: 8px;
      &.good { color: var(--good); background: var(--good-soft); } &.warn { color: var(--warn); background: var(--warn-soft); } &.bad { color: var(--bad); background: var(--bad-soft); } }
    .mini { display: flex; align-items: center; gap: 8px; .bar { width: 70px; } span { font-weight: 600; font-size: 12.5px; } }
    @media (max-width: 960px) { .overview, .cols { grid-template-columns: 1fr; } }
  `,
})
export class AssessmentDetail implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  id = input.required<string>();

  a = signal<Assessment | null>(null);
  sessions = signal<SessionRow[]>([]);
  loading = signal(true);
  error = signal('');
  inviting = signal(false);
  lastLink = signal('');
  copied = signal(false);
  candidateName = '';

  label = DOMAIN_LABEL;
  icon = DOMAIN_ICON;
  helpInfo = HELP_INFO;
  tierLabel = TIER_LABEL;
  statusLabel = STATUS_LABEL;
  rel = relTime;

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      const [a, s] = await Promise.all([this.api.getAssessment(this.id()), this.api.listSessions(this.id())]);
      this.a.set(a);
      this.sessions.set(s);
    } catch (e) {
      this.error.set(errorMessage(e, 'Could not load this assessment.'));
    } finally {
      this.loading.set(false);
    }
  }

  async loadSessions() {
    try {
      this.sessions.set(await this.api.listSessions(this.id()));
    } catch (e) {
      this.toast.error(errorMessage(e, 'Could not load sessions.'));
    }
  }

  linkFor(token: string) {
    return `${location.origin}/take/${token}`;
  }

  async invite() {
    this.inviting.set(true);
    try {
      const r = await this.api.createInvite(this.id(), this.candidateName.trim() || undefined);
      const link = r.url?.startsWith('http') ? r.url : `${location.origin}${r.url || '/take/' + r.inviteToken}`;
      this.lastLink.set(link);
      this.candidateName = '';
      this.copy(link, false);
      this.toast.success('Invite link created and copied.');
      this.loadSessions();
    } catch (e) {
      this.toast.error(errorMessage(e, 'Could not create invite.'));
    } finally {
      this.inviting.set(false);
    }
  }

  async copy(text: string, notify = true) {
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
      if (notify) this.toast.success('Link copied to clipboard.');
    } catch {
      if (notify) this.toast.show(text, 'info', 8000);
    }
  }

  openSession(s: SessionRow) {
    if (s.status === 'invited') {
      this.toast.show('The candidate has not started yet. Share the invite link!', 'info');
      return;
    }
    this.router.navigate(['/interviewer/sessions', s.id]);
  }

  async remove() {
    if (!confirm('Delete this assessment and all its sessions?')) return;
    try {
      await this.api.deleteAssessment(this.id());
      this.toast.success('Assessment deleted.');
      this.router.navigateByUrl('/interviewer');
    } catch (e) {
      this.toast.error(errorMessage(e, 'Delete failed.'));
    }
  }

  tone(v: number) {
    return v >= 70 ? 'good' : v >= 45 ? 'warn' : 'bad';
  }
  statusTone(s: string) {
    return s === 'evaluated' ? 'good' : s === 'submitted' ? 'info' : s === 'in_progress' ? 'warn' : '';
  }
}
