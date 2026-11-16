/**
 * Small, domain-agnostic glossary used by the MOCK tutor so concept/method questions get a real answer
 * without an LLM. General definitions only — never problem-specific results.
 */
export const GLOSSARY: { keys: RegExp; text: string }[] = [
  { keys: /elasticit/i, text: 'Price elasticity of demand is the % change in quantity divided by the % change in price. If it is below -1 (elastic), a price rise loses more volume than it gains in price, so revenue falls; between 0 and -1 (inelastic), revenue rises.' },
  { keys: /contribution margin|unit margin/i, text: 'Contribution margin is price minus every variable cost per unit (including percentage-based fees), i.e. what each sale contributes toward fixed costs and profit. Made-up example: a $60 product with $22 of variable costs has a $38 margin; 300 units contribute $11,400. Revenue alone would overstate it.' },
  { keys: /break[- ]?even/i, text: 'Break-even is the point where total contribution covers fixed costs: break-even units = fixed costs / unit contribution margin.' },
  { keys: /cannibali[sz]/i, text: 'Cannibalisation is when a new product or price point takes sales from your own existing offers instead of winning new customers, so the net gain is smaller than the gross sales.' },
  { keys: /\bltv\b|lifetime value|\bclv\b/i, text: 'Lifetime value from monthly churn: if a share c of customers leaves each month, a customer stays about 1 / c months on average, so LTV is roughly monthly contribution margin / c. Made-up example: $6 of margin a month and 3% monthly churn means about 33 months, so LTV is about $200. Use margin (price minus every variable cost), not price, or you will overstate it.' },
  { keys: /\bcac\b|acquisition cost|cost to acquire/i, text: 'Customer acquisition cost (CAC) is total acquisition spend divided by the number of paying customers it produced (not trials or sign-ups). Made-up example: $8,000 of ads that yield 50 paying customers is a CAC of $160. Compare it with LTV: below 1x you lose money on every customer you buy.' },
  { keys: /payback/i, text: 'Payback period is how many months of contribution margin it takes to earn back what you paid to acquire a customer: CAC / monthly contribution margin. Made-up example: CAC $84 and $6 margin a month is a 14-month payback.' },
  { keys: /chi[- ]?squared?|goodness[- ]of[- ]fit/i, text: 'A chi-square goodness-of-fit test compares observed counts with the counts you expected: sum (observed - expected)^2 / expected over the groups, then compare with a chi-square distribution (1 degree of freedom for a two-way split). Made-up example: a planned 50/50 split of 1,000 users that came out 540 / 460 gives (40^2/500) x 2 = 6.4, p around 0.01.' },
  { keys: /z[- ]?test|two[- ]proportion/i, text: 'A two-proportion z-test compares two conversion rates: z = (p1 - p2) / sqrt(p(1 - p)(1/n1 + 1/n2)), where p is the pooled rate. Made-up example: 100/1,000 vs 130/1,000 gives z of about 2.1, so p is about 0.04.' },
  { keys: /\bchurn|retention/i, text: 'Churn is the share of customers who leave in a period (retention is 1 minus churn). Small changes compound: it matters a lot for lifetime value.' },
  { keys: /revenue|profit/i, text: 'Revenue = price x units; profit = revenue - variable costs - fixed costs. A choice that maximises revenue does not necessarily maximise profit, so check which one the question asks for.' },
  { keys: /p[- ]?value/i, text: 'A p-value is the probability of seeing a result at least this extreme if there were truly no effect. A small p-value (e.g. < 0.05) means the data would be surprising under "no effect"; it is not the probability that the effect is real.' },
  { keys: /significan/i, text: 'Statistical significance means the observed difference is unlikely to be pure noise at a chosen threshold (alpha, often 5%). It says nothing about whether the effect is large enough to matter: that is practical significance.' },
  { keys: /confidence interval|\bci\b/i, text: 'A confidence interval is a range built so that, over many repeats, a stated share of such ranges (usually ninety-five percent) contain the true value. If the interval for a difference includes 0, the data are consistent with no effect.' },
  { keys: /simpson/i, text: "Simpson's paradox is when a trend that appears in every subgroup reverses (or disappears) once the groups are combined, usually because the groups have very different sizes or mixes across the variants." },
  { keys: /sample ratio|\bsrm\b/i, text: 'Sample ratio mismatch is when the traffic split between variants differs from the planned split by more than chance allows. It usually signals a bug in assignment or logging, so results should not be trusted until it is explained. Test it with a chi-square goodness-of-fit test of the observed counts against the planned ratio; a tiny p-value means the split is broken.' },
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
