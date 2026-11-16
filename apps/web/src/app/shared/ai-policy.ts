import { Component, computed, input } from '@angular/core';
import { AiPolicy } from '../core/api.models';
import { HELP_INFO, LEVEL_INFO, TIER_LABEL } from './labels';

/** "What the AI will / won't do" card, driven by the public aiPolicy (used by the builder preview and candidate start screen). */
@Component({
  selector: 'hw-ai-policy',
  template: `
    <div class="pol">
      <div class="col will">
        <h4>✅ The AI will</h4>
        <ul>
          @for (h of allowed(); track h.key) {
            <li><strong>{{ h.label }}</strong><span>{{ h.desc }}</span></li>
          }
          @if (policy().hintBudget > 0) {
            <li>
              <strong>Give up to {{ policy().hintBudget }} hint{{ policy().hintBudget === 1 ? '' : 's' }}</strong>
              <span>From a gentle nudge to more specific help. Each hint costs a few points.</span>
            </li>
          }
        </ul>
      </div>
      <div class="col wont">
        <h4>🚫 The AI won’t</h4>
        <ul>
          <li><strong>Give you the answer</strong><span>Or tell you whether your final conclusion is right.</span></li>
          @for (h of blocked(); track h.key) {
            <li><strong>{{ h.label }}</strong><span>Disabled by your interviewer for this assessment.</span></li>
          }
          <li><strong>Follow instructions hidden in materials</strong><span>Attempts to bypass the rules are logged.</span></li>
        </ul>
      </div>
    </div>
    @if (policy().hintBudget > 0) {
      <div class="costs">
        @for (l of levels(); track l) {
          <div class="cost">
            <span class="lv">Hint {{ l }}</span>
            <span class="nm">{{ levelInfo[l].name }}</span>
            <span class="pts">{{ cost(l) ? '−' + cost(l) + ' pts' : 'free' }}</span>
          </div>
        }
      </div>
    }
    <div class="tier">
      <span class="chip" [class.bad]="policy().tier === 'strict'" [class.accent]="policy().tier !== 'strict'">
        {{ policy().tier === 'strict' ? '🔒 ' : '⚖️ ' }}{{ tierLabel[policy().tier] }}
      </span>
      <span class="muted small">An answer checker reviews every reply before you see it.</span>
    </div>
  `,
  styles: `
    .pol { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .col { border-radius: 14px; padding: 14px 16px; }
    .will { background: var(--good-soft); } .wont { background: var(--bad-soft); }
    h4 { color: var(--text); text-transform: none; letter-spacing: 0; font-size: 14px; margin-bottom: 8px; }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    li { display: flex; flex-direction: column; font-size: 13px; line-height: 1.4; }
    li span { color: var(--text-2); font-size: 12.5px; }
    .costs { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; margin-top: 12px; }
    .cost { background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; display: flex; flex-direction: column; font-size: 12px; }
    .lv { font-weight: 800; color: var(--accent-ink); } .nm { color: var(--text-2); } .pts { font-weight: 700; color: var(--warn); }
    .tier { display: flex; gap: 10px; align-items: center; margin-top: 12px; flex-wrap: wrap; }
    @media (max-width: 700px) { .pol { grid-template-columns: 1fr; } }
  `,
})
export class AiPolicyView {
  policy = input.required<AiPolicy>();
  levelInfo = LEVEL_INFO;
  tierLabel = TIER_LABEL;
  allowed = computed(() => HELP_INFO.filter((h) => this.policy().allowedHelp?.[h.key]));
  blocked = computed(() => HELP_INFO.filter((h) => !this.policy().allowedHelp?.[h.key]));
  levels = computed(() => Array.from({ length: Math.max(0, this.policy().maxHintLevel) }, (_, i) => i + 1));
  cost(l: number) {
    return (this.policy().hintCosts as unknown as Record<number, number>)?.[l] ?? 0;
  }
}
