import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, errorMessage } from '../../../core/api.service';

const STEPS = ['Reading the job description…', 'Picking the skills that matter…', 'Building your scoring rubric…', 'Writing the interview questions…'];

/** /interview/new — paste a job description, get a live AI interview grounded in it (T-021). */
@Component({
  selector: 'hw-new-interview',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page narrow">
      <div class="crumbs"><a routerLink="/">Home</a> › New live interview</div>
      <div class="head">
        <span class="chip grad">🎙 Live AI interview</span>
        <h1>Turn a job description into a <span class="gradient-text">live interview</span></h1>
        <p class="sub">Paste the job post. The AI picks the skills that matter, builds a scoring guide from it, and runs the interview for you.</p>
      </div>

      @if (building()) {
        <div class="card build">
          <div class="orb"><span>🧠</span></div>
          <h2>Getting your interview ready</h2>
          <ul class="steps">
            @for (s of steps; track s; let i = $index) {
              <li [class.done]="i < stepIdx()" [class.now]="i === stepIdx()">
                <span class="tick">@if (i < stepIdx()) { ✓ } @else if (i === stepIdx()) { <span class="spinner"></span> } @else { · }</span>
                {{ s }}
              </li>
            }
          </ul>
        </div>
      } @else {
        <form class="card form" (ngSubmit)="generate()">
          @if (error()) { <div class="banner">⚠️ {{ error() }}</div> }
          <div class="grid-3">
            <div class="field"><label>Job title</label><input class="input" name="jobTitle" [(ngModel)]="jobTitle" required /></div>
            <div class="field"><label>Company</label><input class="input" name="company" [(ngModel)]="company" /></div>
            <div class="field"><label>Candidate name</label><input class="input" name="candidateName" [(ngModel)]="candidateName" /></div>
          </div>
          <div class="field">
            <label>Job description</label>
            <textarea class="textarea jd" name="jd" [(ngModel)]="jobDescription" placeholder="Paste the job post here…"></textarea>
            <span class="hint">@if (loadingJd()) { Loading the sample job… } @else { Prefilled with a sample job. Swap in any job post you like. }</span>
          </div>
          <div class="row">
            <span class="muted small">4 questions · about 10 minutes · scored live</span>
            <span class="spacer"></span>
            <button class="btn primary lg" type="submit" [disabled]="!jobDescription.trim() || !jobTitle.trim()">✨ Generate interview</button>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    .narrow { max-width: 920px; }
    .head { margin-bottom: 24px; }
    .head h1 { font-size: 36px; margin: 14px 0 8px; letter-spacing: -0.04em; }
    .sub { color: var(--text-2); font-size: 16px; max-width: 640px; }
    .form { display: flex; flex-direction: column; gap: 18px; box-shadow: var(--sh-3); }
    .jd { min-height: 300px; font-size: 14px; }
    .build { text-align: center; padding: 48px 24px; box-shadow: var(--sh-3); animation: pop .3s ease both; }
    .orb { width: 96px; height: 96px; margin: 0 auto 20px; border-radius: 50%; display: grid; place-items: center; font-size: 40px;
      background: var(--grad); box-shadow: 0 0 0 0 rgba(124,92,245,.5); animation: ring 1.6s infinite; }
    @keyframes ring { 0% { box-shadow: 0 0 0 0 rgba(124,92,245,.45); } 100% { box-shadow: 0 0 0 28px rgba(124,92,245,0); } }
    .steps { list-style: none; padding: 0; margin: 24px auto 0; max-width: 360px; text-align: left; display: flex; flex-direction: column; gap: 12px; }
    .steps li { display: flex; gap: 12px; align-items: center; font-size: 15px; color: var(--text-3); transition: color .3s; }
    .steps li.now { color: var(--text); font-weight: 600; }
    .steps li.done { color: var(--good); }
    .tick { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; background: var(--surface-3); font-size: 13px; flex: none; }
    .done .tick { background: var(--good-soft); }
    .now .tick { color: var(--accent); background: var(--accent-soft); }
    .now .spinner { width: 13px; height: 13px; border-width: 2px; }
  `,
})
export class NewInterview implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  jobTitle = 'Product Analyst';
  company = 'Quillstone';
  candidateName = 'Alex Rivera';
  jobDescription = '';
  loadingJd = signal(true);
  building = signal(false);
  stepIdx = signal(0);
  error = signal('');
  steps = STEPS;

  async ngOnInit() {
    try {
      const jd = await this.api.demoJd();
      this.jobTitle = jd.jobTitle;
      this.company = jd.company;
      this.jobDescription = jd.jobDescription;
    } catch {
      /* leave the form empty; user can paste one */
    } finally {
      this.loadingJd.set(false);
    }
  }

  async generate() {
    this.error.set('');
    this.building.set(true);
    this.stepIdx.set(0);
    const timer = setInterval(() => this.stepIdx.update((i) => Math.min(i + 1, STEPS.length - 1)), 650);
    const minWait = new Promise((r) => setTimeout(r, STEPS.length * 650 + 200));
    try {
      const [s] = await Promise.all([
        this.api.createInterview({
          jobTitle: this.jobTitle.trim(),
          company: this.company.trim(),
          jobDescription: this.jobDescription,
          candidateName: this.candidateName.trim() || 'Candidate',
        }),
        minWait,
      ]);
      this.stepIdx.set(STEPS.length);
      clearInterval(timer);
      setTimeout(() => this.router.navigate(['/live', s.id]), 300);
    } catch (e) {
      clearInterval(timer);
      this.building.set(false);
      this.error.set(errorMessage(e, 'Could not build the interview.'));
    }
  }
}
