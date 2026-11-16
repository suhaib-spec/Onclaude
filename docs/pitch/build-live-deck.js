const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');
const { applyTheme } = require('/root/.claude/skills/synced/55ab73c0-72ca-4a0c-9517-0698dfac4f65_bc9fe345-093c-4538-bbf1-2f83e39661c3/pptx/scripts/apply_theme.js');

const HEX = {
  ink: '17133A', ink2: '241F55', inkLine: '3B3576', paper: 'F7F6FC', white: 'FFFFFF',
  violet: '5B3DF5', violetSoft: 'E9E4FF', amber: 'FFB547', green: '12805A', red: 'C2410C',
  muted: '5C5878', mutedDark: 'BCB7E0', line: 'E2DDF3',
};
const THEME = {
  name: 'Hintwise',
  headFontFace: 'Arial',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: HEX.ink, lt1: HEX.white, dk2: HEX.muted, lt2: HEX.paper,
    accent1: HEX.violet, accent2: HEX.amber, accent3: HEX.green, accent4: HEX.red,
    accent5: HEX.ink2, accent6: HEX.violetSoft, hlink: HEX.violet, folHlink: HEX.ink2,
  },
};

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: '#' + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  pres.title = 'Hintwise: Help, not answers';
  pres.author = 'Hintwise team';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  // Layouts
  pres.defineSlideMaster({
    title: 'DARK',
    background: { color: HEX.ink },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 0.55, w: 11.9, h: 1.2, fontFace: 'Arial', fontSize: 40, bold: true, color: C.background1, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    ],
    slideNumber: { x: 12.3, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: HEX.mutedDark, align: 'right' },
  });
  pres.defineSlideMaster({
    title: 'LIGHT',
    background: { color: HEX.paper },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 0.55, w: 11.9, h: 1.2, fontFace: 'Arial', fontSize: 40, bold: true, color: C.text1, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    ],
    slideNumber: { x: 12.3, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: HEX.muted, align: 'right' },
  });
  pres.defineSlideMaster({
    title: 'ACCENT',
    background: { color: HEX.violet },
    objects: [
      { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 0.55, w: 11.9, h: 1.2, fontFace: 'Arial', fontSize: 40, bold: true, color: C.background1, valign: 'top', align: 'left', margin: 0 }, text: '' } },
    ],
    slideNumber: { x: 12.3, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: HEX.violetSoft, align: 'right' },
  });

  const shadow = () => ({ type: 'outer', color: '000000', opacity: 0.12, blur: 8, offset: 2, angle: 90 });
  const kicker = (s, text, color) =>
    s.addText(text.toUpperCase(), { x: 0.7, y: 0.25, w: 8, h: 0.3, fontSize: 12, bold: true, charSpacing: 3, color, margin: 0, isTextBox: true, objectName: 'Kicker' });
  const card = (s, x, y, w, h, fill, line) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.15, fill: { color: fill }, line: { color: line || fill, width: 1 }, shadow: shadow(), objectName: 'Card' });
  const bubble = (s, text, x, y, w, fill, color) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.75, rectRadius: 0.3, fill: { color: fill }, line: { color: fill }, objectName: 'Chat bubble' });
    s.addText(text, { x: x + 0.25, y, w: w - 0.5, h: 0.75, fontSize: 17, color, valign: 'middle', margin: 0, isTextBox: true, objectName: 'Chat text' });
  };

  const ic = {
    pen: await icon(fa.FaPenToSquare, HEX.violet), chat: await icon(fa.FaComments, HEX.violet), chart: await icon(fa.FaChartColumn, HEX.violet),
    check: await icon(fa.FaCircleCheck, HEX.green), x: await icon(fa.FaCircleXmark, HEX.red), shield: await icon(fa.FaShieldHalved, HEX.white),
    q: await icon(fa.FaCircleQuestion, HEX.violet), doc: await icon(fa.FaFileLines, HEX.muted),
    lock: await icon(fa.FaLock, HEX.violet), user: await icon(fa.FaUser, HEX.violet), robot: await icon(fa.FaRobot, HEX.violet), gavel: await icon(fa.FaShieldHalved, HEX.violet),
    checkW: await icon(fa.FaCheck, HEX.amber), xW: await icon(fa.FaXmark, HEX.mutedDark),
  };


  const shot = 'image/png;base64,' + require('fs').readFileSync('/tmp/live-real.png').toString('base64');
  pres.title = 'Hintwise: the AI interviewer that knows the job';

  // 1 Cover
  pres.addSection({ title: 'Hook' });
  let s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Hook' });
  kicker(s, 'Hintwise', HEX.amber);
  s.addText('Every hire starts with an interview. Most interviews are a guess', { placeholder: 'title' });
  s.addText('Hintwise is an AI interviewer that knows the job, talks to every candidate, and tells you who to hire, and why.',
    { x: 0.7, y: 2.6, w: 6.2, h: 1.6, fontSize: 22, color: HEX.mutedDark, margin: 0, isTextBox: true });
  s.addText('Interviews you can trust.', { x: 0.7, y: 4.5, w: 6, h: 0.6, fontSize: 28, bold: true, color: HEX.amber, margin: 0, isTextBox: true });
  bubble(s, 'Tell me about a time data changed your team’s decision.', 7.3, 2.6, 5.3, HEX.violet, HEX.white);
  bubble(s, 'We were about to cut the free plan. I found 38% of upgrades started there…', 7.0, 3.6, 5.6, HEX.inkLine, HEX.white);
  bubble(s, 'Good, that number makes it concrete. What happened next?', 7.3, 4.6, 5.3, HEX.violet, HEX.white);
  s.addNotes('Hook: "Every hire your company makes starts with an interview. And most interviews are a guess."');

  // 2 Problem
  pres.addSection({ title: 'Problem' });
  s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: 'Problem' });
  kicker(s, 'The problem', HEX.violet);
  s.addText('Hiring runs on interviews that are slow, uneven and easy to fake', { placeholder: 'title' });
  const pains = [
    [ic.chat, 'Slow', 'Managers lose hours to first-round calls that mostly repeat the same questions.'],
    [ic.q, 'Uneven', 'Every interviewer asks different questions and scores on gut feel. Two candidates, two different tests.'],
    [ic.x, 'Easy to fake', 'AI writes polished answers in seconds. Gartner expects 1 in 4 candidate profiles to be fake by 2028.'],
  ];
  pains.forEach(([img, h, t], i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 2.3, 3.75, 3.4, HEX.white, HEX.line);
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: 2.6, w: 0.9, h: 0.9, fill: { color: HEX.violetSoft }, line: { color: HEX.violetSoft }, objectName: 'Icon circle' });
    s.addImage({ data: img, x: x + 0.58, y: 2.83, w: 0.44, h: 0.44, altText: h });
    s.addText(h, { x: x + 0.35, y: 3.7, w: 3.1, h: 0.55, fontFace: 'Arial', fontSize: 26, bold: true, color: HEX.ink, margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.35, y: 4.3, w: 3.1, h: 1.3, fontSize: 16, color: HEX.muted, valign: 'top', margin: 0, isTextBox: true });
  });
  s.addText([{ text: 'The result: ', options: { bold: true, color: HEX.violet } }, { text: 'good people get missed, the wrong people get hired, and nobody can explain why.' }],
    { x: 0.7, y: 6.05, w: 11.9, h: 0.6, fontSize: 20, color: HEX.ink, margin: 0, isTextBox: true });
  s.addNotes('Make it feel big: "Interviews decide careers and company futures, yet they are run on gut feel. And now AI can write a perfect answer for anyone."');

  // 3 Why now
  s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Problem' });
  kicker(s, 'Why now', HEX.amber);
  s.addText('AI changed how people apply. Interviews never caught up', { placeholder: 'title' });
  [['46%', 'of hiring teams already allow AI in interviews; another 20% decide case by case.', 'CoderPad, State of Tech Hiring 2026'],
   ['1 in 4', 'candidate profiles expected to be fake by 2028.', 'Gartner, July 2025'],
   ['$3B', 'market for hiring assessments by 2034, up from $1.34B in 2025.', 'The Insight Partners']].forEach(([n, t, src], i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 2.2, 3.75, 3.9, HEX.ink2, HEX.inkLine);
    s.addText(n, { x: x + 0.35, y: 2.5, w: 3.1, h: 1.2, fontFace: 'Arial', fontSize: 60, bold: true, color: HEX.amber, margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.35, y: 3.8, w: 3.1, h: 1.5, fontSize: 18, color: HEX.white, valign: 'top', margin: 0, isTextBox: true });
    s.addText(src, { x: x + 0.35, y: 5.5, w: 3.1, h: 0.4, fontSize: 11, color: HEX.mutedDark, margin: 0, isTextBox: true });
  });
  s.addNotes('Say: "Candidates now apply with AI. Companies still interview like it is 2015."');

  // 4 Solution
  pres.addSection({ title: 'Solution' });
  s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: 'Solution' });
  kicker(s, 'The fix', HEX.violet);
  s.addText('Hintwise: an AI interviewer that knows the job', { placeholder: 'title' });
  [[ic.pen, '1 · Paste the job', 'Hintwise reads the job description and builds the scorecard from it.'],
   [ic.chat, '2 · Ava interviews', 'She asks, listens, and follows up when an answer is thin. Same fair interview for everyone.'],
   [ic.chart, '3 · You decide', 'A score for every skill, the candidate’s own words as proof, and one clear next step.']].forEach(([img, h, t], i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 2.2, 3.75, 3.5, HEX.white, HEX.line);
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: 2.5, w: 0.9, h: 0.9, fill: { color: HEX.violetSoft }, line: { color: HEX.violetSoft }, objectName: 'Icon circle' });
    s.addImage({ data: img, x: x + 0.58, y: 2.73, w: 0.44, h: 0.44, altText: h });
    s.addText(h, { x: x + 0.35, y: 3.6, w: 3.1, h: 0.55, fontFace: 'Arial', fontSize: 22, bold: true, color: HEX.ink, margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.35, y: 4.2, w: 3.1, h: 1.4, fontSize: 16, color: HEX.muted, valign: 'top', margin: 0, isTextBox: true });
  });
  s.addText('Works for any role: analyst, sales, finance, engineering.', { x: 0.7, y: 6.05, w: 11.9, h: 0.5, fontSize: 18, bold: true, color: HEX.violet, margin: 0, isTextBox: true });
  s.addNotes('Say: "Paste a job description. Ava runs the interview. You get a decision you can explain."');

  // 5 Product / demo
  s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Solution' });
  kicker(s, 'Live demo', HEX.amber);
  s.addText('Watch Ava interview, and score, in real time', { placeholder: 'title' });
  s.addImage({ data: shot, x: 0.7, y: 1.85, w: 8.4, h: 5.25, sizing: { type: 'contain', w: 8.4, h: 5.25 }, altText: 'Hintwise live interview: candidate on the left, live scorecard on the right' });
  [['Asks & follows up', 'Pushes back on vague answers, like a real interviewer.'], ['Scores live', 'Every answer is scored against the job description.'], ['One clear call', '“Advance to final round: strong data-driven thinker.”']].forEach(([h, t], i) => {
    s.addText(h, { x: 9.5, y: 2.0 + i * 1.6, w: 3.2, h: 0.45, fontSize: 18, bold: true, color: HEX.amber, margin: 0, isTextBox: true });
    s.addText(t, { x: 9.5, y: 2.45 + i * 1.6, w: 3.2, h: 0.95, fontSize: 15, color: HEX.white, valign: 'top', margin: 0, isTextBox: true });
  });
  s.addNotes('Switch to the app: localhost:4200 → Start a live AI interview. Paste the prepared answers; send one weak answer to show the follow-up.');

  // 6 Business
  pres.addSection({ title: 'Business' });
  s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: 'Business' });
  kicker(s, 'Business model', HEX.violet);
  s.addText('Hiring teams pay per interview seat', { placeholder: 'title' });
  [['Starter', 'Free', 'Try 10 AI interviews. Practice mode for candidates.'], ['Team', '$300 / month', '50 interviews a month, custom scorecards, reports.'], ['Enterprise', 'Custom', 'Unlimited interviews, hiring-system integration, fairness audits.']].forEach(([n, p, t], i) => {
    const x = 0.7 + i * 4.05; const hi = i === 1;
    card(s, x, 2.2, 3.75, 3.3, hi ? HEX.violet : HEX.white, hi ? HEX.violet : HEX.line);
    s.addText(n, { x: x + 0.35, y: 2.5, w: 3.1, h: 0.45, fontSize: 18, bold: true, color: hi ? HEX.violetSoft : HEX.violet, margin: 0, isTextBox: true });
    s.addText(p, { x: x + 0.35, y: 3.0, w: 3.1, h: 0.8, fontFace: 'Arial', fontSize: 34, bold: true, color: hi ? HEX.white : HEX.ink, margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.35, y: 3.95, w: 3.1, h: 1.4, fontSize: 16, color: hi ? HEX.white : HEX.muted, valign: 'top', margin: 0, isTextBox: true });
  });
  s.addText('One AI interview costs us cents in compute. A first-round call costs a manager an hour. Pilot pricing, to be validated with early customers.',
    { x: 0.7, y: 5.85, w: 11.9, h: 0.8, fontSize: 16, color: HEX.ink, margin: 0, isTextBox: true });
  s.addNotes('Say: "We replace the most expensive hour in hiring, the first-round call, with something faster, fairer and explainable."');

  // 7 Close
  s = pres.addSlide({ masterName: 'ACCENT', sectionTitle: 'Business' });
  kicker(s, 'The ask', HEX.amber);
  s.addText('Interviews you can trust, for every role', { placeholder: 'title' });
  card(s, 0.7, 2.3, 5.8, 2.3, HEX.white, HEX.white);
  s.addText('3 pilot partners in 30 days', { x: 1.1, y: 2.6, w: 5.1, h: 0.6, fontFace: 'Arial', fontSize: 24, bold: true, color: HEX.ink, margin: 0, isTextBox: true });
  s.addText('Hiring teams who want faster, fairer first rounds.', { x: 1.1, y: 3.3, w: 5.1, h: 1.1, fontSize: 18, color: HEX.muted, valign: 'top', margin: 0, isTextBox: true });
  card(s, 6.8, 2.3, 5.8, 2.3, HEX.ink, HEX.ink);
  s.addText('Next', { x: 7.2, y: 2.6, w: 5.1, h: 0.6, fontFace: 'Arial', fontSize: 24, bold: true, color: HEX.amber, margin: 0, isTextBox: true });
  s.addText('Real-time voice calls, video, and integration with hiring systems.', { x: 7.2, y: 3.3, w: 5.1, h: 1.1, fontSize: 18, color: HEX.white, valign: 'top', margin: 0, isTextBox: true });
  s.addText('Hintwise · Hire on evidence, not gut feel.', { x: 0.7, y: 5.3, w: 11.9, h: 0.8, fontFace: 'Arial', fontSize: 34, bold: true, color: HEX.white, margin: 0, isTextBox: true });
  s.addNotes('Close: "Every company deserves interviews it can trust. Hintwise: hire on evidence, not gut feel."');

  await pres.writeFile({ fileName: '/tmp/pptx/Hintwise_Live_Interview_Pitch.pptx' });
  await applyTheme('/tmp/pptx/Hintwise_Live_Interview_Pitch.pptx', THEME);
  console.log('written');
})().catch((e) => { console.error(e); process.exit(1); });
