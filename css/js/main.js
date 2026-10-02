/* Jayanth Vukkisa: portfolio. Vanilla JS, no dependencies. */
(() => {
'use strict';

/* ───────────── helpers ───────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pad = (n, l = 2) => String(n).padStart(l, '0');
const css = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();
const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));

/** Fit a canvas to its CSS box (retina-aware). `onFit` fires on every resize. */
function canvas2d(el, onFit) {
  const st = { ctx: el.getContext('2d'), w: 0, h: 0 };
  const fit = () => {
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    st.w = r.width; st.h = r.height;
    el.width = Math.round(r.width * dpr); el.height = Math.round(r.height * dpr);
    st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onFit && onFit(st);
  };
  new ResizeObserver(fit).observe(el);   // fires once on observe, so no manual first call
  return st;
}
const whenVisible = (el, fn, opts = { threshold: .05 }) => new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting)), opts).observe(el);

/** Minimal Python-ish syntax highlighter. */
function highlight(src) {
  return esc(src).replace(
    /(#.*$)|("[^"\n]*"|'[^'\n]*')|\b(import|from|def|return|for|in|if|else|not|and|or|as|with|print|True|False|None|lambda)\b|\b(\d+(?:\.\d+)?)\b/gm,
    (m, c, s, k, n) => c ? `<span class="c">${c}</span>` : s ? `<span class="s">${s}</span>` : k ? `<span class="k">${k}</span>` : `<span class="n">${n}</span>`);
}
$$('pre[data-hl]').forEach(p => { p.innerHTML = highlight(p.textContent); });
$('#year').textContent = new Date().getFullYear();

/* ───────────── reveal on scroll ───────────── */
(() => {
  const mk = th => new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: th, rootMargin: '0px 0px -6% 0px' });
  const a = mk(.12), b = mk(.4);
  $$('.rv').forEach(el => a.observe(el));
  $$('.chapter').forEach(el => b.observe(el));
})();

/* ───────────── the field: dots that learn structure as you scroll ───────────── */
const Field = (() => {
  const cv = $('#field'), ctx = cv.getContext('2d');
  const mobile = innerWidth < 700, N = mobile ? 84 : 150;
  const r = rng(42);
  let W = 0, H = 0, tick = 0, cur = 0, ink = '#16130e', hot = '#d83a20';
  const ptr = { x: -999, y: -999, on: false };

  const knn = (pts, k, skip = -1) => {
    const E = [], seen = new Set();
    pts.forEach((p, i) => {
      if (i === skip) return;
      pts.map((q, j) => [(p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2, j]).filter(x => x[1] !== i && x[1] !== skip).sort((a, b) => a[0] - b[0]).slice(0, k)
        .forEach(([, j]) => { const key = i < j ? `${i}-${j}` : `${j}-${i}`; if (!seen.has(key)) { seen.add(key); E.push([i, j]); } });
    });
    return E;
  };

  const L = [];
  { // 0 · lattice: a table
    const cols = Math.ceil(Math.sqrt(N * 1.6)), rows = Math.ceil(N / cols), pts = [], edges = [];
    for (let i = 0; i < N; i++) { pts.push([.05 + .9 * ((i % cols) + .5) / cols, .06 + .88 * ((i / cols | 0) + .5) / rows]); if ((i % cols) < cols - 1 && i + 1 < N) edges.push([i, i + 1]); if (i + cols < N) edges.push([i, i + cols]); }
    L.push({ pts, edges, a: .035 });
  }
  { // 1 · rows of uneven cells: data in a table
    const rows = mobile ? 8 : 10, per = Math.ceil(N / rows), pts = [], edges = [];
    for (let j = 0; j < rows; j++) {
      const c = Math.min(per, N - pts.length), ws = Array.from({ length: c }, () => .4 + r()), tot = ws.reduce((a, b) => a + b, 0); let acc = 0;
      for (let i = 0; i < c; i++) { acc += ws[i]; pts.push([.05 + .9 * (acc - ws[i] / 2) / tot, .06 + .88 * (j + .5) / rows]); if (i) edges.push([pts.length - 2, pts.length - 1]); }
    }
    L.push({ pts, edges, a: .12 });
  }
  { // 2 · three tiers: a request passing through a backend
    const pts = Array.from({ length: N }, (_, i) => [[.16, .5, .84][i % 3] + (r() - .5) * .07, .06 + .88 * r()]), edges = [];
    pts.forEach((p, i) => { if (i % 3 < 2) { let best = -1, bd = 9; pts.forEach((q, j) => { if (j % 3 === i % 3 + 1 && Math.abs(q[1] - p[1]) < bd) { bd = Math.abs(q[1] - p[1]); best = j; } }); if (best > -1 && r() < .55) edges.push([i, best]); } });
    L.push({ pts, edges, a: .12 });
  }
  { // 3 · scatter with a fitted line: a model
    const pts = Array.from({ length: N }, () => { const x = .04 + .92 * r(); return [x, clamp(.8 - .6 * x + (r() - .5) * .3, .04, .96)]; });
    const n = pts.length, sx = pts.reduce((s, p) => s + p[0], 0), sy = pts.reduce((s, p) => s + p[1], 0), sxy = pts.reduce((s, p) => s + p[0] * p[1], 0), sxx = pts.reduce((s, p) => s + p[0] * p[0], 0);
    const b = (n * sxy - sx * sy) / (n * sxx - sx * sx), a = (sy - b * sx) / n;
    L.push({ pts, edges: [], a: 0, line: [[.03, a + b * .03], [.97, a + b * .97]] });
  }
  { // 4 · clusters and a query that reaches into one: retrieval
    const C = [[.22, .3], [.46, .72], [.7, .3], [.86, .74], [.58, .2]], g = () => (r() + r() + r() - 1.5) * .09;
    const pts = Array.from({ length: N }, (_, i) => i === 0 ? [.08, .52] : [clamp(C[i % 5][0] + g(), .03, .97), clamp(C[i % 5][1] + g(), .04, .96)]);
    const edges = knn(pts, 2, 0);
    const hot = pts.map((p, j) => [(p[0] - pts[0][0]) ** 2 + (p[1] - pts[0][1]) ** 2, j]).filter(x => x[1]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(x => [0, x[1]]);
    L.push({ pts, edges, a: .13, hot });
  }
  { // 5 · open constellation, with one thing it doesn't know
    const pts = Array.from({ length: N }, () => [.04 + .92 * r(), .05 + .9 * r()]);
    L.push({ pts, edges: knn(pts, 1), a: .1, hollow: [.74, .32] });
  }

  const xs = L[0].pts.map(p => p[0]), ys = L[0].pts.map(p => p[1]);
  const ox = new Float32Array(N), oy = new Float32Array(N), start = Array.from({ length: N }, () => 0);
  const mix = L.map((_, k) => k === 0 ? 1 : 0);

  function fit() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); ink = css(document.body, '--ink'); hot = css(document.body, '--hot'); }
  addEventListener('resize', fit); fit();
  addEventListener('pointermove', e => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = !reduced; const w = $('#whisper'); if (w) w.style.opacity = '.3'; }, { passive: true });
  document.addEventListener('pointerleave', () => { ptr.on = false; });

  function set(k) {
    if (k === cur) return;
    cur = k;
    for (let i = 0; i < N; i++) start[i] = tick + (reduced ? 0 : Math.random() * 32 | 0);
  }

  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    tick++;
    const T = L[cur].pts, ease = reduced ? 1 : .075;
    for (let i = 0; i < N; i++) {
      if (tick >= start[i]) { xs[i] += (T[i][0] - xs[i]) * ease; ys[i] += (T[i][1] - ys[i]) * ease; }
      ox[i] *= .86; oy[i] *= .86;
      if (ptr.on) { const dx = xs[i] * W - ptr.x, dy = ys[i] * H - ptr.y, d = Math.hypot(dx, dy); if (d < 120 && d > .1) { const f = (1 - d / 120) ** 2 * 5; ox[i] += dx / d * f; oy[i] += dy / d * f; } }
    }
    mix.forEach((m, k) => { mix[k] += ((k === cur ? 1 : 0) - m) * (reduced ? 1 : .06); });
    ctx.clearRect(0, 0, W, H);
    const P = i => [xs[i] * W + ox[i], ys[i] * H + oy[i]];
    ctx.lineWidth = 1;
    L.forEach((l, k) => {
      const m = mix[k]; if (m < .02) return;
      if (l.edges.length) { ctx.strokeStyle = ink; ctx.globalAlpha = m * l.a * 2; ctx.beginPath(); l.edges.forEach(([a, b]) => { const p = P(a), q = P(b); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); }
      ctx.strokeStyle = hot; ctx.lineWidth = 1.6;
      if (l.hot) { ctx.globalAlpha = m * .85; ctx.beginPath(); l.hot.forEach(([a, b]) => { const p = P(a), q = P(b); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); }
      if (l.line) { ctx.globalAlpha = m * .5; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(l.line[0][0] * W, l.line[0][1] * H); ctx.lineTo(l.line[1][0] * W, l.line[1][1] * H); ctx.stroke(); ctx.setLineDash([]); }
      if (l.hollow) { ctx.globalAlpha = m * .9; ctx.beginPath(); ctx.arc(l.hollow[0] * W, l.hollow[1] * H, 11 + Math.sin(tick / 28) * 3, 0, 7); ctx.stroke(); }
      ctx.lineWidth = 1;
    });
    ctx.globalAlpha = .34; ctx.fillStyle = ink;
    for (let i = 0; i < N; i++) { const p = P(i); ctx.beginPath(); ctx.arc(p[0], p[1], i === 0 && cur === 4 ? 3.4 : 1.7, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  frame();
  return { set };
})();

/* the page tells the field which structure to show, and the header which chapter we're in */
(() => {
  const here = $('#here');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    if (e.target.dataset.layout != null) Field.set(+e.target.dataset.layout);
    const t = e.target.dataset.here;
    if (t && here.textContent !== t) { here.style.opacity = 0; setTimeout(() => { here.textContent = t; here.style.opacity = 1; }, 160); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-layout]').forEach(el => io.observe(el));
})();

/* ───────────── opening: a typed query ───────────── */
(() => {
  const target = $('#typed'), q = "SELECT * FROM jayanth WHERE obsession = 'machines';";
  if (reduced) { target.textContent = q; return; }
  let i = 0; const tick = () => { target.textContent = q.slice(0, ++i); if (i < q.length) setTimeout(tick, 26 + Math.random() * 30); };
  setTimeout(tick, 500);
})();

/* ───────────── who: two compressions of the same person ───────────── */
(() => {
  const human = $('#shortHuman'), resume = $('#shortResume'), note = $('#note'), toggle = $('#toggle');
  toggle.onclick = () => {
    const r = resume.hidden; resume.hidden = !r; human.hidden = r;
    toggle.textContent = r ? 'read the human version instead ↔' : 'read the résumé version instead ↔';
    note.style.visibility = r ? 'hidden' : 'visible';
  };
  $$('.fn').forEach(b => b.addEventListener('click', () => {
    $$('.fn').forEach(o => o.setAttribute('aria-expanded', o === b));
    note.style.opacity = 0;
    setTimeout(() => { note.textContent = b.dataset.note; note.style.opacity = 1; }, 120);
  }));
})();

/* ───────────── KnowYourRules ───────────── */
(() => {
  /* curation: 400+ in, a few kept */
  const grid = $('#docs'), replay = $('#curate'), rd = rng(21);
  grid.innerHTML = Array.from({ length: 420 }, () => `<i class="d ${rd() < .13 ? 'keep' : 'drop'}" style="--t:${(rd() * .9).toFixed(2)}s"></i>`).join('');
  const cut = () => { grid.classList.remove('cut'); void grid.offsetWidth; setTimeout(() => grid.classList.add('cut'), 400); };
  replay.onclick = cut;
  let seen = false; whenVisible(grid, v => { if (v && !seen) { seen = true; cut(); } }, { threshold: .6 });

  /* the pipeline: hover a stage, or send a question down it */
  const NODES = [
    ['PDFs', 'Official government documents: acts, rules, notifications. 400+ went in.', 'Some are clean text, some are scans, all are long.'],
    ['Extract', 'Pull the text out page by page, remembering which document and page it came from.', 'Tables and multi-column layouts come out scrambled, and a scrambled rule is a wrong rule.'],
    ['Clean', 'Strip headers, footers, page numbers and broken hyphenation. Drop duplicates. Decide what stays.', 'Over-cleaning deletes the one line that mattered.'],
    ['Chunk', 'Split into passages big enough to carry meaning and small enough to embed.', 'A rule and its penalty land in different chunks.'],
    ['Embed', 'nomic-embed-text, served locally by Ollama, turns every chunk into a vector. Your question gets embedded the same way.', '"Near" is only as good as the text you embedded.'],
    ['Chroma', 'The vector store keeps each embedding with its document and page.', 'Metadata you forget to store is a citation you can never show.'],
    ['Retrieve', 'The chunks nearest to your question come back.', '"Close" is not the same as "relevant".'],
    ['LLM', 'A Groq-hosted LLM, wired up with LangChain LCEL, sees only the retrieved context and one strict instruction: answer from this, or say you can\'t.', 'Models love being helpful. The pull toward answering from memory is the real adversary.'],
    ['Answer', 'A grounded answer with its source, or a clean refusal.', 'A refusal only counts if it fires at the right time, so it has to be tested.']
  ];
  const flow = $('#flow'), noteEl = $('#flowNote');
  flow.innerHTML = NODES.map((n, i) => `<button type="button" class="node ${i < 4 ? 'pre' : ''}" data-i="${i}"><i></i>${n[0]}</button>`).join('');
  const nodes = $$('.node', flow);
  const say = (i, extra) => { const [t, d, b] = NODES[i]; noteEl.innerHTML = `<b>${esc(t)}</b>${esc(d)}<em>${esc(b)}</em>${extra ? `<br>${extra}` : ''}`; };
  const reset = () => nodes.forEach((n, i) => { n.className = 'node' + (i < 4 ? ' pre' : ''); });
  let running = false;
  nodes.forEach((n, i) => ['mouseenter', 'focus', 'click'].forEach(ev => n.addEventListener(ev, () => { if (!running) say(i); })));
  noteEl.innerHTML = '<b>Hover a stage.</b>The first four are built once, before you ever ask. Then send a question down the pipe and watch how far it gets.';

  /* a toy keyword retriever, standing in for embeddings + Chroma */
  const CHUNKS = [
    ['Sec. 3', 'Driving licence. No person may drive a motor vehicle in a public place without a valid driving licence that authorises them to drive that class of vehicle.'],
    ['Sec. 112', 'Limits of speed. No person shall drive a motor vehicle at a speed exceeding the maximum, or below the minimum, speed limit fixed for that road, area or class of vehicle.'],
    ['Sec. 119', 'Traffic signs and signals. Every driver must obey mandatory traffic signs and signals, and follow directions given by a police officer controlling traffic.'],
    ['Sec. 129', 'Protective headgear. Every person driving or riding a motorcycle, and any pillion rider, must wear protective headgear (a helmet) of the prescribed standard. Sikhs wearing a turban are exempt.'],
    ['Sec. 184', 'Dangerous driving. Driving at a speed or in a manner that is dangerous to the public, considering the nature of the road and traffic, is an offence.'],
    ['Sec. 185', 'Driving under the influence. Driving a motor vehicle with alcohol above the permitted limit of 30 mg per 100 ml of blood is an offence.'],
    ['Sec. 194B', 'Seat belts. Driving without wearing a seat belt, or carrying passengers who are not wearing one, is penalised.']
  ].map(([s, text]) => ({ s, text, src: `Motor Vehicles Act, 1988 (as amended), ${s}` }));
  const SYN = { helmet: 'headgear', helmets: 'headgear', drunk: 'alcohol', drinking: 'alcohol', beer: 'alcohol', liquor: 'alcohol', seatbelt: 'belt', licence: 'license', licences: 'license', licenses: 'license' };
  const STOP = new Set('a an the is are was were be do does did i you we me my to of in on at for and or if it its this that what whats which who whom will can could should would have has had how when where why any than then there their about with from by as tonight today while need needed compulsory mandatory required legal allowed rule rules law laws must'.split(' '));
  const stem = w => { let b = (SYN[w] || w).replace(/(ing|ed|es|s)$/, ''); if (b.length < 4) b = SYN[w] || w; if (b.length > 4) b = b.replace(/e$/, ''); return b; };
  const toks = t => [...new Set((t.toLowerCase().replace(/['’]/g, '').match(/[a-z0-9]+/g) || []).filter(w => !STOP.has(w)).map(stem))];
  CHUNKS.forEach(c => { c.set = new Set(toks(c.text)); });
  const THRESH = .5, out = $('#askOut'), input = $('#askQ');

  async function ask(q) {
    const qt = toks(q); if (!qt.length || running) return;
    running = true; out.innerHTML = ''; reset();
    const scored = CHUNKS.map(c => ({ c, v: qt.filter(t => c.set.has(t)).length / qt.length })).sort((a, b) => b.v - a.v);
    const top = scored[0], ok = top.v >= THRESH;
    nodes.slice(0, 4).forEach(n => n.classList.add('pre'));
    for (const i of [4, 5, 6]) {
      nodes.forEach((n, k) => { if (k >= 4) n.classList.toggle('on', k === i); if (k >= 4 && k < i) n.classList.add('done'); });
      say(i); await wait(650);
    }
    out.innerHTML = `<p class="thr mono">your question became [${qt.map(esc).join(', ')}] · similarity to ${CHUNKS.length} chunks · the line is the threshold</p>
      <ul class="hits">${scored.slice(0, 4).map((x, i) => `<li class="hit ${i === 0 && ok ? 'top' : ''}"><span class="mono">${esc(x.c.s)}</span><span class="hb"><i style="width:0" data-w="${Math.round(x.v * 100)}"></i></span><span class="mono">${Math.round(x.v * 100)}%</span></li>`).join('')}</ul>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.hb i', out).forEach(i => { i.style.width = i.dataset.w + '%'; })));
    await wait(900);
    nodes[6].classList.remove('on'); nodes[6].classList.add('done');
    if (ok) {
      for (const i of [7, 8]) { nodes.forEach((n, k) => { n.classList.toggle('on', k === i); if (k >= 4 && k < i) n.classList.add('done'); }); say(i); await wait(700); }
      nodes[8].classList.remove('on'); nodes[8].classList.add('done');
      out.insertAdjacentHTML('beforeend', `<div class="verdict-box"><p class="vh">grounded answer</p><p>${esc(top.c.text)}</p><p class="src">source: ${esc(top.c.src)}</p></div>`);
    } else {
      nodes[7].classList.add('dead'); nodes[8].classList.add('done');
      noteEl.innerHTML = `<b>Stopped at retrieval.</b>The best match was ${Math.round(top.v * 100)}%, under the ${Math.round(THRESH * 100)}% line. The LLM was never even asked.<em>This is the whole point of the project: not answering is cheaper than answering wrongly.</em>`;
      out.insertAdjacentHTML('beforeend', `<div class="verdict-box no"><p class="vh">refused</p><p>I couldn't find support for that in the documents I was given, so I won't guess.</p></div>`);
    }
    running = false;
  }
  $('#askForm').addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  $('#askChips').innerHTML = ['Do I have to wear a helmet?', 'What is the alcohol limit for drivers?', 'Is a seat belt required?', 'Who will win tonight\'s cricket match?', 'How do I bake a cake while driving?'].map(q => `<button type="button" class="chip">${esc(q)}</button>`).join('');
  $$('#askChips .chip').forEach(b => b.addEventListener('click', () => { input.value = b.textContent; ask(b.textContent); }));
})();

/* ───────────── computer vision: draw the zone ───────────── */
(() => {
  const cv = $('#zoneSim'); let visible = false, last = 0, snap = 0;
  const zone = [[.55, .3], [.93, .3], [.96, .92], [.5, .92]], r = rng(3), log = $('#evLog');
  const mk = id => ({ id, x: r(), y: .35 + r() * .6, tx: r(), ty: .35 + r() * .6, sp: 7e-5 + r() * 6e-5, inside: false });
  const people = [1, 2, 3, 4].map(mk);
  const inPoly = (x, y) => { let c = false; for (let i = 0, j = zone.length - 1; i < zone.length; j = i++) { const [xi, yi] = zone[i], [xj, yj] = zone[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const st = canvas2d(cv);
  const addLog = (p, entered) => {
    const t = new Date(), li = document.createElement('li'); if (entered) li.className = 'in';
    li.innerHTML = `<b>${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}</b> person #${p.id} ${entered ? `entered zone → snap_${pad(++snap, 4)}.jpg` : 'left zone'}`;
    log.prepend(li); while (log.children.length > 7) log.lastChild.remove();
  };
  function frame(now) {
    if (!visible) return; requestAnimationFrame(frame);
    const dt = Math.min(now - last, 64); last = now;
    const { ctx: c, w: W, h: H } = st; if (!W) return;
    people.forEach(p => {
      const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
      if (d < .02) { p.tx = .04 + r() * .92; p.ty = .33 + r() * .64; } else { p.x += dx / d * p.sp * dt; p.y += dy / d * p.sp * dt; }
      const ins = inPoly(p.x, p.y); if (ins !== p.inside) { p.inside = ins; addLog(p, ins); }
    });
    c.fillStyle = '#0d0c09'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(240,233,219,.07)'; c.lineWidth = 1;
    for (let i = 0; i < 9; i++) { const y = H * (.2 + .8 * (i / 8) ** 1.6); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(W / 2 + i * W * .018, H * .2); c.lineTo(W / 2 + i * W * .2, H); c.stroke(); }
    c.beginPath(); zone.forEach(([x, y], i) => i ? c.lineTo(x * W, y * H) : c.moveTo(x * W, y * H)); c.closePath();
    c.fillStyle = 'rgba(255,106,77,.13)'; c.fill(); c.setLineDash([7, 6]); c.strokeStyle = '#ff6a4d'; c.lineWidth = 1.6; c.stroke(); c.setLineDash([]);
    zone.forEach(([x, y]) => { c.fillStyle = '#f0e9db'; c.beginPath(); c.arc(x * W, y * H, 6, 0, 7); c.fill(); c.strokeStyle = '#ff6a4d'; c.lineWidth = 2; c.stroke(); });
    [...people].sort((a, b) => a.y - b.y).forEach(p => {
      const fx = p.x * W, fy = p.y * H, bh = H * (.12 + .2 * p.y), bw = bh * .42, col = p.inside ? '#ff6a4d' : '#7fd49a';
      c.strokeStyle = col; c.fillStyle = col; c.lineWidth = p.inside ? 2.5 : 1.4;
      c.globalAlpha = .22; c.beginPath(); c.arc(fx, fy - bh * .8, bw * .2, 0, 7); c.fill(); c.fillRect(fx - bw * .27, fy - bh * .66, bw * .54, bh * .56); c.globalAlpha = 1;
      c.strokeRect(fx - bw / 2, fy - bh, bw, bh);
      c.font = '600 10px JetBrains Mono, monospace'; const label = p.inside ? `#${p.id} UNAUTHORIZED` : `person ${(.86 + (p.id * 37 % 13) / 100).toFixed(2)}`;
      const tw = c.measureText(label).width + 8; c.fillRect(fx - bw / 2, fy - bh - 15, tw, 15); c.fillStyle = '#0d0c09'; c.fillText(label, fx - bw / 2 + 4, fy - bh - 4);
    });
    c.fillStyle = 'rgba(240,233,219,.75)'; c.font = '500 11px JetBrains Mono, monospace'; c.fillText('SIMULATION · drag the corners', 12, 20);
    c.fillStyle = '#ff6a4d'; c.fillText('● REC', W - 54, 20);
    c.fillStyle = 'rgba(255,255,255,.025)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1);
  }
  whenVisible(cv, v => { visible = v; if (v) { last = performance.now(); requestAnimationFrame(frame); } });
  let drag = -1;
  const hit = e => { const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; return zone.findIndex(([zx, zy]) => Math.hypot(zx * b.width - x, zy * b.height - y) < 16); };
  cv.addEventListener('pointerdown', e => { drag = hit(e); if (drag > -1) { cv.setPointerCapture(e.pointerId); e.preventDefault(); } });
  cv.addEventListener('pointermove', e => {
    if (drag > -1) { const b = cv.getBoundingClientRect(); zone[drag] = [clamp((e.clientX - b.left) / b.width, .01, .99), clamp((e.clientY - b.top) / b.height, .22, .99)]; }
    else cv.style.cursor = hit(e) > -1 ? 'grab' : 'default';
  });
  ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { drag = -1; }));
  $('#addPerson').onclick = () => { if (people.length < 9) people.push(mk(people.length + 1)); };
})();

/* ───────────── how I think: three experiments in being wrong ───────────── */
// forecast shootout
(() => {
  const cv = $('#fc');
  const MODELS = [{ k: 'naive', n: 'naive', c: '--mute', dash: [3, 4] }, { k: 'snaive', n: 'seasonal-naive', c: '--c4' }, { k: 'trend', n: 'linear trend', c: '--c3' }, { k: 'ts', n: 'trend + season', c: '--c1' }];
  const show = { naive: true, snaive: true, trend: true, ts: true }, TR = 36, N = 48;
  let seed = 7, y = [], preds = {}, mae = {};
  function build() {
    const r = rng(seed); y = [];
    for (let i = 0; i < N; i++) y.push(100 + 1.1 * i + 14 * Math.sin(2 * Math.PI * i / 12 + .6) + (r() + r() + r() - 1.5) * 7);
    let sx = 0, sy = 0, sxy = 0, sxx = 0;
    for (let i = 0; i < TR; i++) { sx += i; sy += y[i]; sxy += i * y[i]; sxx += i * i; }
    const b = (TR * sxy - sx * sy) / (TR * sxx - sx * sx), a = (sy - b * sx) / TR;
    const seas = Array(12).fill(0); for (let i = 0; i < TR; i++) seas[i % 12] += (y[i] - (a + b * i)) / (TR / 12);
    preds = { naive: [], snaive: [], trend: [], ts: [] };
    for (let t = TR; t < N; t++) { preds.naive.push(y[TR - 1]); preds.snaive.push(y[t - 12]); preds.trend.push(a + b * t); preds.ts.push(a + b * t + seas[t % 12]); }
    MODELS.forEach(m => { mae[m.k] = preds[m.k].reduce((s, p, i) => s + Math.abs(p - y[TR + i]), 0) / (N - TR); });
    chips(); verdict(); draw();
  }
  function chips() {
    $('#fcChips').innerHTML = MODELS.map(m => `<button type="button" class="chip" data-k="${m.k}" aria-pressed="${show[m.k]}" style="--cc:var(${m.c})"><i></i>${m.n} · ${mae[m.k].toFixed(1)}</button>`).join('') + '<button type="button" class="pill" id="fcRoll">↻ re-roll the noise</button>';
    $$('#fcChips .chip').forEach(b => b.onclick = () => { show[b.dataset.k] = !show[b.dataset.k]; b.setAttribute('aria-pressed', show[b.dataset.k]); draw(); });
    $('#fcRoll').onclick = () => { seed = (seed * 31 + 17) % 9973; build(); };
  }
  function verdict() {
    const s = MODELS.slice().sort((a, b) => mae[a.k] - mae[b.k]);
    $('#fcVerdict').textContent = s[0].k === 'ts'
      ? `the clever one won this time (error ${mae.ts.toFixed(1)}). Re-roll the noise: it often doesn't.`
      : `"${s[0].n}" won (error ${mae[s[0].k].toFixed(1)}), and the clever model came ${s.findIndex(m => m.k === 'ts') + 1}${['st', 'nd', 'rd', 'th'][s.findIndex(m => m.k === 'ts')]}. Beat the dumb baseline before you earn the right to be fancy.`;
  }
  const st = canvas2d(cv, () => draw());
  function draw() {
    const { ctx: c, w: W, h: H } = st; if (!W || !y.length) return;
    const ink = css(cv, '--ink'), rule = css(cv, '--rule'), P = 14;
    const all = [...y, ...Object.values(preds).flat()], lo = Math.min(...all) - 5, hi = Math.max(...all) + 5;
    const X = i => P + i / (N - 1) * (W - 2 * P), Y = v => H - P - (v - lo) / (hi - lo) * (H - 2 * P);
    c.clearRect(0, 0, W, H);
    c.fillStyle = rule; c.globalAlpha = .35; c.fillRect(X(TR - .5), 0, W - X(TR - .5), H); c.globalAlpha = 1;
    c.fillStyle = css(cv, '--mute'); c.font = '500 10px JetBrains Mono, monospace'; c.fillText('train', P, 14); c.fillText('hidden months', X(TR - .5) + 6, 14);
    c.strokeStyle = ink; c.lineWidth = 2; c.setLineDash([]); c.beginPath(); y.forEach((v, i) => i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v))); c.stroke();
    MODELS.forEach(m => { if (!show[m.k]) return; c.strokeStyle = css(cv, m.c); c.lineWidth = 2; c.setLineDash(m.dash || []); c.beginPath(); c.moveTo(X(TR - 1), Y(y[TR - 1])); preds[m.k].forEach((p, i) => c.lineTo(X(TR + i), Y(p))); c.stroke(); });
    c.setLineDash([]);
  }
  build();
})();

// a word list vs. sarcasm
(() => {
  const inp = $('#nlpIn');
  const LEX = { love: 2, great: 2, good: 1, fast: 1, clean: 1, elegant: 2, works: 1, smooth: 1, useful: 1, clear: 1, happy: 2, fun: 1, brilliant: 2, solid: 1, nice: 1, hate: -2, bad: -1.5, slow: -1, broken: -2, bug: -1.5, confusing: -1.5, crash: -2, awful: -2, painful: -1.5, wrong: -1.5, messy: -1, hallucinates: -2, ugly: -1 };
  const NEG = new Set(['not', 'never', 'no', 'isnt', 'wasnt', 'dont', 'cant']);
  const words = $('#nlpWords'), verdict = $('#nlpVerdict');
  const run = () => {
    const parts = inp.value.match(/[A-Za-z']+|[^A-Za-z']+/g) || [];
    let prev = '', total = 0, hits = 0, html = '';
    parts.forEach(p => {
      if (!/[A-Za-z]/.test(p)) { html += esc(p).replace(/ /g, '&nbsp;'); return; }
      const k = p.toLowerCase().replace(/'/g, ''); let v = LEX[k] || 0;
      if (v && NEG.has(prev)) v = -v;
      if (v) { total += v; hits++; html += `<span class="w ${v > 0 ? 'pos' : 'neg'}" style="--a:${Math.min(1, Math.abs(v) / 2)}">${esc(p)}<sup>${v > 0 ? '+' : ''}${v}</sup></span>`; } else html += esc(p);
      prev = k;
    });
    words.innerHTML = html;
    const label = !hits ? 'no opinion' : total > .4 ? 'positive' : total < -.4 ? 'negative' : 'mixed';
    verdict.textContent = /oh great|love that for me|yeah right/i.test(inp.value)
      ? `it scored this ${label} (${total.toFixed(1)}). A human hears the sarcasm. A word list can't.`
      : `${label} (${total.toFixed(1)}), with a few weighted words and one rule: "not" flips the next word. Try the sarcasm.`;
  };
  inp.addEventListener('input', run);
  $('#nlpSarcasm').onclick = () => { inp.value = 'Oh great, another bug. Love that for me.'; run(); };
  run();
})();

// the eval I haven't written yet
(() => {
  const out = $('#evalOut');
  $('#runEval').onclick = () => {
    out.innerHTML = out.textContent.split('\n').map((l, i) => `<span style="--i:${i}">${esc(l) || '&nbsp;'}</span>`).join('');
    out.hidden = false;
  };
})();

/* ───────────── closing: copy the address ───────────── */
(() => {
  const msg = $('#copied');
  $('#copy').onclick = async () => {
    try { await navigator.clipboard.writeText('vukkisajayanth@gmail.com'); msg.textContent = 'copied. go ahead, I read everything.'; }
    catch { msg.textContent = 'press Ctrl/Cmd+C on the address.'; }
    setTimeout(() => { msg.textContent = ''; }, 4000);
  };
})();

/* ───────────── command palette ( / ) ───────────── */
(() => {
  const pal = $('#palette'), inp = $('#palIn'), list = $('#palList');
  const KW = { top: 'home start hero', who: 'about me intro', journey: 'timeline evolution story history', work: 'projects kyr rag cv ez-learn', think: 'experiments lab', learning: 'skills now', remember: 'contact email hire' };
  const items = $$('[data-nav]').map((s, i) => ({ id: s.id, t: s.dataset.nav, n: pad(i), kw: `${KW[s.id] || ''} ${s.id}` }));
  let shown = items, sel = 0, opener = null;
  const render = () => { list.innerHTML = shown.map((it, i) => `<li role="option" data-id="${it.id}" aria-selected="${i === sel}"><span class="mono">${it.n}</span>${esc(it.t)}</li>`).join('') || '<li><span class="mono">—</span>nothing matches</li>'; };
  const open = () => { opener = document.activeElement; pal.hidden = false; inp.value = ''; shown = items; sel = 0; render(); inp.focus(); };
  const close = () => { pal.hidden = true; opener && opener.focus && opener.focus(); };
  const go = id => { close(); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
  inp.addEventListener('input', () => { const q = inp.value.toLowerCase().trim(); shown = items.filter(it => `${it.t} ${it.kw}`.toLowerCase().includes(q)); sel = 0; render(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === 'Enter' && shown[sel]) { e.preventDefault(); go(shown[sel].id); }
    else if (e.key === 'Tab') e.preventDefault();
  });
  list.addEventListener('click', e => { const li = e.target.closest('li[data-id]'); if (li) go(li.dataset.id); });
  pal.addEventListener('click', e => { if (e.target === pal) close(); });
  $('#paletteBtn').onclick = open;
  addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === 'Escape' && !pal.hidden) close();
    else if (pal.hidden && !typing && !e.metaKey && !e.ctrlKey && !e.altKey && e.key === '/') { e.preventDefault(); open(); }
    else if (pal.hidden && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
  });
})();

/* the tab notices when you leave */
(() => { const t = document.title; document.addEventListener('visibilitychange', () => { document.title = document.hidden ? 'still training… come back →' : t; }); })();

})();
