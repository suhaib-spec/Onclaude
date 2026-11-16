import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AppState, Role } from '../../core/ui-state';

@Component({
  selector: 'hw-landing',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="glow g1"></div>
      <div class="glow g2"></div>
      <div class="hero-inner">
        <span class="chip grad eyebrow">✨ Help, not answers.</span>
        <h1>Interview the way they’ll actually work: <span class="gradient-text">with AI, on your rules.</span></h1>
        <p class="lead">
          Hintwise is a smart helper that gives candidates hints, <span class="strike">never the answer</span>, and shows you how well they used it.
        </p>
        <div class="ctas">
          <button class="cta" (click)="go('interviewer')">
            <span class="cta-ic">🧑‍💼</span>
            <span class="cta-txt"><strong>I’m an interviewer</strong><small>Create a case, set the rules, review results</small></span>
            <span class="arrow">→</span>
          </button>
          <button class="cta alt" (click)="go('candidate')">
            <span class="cta-ic">🎓</span>
            <span class="cta-txt"><strong>I’m a candidate</strong><small>Open an invite and start solving</small></span>
            <span class="arrow">→</span>
          </button>
        </div>
        <a class="proof" [routerLink]="proofLink()" (click)="state.setRole('interviewer')">
          <span class="proof-txt">Same case, same AI:</span>
          <span class="who"><strong>Priya</strong> <span class="sc good">72</span></span>
          <span class="vs">vs</span>
          <span class="who"><strong>Jordan</strong> <span class="sc bad">18</span></span>
          <span class="see">See both →</span>
        </a>
        <p class="for">Built for hiring teams. Candidates practise for free.</p>
      </div>
    </section>

    <section class="how">
      <div class="step card">
        <div class="ic">🛠️</div>
        <h3>1 · Set the rules</h3>
        <p>Write the case, attach the files, lock away the answer key, and decide how much help the AI may give.</p>
      </div>
      <div class="step card">
        <div class="ic">🛡️</div>
        <h3>2 · Candidates work with AI</h3>
        <p>The helper explains and nudges. Every reply is checked so it never gives away the answer.</p>
      </div>
      <div class="step card">
        <div class="ic">🔍</div>
        <h3>3 · See how they think</h3>
        <p>A clear score, what they did well, where they struggled, and the full AI conversation, explained.</p>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .hero { position: relative; overflow: hidden; padding: 84px 24px 72px; text-align: center;
      background: radial-gradient(1200px 500px at 50% -10%, #e9e8ff 0%, transparent 60%), linear-gradient(180deg, #fbfbff 0%, var(--bg) 100%); }
    .glow { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .55; pointer-events: none; }
    .g1 { width: 420px; height: 420px; background: #a5b4fc; top: -120px; left: 8%; animation: float 9s ease-in-out infinite; }
    .g2 { width: 380px; height: 380px; background: #f0abfc; top: 40px; right: 6%; animation: float 11s ease-in-out infinite reverse; }
    @keyframes float { 50% { transform: translate(30px, 24px); } }
    .hero-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; animation: heroIn .3s ease-out both; }
    @keyframes heroIn { from { opacity: .6; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .eyebrow { padding: 6px 14px; font-size: 12.5px; }
    h1 { font-size: clamp(34px, 5vw, 56px); line-height: 1.08; letter-spacing: -0.045em; margin: 22px 0 18px; font-weight: 800; }
    .strike { position: relative; font-weight: 700; color: var(--text); white-space: nowrap; }
    .strike::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 8px; border-radius: 4px; background: #fde68a; z-index: -1; transform: rotate(-1deg); }
    .lead { font-size: 18px; color: var(--text-2); max-width: 680px; margin: 0 auto; line-height: 1.6; }
    .ctas { display: flex; gap: 18px; justify-content: center; margin-top: 40px; flex-wrap: wrap; }
    .cta { display: flex; align-items: center; gap: 16px; text-align: left; min-width: 320px; padding: 20px 22px; border-radius: 20px; cursor: pointer;
      font: inherit; border: 0; color: #fff; background: var(--grad); box-shadow: 0 18px 40px -14px rgba(99,102,241,.7); transition: transform .18s, box-shadow .18s; }
    .cta:hover { transform: translateY(-3px); box-shadow: 0 24px 50px -14px rgba(99,102,241,.8); }
    .cta.alt { background: var(--surface); color: var(--text); border: 1px solid var(--border); box-shadow: var(--sh-3); }
    .cta-ic { font-size: 30px; width: 54px; height: 54px; display: grid; place-items: center; border-radius: 14px; background: rgba(255,255,255,.18); }
    .cta.alt .cta-ic { background: var(--accent-soft); }
    .cta-txt { display: flex; flex-direction: column; flex: 1; }
    .cta-txt strong { font-size: 18px; }
    .cta-txt small { opacity: .85; font-size: 13px; margin-top: 2px; }
    .arrow { font-size: 22px; transition: transform .18s; }
    .cta:hover .arrow { transform: translateX(4px); }
    .proof { display: inline-flex; align-items: center; gap: 10px; margin-top: 30px; padding: 10px 12px 10px 18px; border-radius: 99px;
      background: var(--surface); border: 1px solid var(--border); box-shadow: var(--sh-2, 0 6px 18px -10px rgba(30,27,75,.25));
      color: var(--text); text-decoration: none; font-size: 15px; transition: transform .18s, box-shadow .18s; }
    .proof:hover { transform: translateY(-2px); box-shadow: var(--sh-3); }
    .proof-txt { color: var(--text-2); }
    .who { display: inline-flex; align-items: center; gap: 6px; }
    .sc { font-weight: 800; padding: 2px 9px; border-radius: 99px; font-size: 14px; }
    .sc.good { background: var(--good-soft); color: var(--good); }
    .sc.bad { background: var(--bad-soft); color: var(--bad); }
    .vs { color: var(--text-3); font-size: 13px; }
    .see { margin-left: 6px; padding: 6px 14px; border-radius: 99px; background: var(--grad); color: #fff; font-weight: 700; font-size: 14px; }
    .for { margin: 16px auto 0; color: var(--text-3); font-size: 14px; }
    .how { max-width: 1100px; margin: -10px auto 70px; padding: 0 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .step { animation: heroIn .3s ease-out both; }
    .step:nth-child(2) { animation-delay: .08s; } .step:nth-child(3) { animation-delay: .16s; }
    .step .ic { font-size: 26px; width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; background: var(--grad-soft); margin-bottom: 14px; }
    .step h3 { margin-bottom: 6px; }
    .step p { color: var(--text-2); }
    @media (max-width: 860px) { .how { grid-template-columns: 1fr; } }
  `,
})
export class Landing implements OnInit {
  protected state = inject(AppState);
  private router = inject(Router);
  private api = inject(ApiService);
  /** Proof card target: the business (pricing) demo case, where Priya and Jordan's sessions live. */
  proofLink = signal<string>('/interviewer');

  async ngOnInit() {
    try {
      const list = await this.api.listAssessments();
      const biz = list.find((a) => a.domain === 'business');
      if (biz) this.proofLink.set(`/interviewer/assessments/${biz.id}`);
    } catch {
      /* keep the dashboard fallback */
    }
  }
  go(r: Role) {
    this.state.setRole(r);
    this.router.navigateByUrl(r === 'interviewer' ? '/interviewer' : '/candidate');
  }
}
