import { Component, OnDestroy, effect, input, output, signal } from '@angular/core';

/** Reveals text letter by letter, like someone typing. Emits `typing` true/false so the avatar can "speak". */
@Component({
  selector: 'hw-typewriter',
  template: `<span>{{ shown() }}</span>@if (busy()) {<span class="caret"></span>}`,
  styles: `
    :host { display: inline; }
    .caret { display: inline-block; width: 3px; height: 1em; margin-left: 3px; vertical-align: -0.12em; border-radius: 2px;
      background: var(--accent); animation: blink .8s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  `,
})
export class Typewriter implements OnDestroy {
  text = input('');
  speed = input(18); // ms per character
  typing = output<boolean>();
  shown = signal('');
  busy = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => this.start(this.text()));
  }

  private start(full: string) {
    this.stop();
    this.shown.set('');
    if (!full) return;
    this.busy.set(true);
    this.typing.emit(true);
    let i = 0;
    this.timer = setInterval(() => {
      i = Math.min(full.length, i + 2);
      this.shown.set(full.slice(0, i));
      if (i >= full.length) {
        this.stop();
        this.busy.set(false);
        this.typing.emit(false);
      }
    }, this.speed());
  }
  private stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
  ngOnDestroy() {
    this.stop();
  }
}
