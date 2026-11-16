import { Component, computed, input } from '@angular/core';

/** Animated circular score (0–100). Colour shifts red → amber → green. */
@Component({
  selector: 'hw-score-ring',
  template: `
    <div class="ring" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.viewBox]="'0 0 120 120'" [attr.width]="size()" [attr.height]="size()">
        <defs>
          <linearGradient [attr.id]="gid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" [attr.stop-color]="colorA()" />
            <stop offset="1" [attr.stop-color]="colorB()" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" class="ring-track" />
        <circle
          cx="60" cy="60" r="52" class="ring-bar"
          [attr.stroke]="'url(#' + gid + ')'"
          [attr.stroke-dasharray]="circ"
          [attr.stroke-dashoffset]="offset()"
        />
      </svg>
      <div class="ring-label">
        <span class="ring-value">{{ display() }}</span>
        @if (caption()) {
          <span class="ring-caption">{{ caption() }}</span>
        }
      </div>
    </div>
  `,
  styles: `
    .ring { position: relative; display: inline-grid; place-items: center; }
    svg { transform: rotate(-90deg); }
    .ring-track { fill: none; stroke: var(--surface-3); stroke-width: 10; }
    .ring-bar { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1); }
    .ring-label { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
    .ring-value { font-size: 2.1em; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
    .ring-caption { font-size: .72em; color: var(--text-3); text-transform: uppercase; letter-spacing: .08em; margin-top: 4px; font-weight: 600; }
  `,
})
export class ScoreRing {
  value = input<number | null>(0);
  size = input(140);
  caption = input<string>('');
  readonly circ = 2 * Math.PI * 52;
  readonly gid = 'rg' + Math.random().toString(36).slice(2, 8);
  pct = computed(() => Math.max(0, Math.min(100, this.value() ?? 0)));
  display = computed(() => (this.value() == null ? '—' : Math.round(this.pct())));
  offset = computed(() => this.circ * (1 - this.pct() / 100));
  colorA = computed(() => (this.pct() >= 70 ? '#10b981' : this.pct() >= 45 ? '#f59e0b' : '#ef4444'));
  colorB = computed(() => (this.pct() >= 70 ? '#6366f1' : this.pct() >= 45 ? '#f97316' : '#f43f5e'));
}
