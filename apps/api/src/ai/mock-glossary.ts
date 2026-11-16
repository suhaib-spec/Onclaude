/**
 * Small, domain-agnostic glossary used by the MOCK tutor so concept/method questions get a real answer
 * without an LLM. General definitions only — never problem-specific results.
 */
export const GLOSSARY: { keys: RegExp; text: string }[] = [
  { keys: /elasticit/i, text: 'Price elasticity of demand is the % change in quantity divided by the % change in price. If it is below -1 (elastic), a price rise loses more volume than it gains in price, so revenue falls; between 0 and -1 (inelastic), revenue rises.' },
  { keys: /contribution margin|unit margin/i, text: 'Contribution margin is price minus variable cost per unit, i.e. what each sale contributes toward fixed costs and profit. Total contribution = unit margin x units sold.' },
  { keys: /break[- ]?even/i, text: 'Break-even is the point where total contribution covers fixed costs: break-even units = fixed costs / unit contribution margin.' },
  { keys: /cannibali[sz]/i, text: 'Cannibalisation is when a new product or price point takes sales from your own existing offers instead of winning new customers, so the net gain is smaller than the gross sales.' },
  { keys: /\bchurn|retention/i, text: 'Churn is the share of customers who leave in a period (retention is 1 minus churn). Small changes compound: it matters a lot for lifetime value.' },
  { keys: /\bltv\b|lifetime value|\bclv\b/i, text: 'Customer lifetime value is roughly average margin per period x expected number of periods a customer stays (often margin / churn rate).' },
  { keys: /revenue|profit/i, text: 'Revenue = price x units; profit = revenue - variable costs - fixed costs. A choice that maximises revenue does not necessarily maximise profit, so check which one the question asks for.' },
  { keys: /p[- ]?value/i, text: 'A p-value is the probability of seeing a result at least this extreme if there were truly no effect. A small p-value (e.g. < 0.05) means the data would be surprising under "no effect"; it is not the probability that the effect is real.' },
  { keys: /significan/i, text: 'Statistical significance means the observed difference is unlikely to be pure noise at a chosen threshold (alpha, often 5%). It says nothing about whether the effect is large enough to matter: that is practical significance.' },
  { keys: /confidence interval|\bci\b/i, text: 'A 95% confidence interval is a range built so that, over many repeats, 95% of such ranges contain the true value. If the interval for a difference includes 0, the data are consistent with no effect.' },
  { keys: /simpson/i, text: "Simpson's paradox is when a trend that appears in every subgroup reverses (or disappears) once the groups are combined, usually because the groups have very different sizes or mixes across the variants." },
  { keys: /sample ratio|\bsrm\b/i, text: 'Sample ratio mismatch is when the traffic split between variants differs from the planned split by more than chance allows. It usually signals a bug in assignment or logging, so results should not be trusted until it is explained.' },
  { keys: /novelty/i, text: 'A novelty effect is a temporary lift because something is new; it fades as users get used to it. Comparing early vs. later periods of a test helps reveal it.' },
  { keys: /peek|early stopping|stop(ping)? (the )?test early/i, text: 'Peeking means checking results repeatedly and stopping as soon as they look significant. It inflates false positives; fix the sample size up front or use a sequential method.' },
  { keys: /multiple (comparison|testing)|bonferroni/i, text: 'With many comparisons, some will look significant by chance. Corrections like Bonferroni (divide alpha by the number of tests) keep the overall false-positive rate under control.' },
  { keys: /\bpower\b|sample size/i, text: 'Statistical power is the chance a test detects an effect that really exists. It grows with sample size and effect size; under-powered tests often miss real effects or exaggerate the ones they find.' },
  { keys: /conversion rate/i, text: 'Conversion rate = conversions / visitors (or sessions) for the same group and period. Make sure the numerator and denominator are defined the same way for each variant.' },
  { keys: /a\/?b test|experiment|control group/i, text: 'An A/B test randomly splits users between a control and a variant so that the only systematic difference is the change being tested. Randomisation is what lets you read a difference as cause and effect.' },
  { keys: /weighted average/i, text: 'A weighted average multiplies each value by its weight, sums those, and divides by the sum of the weights, so bigger groups count for more.' },
  { keys: /segment/i, text: 'Segmenting means splitting results by a meaningful attribute (device, region, plan) to see whether an overall number hides different behaviour in different groups.' },
  { keys: /\bmedian\b|\bthe mean\b|\bmean vs\b|\baverage\b/i, text: 'The mean is the sum divided by the count; the median is the middle value. With skewed data or outliers, the median is usually the more representative "typical" value.' },
  { keys: /percentage point|relative (change|lift)|lift/i, text: 'An absolute change is measured in percentage points (2% to 3% is +1 pp); a relative change or lift divides by the baseline (2% to 3% is +50%). Always say which one you mean.' },
];

export function lookupGlossary(question: string): string | null {
  const hit = GLOSSARY.find((g) => g.keys.test(question));
  return hit ? hit.text : null;
}
