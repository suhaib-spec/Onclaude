import { Component, input } from '@angular/core';
import { Material } from '../core/api.models';
import { MarkdownPipe, parseCsv } from './markdown';

/** Renders one material: markdown → HTML, csv → styled table, text/code → monospace block. */
@Component({
  selector: 'hw-material-view',
  imports: [MarkdownPipe],
  template: `
    @switch (material().kind) {
      @case ('markdown') {
        <div class="md" [innerHTML]="material().content | md: 'doc'"></div>
      }
      @case ('csv') {
        <div class="csv-wrap">
          <table class="csv">
            @if (rows().length) {
              <thead>
                <tr>
                  <th class="rownum">#</th>
                  @for (h of rows()[0]; track $index) {
                    <th>{{ h }}</th>
                  }
                </tr>
              </thead>
            }
            <tbody>
              @for (r of rows().slice(1); track $index; let i = $index) {
                <tr>
                  <td class="rownum">{{ i + 1 }}</td>
                  @for (c of r; track $index) {
                    <td [class.num]="isNum(c)">{{ c }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="csv-meta">{{ rows().length ? rows().length - 1 : 0 }} rows · {{ rows()[0]?.length ?? 0 }} columns</div>
      }
      @default {
        <pre class="mono-block">{{ material().content }}</pre>
      }
    }
  `,
})
export class MaterialView {
  material = input.required<Material>();
  private lastCsv: string | null = null;
  private lastRows: string[][] = [];
  /** Memoised on the content string (the builder edits materials in place, so a computed() would go stale). */
  rows(): string[][] {
    const m = this.material();
    if (m.kind !== 'csv') return [];
    if (m.content !== this.lastCsv) {
      this.lastCsv = m.content;
      this.lastRows = parseCsv(m.content);
    }
    return this.lastRows;
  }
  isNum(v: string) {
    return /^\s*[-+]?[$€£]?[\d,]*\.?\d+%?\s*$/.test(v);
  }
}
