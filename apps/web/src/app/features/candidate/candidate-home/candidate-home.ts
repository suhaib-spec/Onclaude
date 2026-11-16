import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'hw-candidate-home',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page narrow">
      <div class="hero card">
        <div class="badge">🎓</div>
        <h1>Ready for your assessment?</h1>
        <p class="sub">Enter the invite code from your interviewer (or paste the whole link).</p>
        <form class="code-row" (ngSubmit)="open()">
          <input class="input code" [(ngModel)]="code" name="code" placeholder="e.g. PRICING1" autocomplete="off" autofocus />
          <button class="btn primary lg" type="submit" [disabled]="!clean()">Open invite →</button>
        </form>
        @if (err()) {
          <div class="small" style="color: var(--bad); margin-top: 8px">{{ err() }}</div>
        }
      </div>

      <h4 class="demo-h">Demo invites</h4>
      <div class="demos">
        <a class="card hover demo" routerLink="/take/PRICING1">
          <span class="ic">📈</span>
          <span class="t"><strong>Business case · Pricing decision</strong><small>Should we raise the price? Use the data to decide.</small></span>
          <span class="chip accent mono">PRICING1</span>
        </a>
        <a class="card hover demo" routerLink="/take/ABTEST01">
          <span class="ic">📊</span>
          <span class="t"><strong>Data & stats · The A/B test trap</strong><small>Is the winning variant really a winner?</small></span>
          <span class="chip accent mono">ABTEST01</span>
        </a>
      </div>
    </div>
  `,
  styles: `
    .narrow { max-width: 720px; }
    .hero { text-align: center; padding: 40px 32px; background: linear-gradient(180deg, #fff, #fbfaff); box-shadow: var(--sh-3); }
    .badge { font-size: 34px; width: 68px; height: 68px; border-radius: 20px; display: grid; place-items: center; margin: 0 auto 16px; background: var(--grad-soft); }
    .sub { color: var(--text-2); margin: 8px 0 24px; }
    .code-row { display: flex; gap: 10px; max-width: 480px; margin: 0 auto; }
    .code { font-family: var(--mono); font-size: 18px; letter-spacing: .12em; text-align: center; padding: 12px; }
    .demo-h { margin: 36px 0 12px; }
    .demos { display: grid; gap: 14px; }
    .demo { display: flex; align-items: center; gap: 16px; color: var(--text); text-decoration: none !important; }
    .demo .ic { font-size: 24px; width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; background: var(--accent-soft); }
    .demo .t { flex: 1; display: flex; flex-direction: column; }
    .demo small { color: var(--text-3); }
  `,
})
export class CandidateHome {
  private router = inject(Router);
  code = '';
  err = signal('');
  clean() {
    const raw = this.code.trim();
    const m = raw.match(/take\/([A-Za-z0-9_-]+)/);
    return (m ? m[1] : raw).replace(/[^A-Za-z0-9_-]/g, '');
  }
  open() {
    const c = this.clean();
    if (!c) return this.err.set('Please enter a code.');
    this.router.navigate(['/take', c]);
  }
}
