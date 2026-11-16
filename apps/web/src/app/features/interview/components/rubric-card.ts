import { Component, OnInit, computed, input, signal } from '@angular/core';
import { Competency, CompetencyScore, LiveScore, Signal } from '../../../core/api.models';

export const SIGNAL_LABEL: Record<Signal, string> = { strong: 'Strong', ok: 'OK', weak: 'Weak' };
export const SIGNAL_CLASS: Record<Signal, string> = { strong: 'good', ok: 'warn', weak: 'bad' };

/** One skill from the job description: the JD line it comes from, a live 0–5 score bar, and the latest evidence. */
@Component({
  selector: 'hw-rubric-card',
  template: `
    <div class="rc" [class.active]="active()" [class.flash]="flash()">
      <div class="top">
        <strong class="name">{{ comp().name }}</strong>
        <span class="weight">{{ comp().weight }}%</span>
        <span class="spacer"></span>
        @if (latest(); as l) {
          <span class="chip {{ cls[l.signal] }}">{{ label[l.signal] }}</span>
        } @else if (active()) {
          <span class="chip accent"><span class="dot live"></span> Now</span>
        } @else {
          <span class="chip">Not yet</span>
        }
        <span class="num">{{ scoreText() }}<small>/5</small></span>
      </div>
      <div class="bar {{ barCls() }}"><span [style.width.%]="ready() ? pct() : 0"></span></div>
      <p class="jd" title="From the job description">📄 “{{ comp().jdQuote }}”</p>
      @if (latest(); as l) {
        <blockquote class="ev">
          “{{ l.evidence }}”
          <span class="why">{{ l.reason }}</span>
        </blockquote>
      }
    </div>
  `,
  styles: `
    .rc { padding: 14px 16px; border-radius: 14px; background: var(--surface); border: 1px solid var(--border);
      transition: border-color .3s, box-shadow .3s, transform .3s; animation: fadeUp .4s ease both; }
    .rc.active { border-color: #c7c8fb; box-shadow: 0 0 0 3px rgba(91,91,240,.10), var(--sh-2); }
    .rc.flash { animation: flash 1.2s ease; }
    @keyframes flash { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.0); } 25% { box-shadow: 0 0 0 6px rgba(124,92,245,.25); } 100% { box-shadow: 0 0 0 0 rgba(124,92,245,0); } }
    .top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .name { font-size: 14.5px; }
    .weight { font-size: 11.5px; color: var(--text-3); font-weight: 600; background: var(--surface-3); padding: 1px 7px; border-radius: 99px; }
    .spacer { flex: 1; }
    .num { font-weight: 800; font-size: 18px; min-width: 52px; text-align: right; font-variant-numeric: tabular-nums; }
    .num small { font-size: 11px; color: var(--text-3); font-weight: 600; }
    .bar { height: 9px; }
    .bar > span { transition: width 1.1s cubic-bezier(.2,.8,.2,1); }
    .jd { margin-top: 10px; font-size: 12.5px; color: var(--text-3); font-style: italic; line-height: 1.45; }
    .ev { margin: 10px 0 0; padding: 8px 12px; border-left: 3px solid var(--accent-2); background: var(--grad-soft); border-radius: 0 10px 10px 0;
      font-size: 13px; color: var(--text); line-height: 1.5; animation: fadeUp .4s ease both; }
    .why { display: block; margin-top: 4px; font-size: 12px; color: var(--text-2); }
    .dot.live { width: 7px; height: 7px; animation: pulse 1.2s infinite; }
  `,
})
export class RubricCard implements OnInit {
  comp = input.required<Competency>();
  score = input<CompetencyScore | undefined>(undefined);
  latest = input<LiveScore | undefined>(undefined);
  active = input(false);
  ready = signal(false);
  flash = signal(false);
  cls = SIGNAL_CLASS;
  label = SIGNAL_LABEL;
  private lastScore = -1;

  value = computed(() => this.score()?.score ?? 0);
  pct = computed(() => Math.max(0, Math.min(100, (this.value() / 5) * 100)));
  scoreText = computed(() => (this.value() > 0 ? this.value().toFixed(1) : '–'));
  barCls = computed(() => (this.value() >= 4 ? 'good' : this.value() >= 3 ? '' : this.value() > 0 ? 'warn' : ''));

  ngOnInit() {
    setTimeout(() => this.ready.set(true), 60);
  }
  ngDoCheck() {
    const v = this.value();
    if (this.lastScore >= 0 && v !== this.lastScore) {
      this.flash.set(false);
      setTimeout(() => this.flash.set(true));
      setTimeout(() => this.flash.set(false), 1300);
    }
    this.lastScore = v;
  }
}
