import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AiPolicy, AllowedHelp, AssessmentInput, Domain, HintStep, Material } from '../../../core/api.models';
import { ApiService, errorMessage } from '../../../core/api.service';
import { ToastService } from '../../../core/ui-state';
import { AiPolicyView } from '../../../shared/ai-policy';
import { DOMAIN_LABEL, HELP_INFO, LEVEL_INFO, uid } from '../../../shared/labels';
import { MarkdownPipe } from '../../../shared/markdown';
import { MaterialView } from '../../../shared/material-view';

type Section = 'basics' | 'problem' | 'answer' | 'guardrails';

function blank(): AssessmentInput {
  return {
    title: '',
    role: '',
    domain: 'business',
    summary: '',
    timeLimitMinutes: 45,
    problemStatement: '',
    materials: [],
    referenceAnswer: '',
    rubric: [
      { id: uid('c'), name: 'Correctness', description: 'Reaches a sound, well-supported conclusion.', weight: 50 },
      { id: uid('c'), name: 'Reasoning', description: 'Shows clear, structured reasoning and uses the data.', weight: 30 },
      { id: uid('c'), name: 'Communication', description: 'Explains the recommendation concisely.', weight: 20 },
    ],
    guardrails: {
      tier: 'standard',
      allowedHelp: { clarify: true, concepts: true, methods: true, materials: true, strategy: true },
      hintLadder: [1, 2, 3, 4].map((l) => ({ level: l as HintStep['level'], text: '' })),
      hintBudget: 4,
      hintCosts: { 1: 2, 2: 4, 3: 7, 4: 10 },
      forbiddenTerms: [],
      customRules: '',
    },
    isDemo: false,
  };
}

@Component({
  selector: 'hw-builder',
  imports: [FormsModule, RouterLink, MarkdownPipe, MaterialView, AiPolicyView],
  templateUrl: './builder.html',
  styleUrl: './builder.scss',
})
export class Builder implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  /** Route param (bound via withComponentInputBinding); absent on /new. */
  id = input<string>();

  d: AssessmentInput = blank();
  loading = signal(false);
  saving = signal(false);
  drafting = signal(false);
  section = signal<Section>('basics');
  previewTab = signal<string>('brief');
  editingMaterial = signal<string | null>(null);
  newTerm = '';

  domains = Object.entries(DOMAIN_LABEL) as [Domain, string][];
  helpInfo = HELP_INFO;
  levelInfo = LEVEL_INFO;
  sections: { id: Section; label: string; icon: string }[] = [
    { id: 'basics', label: 'Basics', icon: '①' },
    { id: 'problem', label: 'Problem & materials', icon: '②' },
    { id: 'answer', label: 'Answer key & scoring', icon: '③' },
    { id: 'guardrails', label: 'AI helper rules', icon: '④' },
  ];

  async ngOnInit() {
    const id = this.id();
    if (!id) return;
    this.loading.set(true);
    try {
      const a = await this.api.getAssessment(id);
      const { id: _i, createdAt: _c, ...rest } = a;
      const base = blank();
      this.d = {
        ...base,
        ...rest,
        materials: rest.materials ?? [],
        rubric: rest.rubric ?? [],
        guardrails: { ...base.guardrails, ...rest.guardrails, allowedHelp: { ...base.guardrails.allowedHelp, ...rest.guardrails?.allowedHelp } },
      };
      this.normalizeLadder();
    } catch (e) {
      this.toast.error(errorMessage(e, 'Could not load the assessment.'));
    } finally {
      this.loading.set(false);
    }
  }

  get isEdit() {
    return !!this.id();
  }

  scrollTo(s: Section) {
    this.section.set(s);
    document.getElementById('sec-' + s)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- materials ----------
  addMaterial(kind: Material['kind']) {
    const m: Material = {
      id: uid('m'),
      name: kind === 'csv' ? 'data.csv' : kind === 'markdown' ? 'notes.md' : 'notes.txt',
      kind,
      content: kind === 'csv' ? 'column_a,column_b\n1,2\n' : '',
    };
    this.d.materials = [...this.d.materials, m];
    this.editingMaterial.set(m.id);
  }
  removeMaterial(m: Material) {
    this.d.materials = this.d.materials.filter((x) => x.id !== m.id);
    if (this.previewTab() === m.id) this.previewTab.set('brief');
  }
  async uploadMaterial(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();
    const kind: Material['kind'] = ext === 'csv' ? 'csv' : ext === 'md' ? 'markdown' : ['py', 'js', 'ts', 'sql', 'java'].includes(ext ?? '') ? 'code' : 'text';
    const m: Material = { id: uid('m'), name: file.name, kind, content: text };
    this.d.materials = [...this.d.materials, m];
    (ev.target as HTMLInputElement).value = '';
    this.toast.success(`Added ${file.name}`);
  }

  // ---------- rubric ----------
  addCriterion() {
    this.d.rubric = [...this.d.rubric, { id: uid('c'), name: '', description: '', weight: 0 }];
  }
  removeCriterion(id: string) {
    this.d.rubric = this.d.rubric.filter((c) => c.id !== id);
  }
  weightSum() {
    return this.d.rubric.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  }
  balanceWeights() {
    const n = this.d.rubric.length;
    if (!n) return;
    const base = Math.floor(100 / n);
    this.d.rubric.forEach((c, i) => (c.weight = base + (i < 100 - base * n ? 1 : 0)));
  }

  // ---------- guardrails ----------
  maxLevel() {
    return this.d.guardrails.tier === 'strict' ? 3 : 4;
  }
  normalizeLadder() {
    const byLevel = new Map(this.d.guardrails.hintLadder.map((h) => [h.level, h.text]));
    this.d.guardrails.hintLadder = [1, 2, 3, 4].map((l) => ({ level: l as HintStep['level'], text: byLevel.get(l as HintStep['level']) ?? '' }));
  }
  setTier(t: 'strict' | 'standard') {
    this.d.guardrails.tier = t;
  }
  toggleHelp(k: keyof AllowedHelp) {
    this.d.guardrails.allowedHelp[k] = !this.d.guardrails.allowedHelp[k];
  }
  addTerm() {
    const parts = this.newTerm
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const set = new Set(this.d.guardrails.forbiddenTerms.map((t) => t.toLowerCase()));
    for (const p of parts) if (!set.has(p.toLowerCase())) this.d.guardrails.forbiddenTerms.push(p);
    this.newTerm = '';
  }
  onTermKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' || ev.key === ',') {
      ev.preventDefault();
      this.addTerm();
    } else if (ev.key === 'Backspace' && !this.newTerm && this.d.guardrails.forbiddenTerms.length) {
      this.d.guardrails.forbiddenTerms.pop();
    }
  }
  removeTerm(t: string) {
    this.d.guardrails.forbiddenTerms = this.d.guardrails.forbiddenTerms.filter((x) => x !== t);
  }
  costOf(l: number) {
    return (this.d.guardrails.hintCosts as unknown as Record<number, number>)[l];
  }
  setCost(l: number, v: number) {
    (this.d.guardrails.hintCosts as unknown as Record<number, number>)[l] = Number(v) || 0;
  }
  maxPenalty() {
    const costs = [1, 2, 3, 4].slice(0, this.maxLevel()).map((l) => this.costOf(l) || 0);
    return costs.slice(0, Math.min(this.d.guardrails.hintBudget, costs.length)).reduce((a, b) => a + b, 0);
  }

  async draftHints() {
    if (!this.d.problemStatement.trim()) {
      this.toast.error('Write the problem first so the AI has something to work from.');
      return;
    }
    this.drafting.set(true);
    try {
      const { hintLadder } = await this.api.draftHints({
        problemStatement: this.d.problemStatement,
        referenceAnswer: this.d.referenceAnswer,
        materials: this.d.materials,
      });
      this.d.guardrails.hintLadder = hintLadder;
      this.normalizeLadder();
      this.toast.success('✨ Hints drafted. Review and tweak them before saving.');
    } catch (e) {
      this.toast.error(errorMessage(e, 'Could not draft hints.'));
    } finally {
      this.drafting.set(false);
    }
  }

  // ---------- preview ----------
  private policyKey = '';
  private policyCache!: AiPolicy;
  /** Stable object identity unless something changed (avoids dev-mode ExpressionChanged errors). */
  policy(): AiPolicy {
    const g = this.d.guardrails;
    const p: AiPolicy = {
      tier: g.tier,
      maxHintLevel: this.maxLevel(),
      allowedHelp: { ...g.allowedHelp },
      hintBudget: Number(g.hintBudget) || 0,
      hintCosts: { ...g.hintCosts },
    };
    const key = JSON.stringify(p);
    if (key !== this.policyKey) {
      this.policyKey = key;
      this.policyCache = p;
    }
    return this.policyCache;
  }
  previewMaterial() {
    return this.d.materials.find((m) => m.id === this.previewTab());
  }

  // ---------- save ----------
  problems(): string[] {
    const p: string[] = [];
    if (!this.d.title.trim()) p.push('Title is required.');
    if (!this.d.role.trim()) p.push('Role is required.');
    if (!this.d.problemStatement.trim()) p.push('Problem statement is required.');
    if (!this.d.referenceAnswer.trim()) p.push('The answer key is required.');
    if (!this.d.rubric.length) p.push('Add at least one scoring criterion.');
    if (this.weightSum() !== 100) p.push(`Scoring weights must add up to 100 (currently ${this.weightSum()}).`);
    return p;
  }

  async save() {
    const p = this.problems();
    if (p.length) {
      this.toast.error(p[0]);
      return;
    }
    this.saving.set(true);
    const body: AssessmentInput = {
      ...this.d,
      timeLimitMinutes: Number(this.d.timeLimitMinutes) || 30,
      rubric: this.d.rubric.map((c) => ({ ...c, weight: Number(c.weight) || 0 })),
      guardrails: {
        ...this.d.guardrails,
        hintBudget: Number(this.d.guardrails.hintBudget) || 0,
        hintLadder: this.d.guardrails.hintLadder.filter((h) => h.text.trim() && h.level <= this.maxLevel()),
      },
    };
    try {
      const saved = this.isEdit ? await this.api.updateAssessment(this.id()!, body) : await this.api.createAssessment(body);
      this.toast.success(this.isEdit ? 'Assessment updated.' : 'Assessment created. Now invite a candidate!');
      this.router.navigate(['/interviewer/assessments', saved.id]);
    } catch (e) {
      this.toast.error(errorMessage(e, 'Save failed.'));
    } finally {
      this.saving.set(false);
    }
  }
}
