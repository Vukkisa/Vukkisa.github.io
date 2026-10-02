/* Jayanth Vukkisa — portfolio. Vanilla JS, no dependencies. */
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

/** Run `fn(visible)` whenever an element enters / leaves the viewport. */
function whenVisible(el, fn, opts = { threshold: .05 }) {
  new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting)), opts).observe(el);
}

/** Minimal Python-ish syntax highlighter. */
function highlight(src) {
  return esc(src).replace(
    /(#.*$)|("[^"\n]*"|'[^'\n]*')|\b(import|from|def|return|for|in|if|else|not|and|or|as|with|print|True|False|None|lambda)\b|\b(\d+(?:\.\d+)?)\b/gm,
    (m, c, s, k, n) => c ? `<span class="c">${c}</span>` : s ? `<span class="s">${s}</span>` : k ? `<span class="k">${k}</span>` : `<span class="n">${n}</span>`);
}
$$('pre[data-hl]').forEach(p => { p.innerHTML = highlight(p.textContent); });

/* ───────────── reveal on scroll ───────────── */
(() => {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => io.observe(el));
})();

$('#year').textContent = new Date().getFullYear();

/* ───────────── header: scroll = training run ───────────── */
(() => {
  const line = $('#lossLine'), txt = $('#lossText');
  const r = rng(11), N = 100, loss = [];
  for (let i = 0; i <= N; i++) loss.push(clamp(.06 + .88 * Math.exp(-i / 24) + (r() - .5) * .07 * Math.exp(-i / 60), .02, 1));
  const bar = $('.bar'), secs = $$('section');
  const update = () => {
    let tone = 'light';
    for (const s of secs) { if (s.getBoundingClientRect().top <= 40) tone = s.classList.contains('dark') ? 'dark' : s.classList.contains('hot') ? 'hot' : s.classList.contains('alt') ? 'alt' : 'light'; }
    if (bar.dataset.tone !== tone) bar.dataset.tone = tone;
    const max = document.documentElement.scrollHeight - innerHeight;
    const ep = Math.round(clamp(scrollY / Math.max(max, 1), 0, 1) * N);
    line.setAttribute('points', loss.slice(0, ep + 1).map((l, i) => `${(i / N * 120).toFixed(1)},${(26 - l * 24).toFixed(1)}`).join(' '));
    txt.textContent = `epoch ${ep} · loss ${loss[ep].toFixed(2)}`;
  };
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
})();

/* ───────────── hero: typed query + a model you can teach ───────────── */
(() => {
  const target = $('#typed'), res = $('#sqlres');
  const q = "SELECT * FROM jayanth WHERE obsession = 'machines';";
  if (reduced) { target.textContent = q; res.classList.add('on'); }
  else { let i = 0; const tick = () => { target.textContent = q.slice(0, ++i); if (i < q.length) setTimeout(tick, 26 + Math.random() * 30); else setTimeout(() => res.classList.add('on'), 250); }; setTimeout(tick, 500); }

  const cv = $('#teach'), out = $('#readout');
  let pts = [], deg = 1, w = [0, 0], epoch = 0, loss = null, running = false, visible = true, hover = null;
  const seed = () => { const r = rng(5); pts = Array.from({ length: 15 }, () => { const x = r() * 1.8 - .9; return { x, y: clamp(.55 * x - .1 + (r() - .5) * .45, -.95, .95) }; }); };
  const resetW = () => { w = Array(deg + 1).fill(0); epoch = 0; loss = null; };
  const mse = () => pts.reduce((s, p) => s + (pred(p.x) - p.y) ** 2, 0) / pts.length;
  const pred = x => { let y = 0; for (let k = 0; k <= deg; k++) y += w[k] * x ** k; return y; };
  const step = () => {
    const n = pts.length; if (!n) return;
    for (let s = 0; s < 6; s++) {
      const g = Array(w.length).fill(0);
      for (const p of pts) { const e = pred(p.x) - p.y; for (let k = 0; k <= deg; k++) g[k] += 2 * e * p.x ** k / n; }
      for (let k = 0; k <= deg; k++) w[k] -= .25 * g[k];
      epoch++;
    }
  };
  const P = 22;
  const st = canvas2d(cv, () => draw());
  const sx = x => P + (x + 1) / 2 * (st.w - 2 * P), sy = y => st.h - P - (y + 1) / 2 * (st.h - 2 * P);
  const eq = () => deg === 1 ? `y = ${w[1].toFixed(2)}x ${w[0] < 0 ? '−' : '+'} ${Math.abs(w[0]).toFixed(2)}` : `y = f(x)  [${w.length} parameters]`;

  function draw() {
    if (!st.w) return;
    const c = st.ctx, ink = css(cv, '--ink'), hot = css(cv, '--hot'), rule = css(cv, '--rule');
    c.clearRect(0, 0, st.w, st.h);
    c.strokeStyle = rule; c.lineWidth = 1;
    c.beginPath(); c.moveTo(P, sy(0)); c.lineTo(st.w - P, sy(0)); c.moveTo(sx(0), P); c.lineTo(sx(0), st.h - P); c.stroke();
    if (pts.length) {
      c.strokeStyle = hot; c.globalAlpha = .35;
      pts.forEach(p => { c.beginPath(); c.moveTo(sx(p.x), sy(p.y)); c.lineTo(sx(p.x), sy(pred(p.x))); c.stroke(); });
      c.globalAlpha = 1; c.lineWidth = 2.5; c.beginPath();
      for (let i = 0; i <= 90; i++) { const x = -1 + i / 45, y = clamp(pred(x), -1.6, 1.6); i ? c.lineTo(sx(x), sy(y)) : c.moveTo(sx(x), sy(y)); }
      c.stroke();
    }
    pts.forEach(p => { c.fillStyle = ink; c.beginPath(); c.arc(sx(p.x), sy(p.y), 4.5, 0, 7); c.fill(); });
    if (hover) { c.strokeStyle = hot; c.lineWidth = 1.5; c.beginPath(); c.arc(sx(hover.x), sy(hover.y), 9, 0, 7); c.stroke(); }
    out.textContent = `epoch ${pad(epoch, 4)} · loss ${loss == null ? '—' : loss.toFixed(4)} · ${pts.length ? eq() : 'no data. teach me something.'}`;
  }
  function frame() {
    if (!running) return;
    const before = loss; step(); loss = mse(); draw();
    if (!visible || (before != null && Math.abs(before - loss) < 1e-9)) { running = false; return; }
    requestAnimationFrame(frame);
  }
  const kick = () => {
    if (reduced) { for (let i = 0; i < 300; i++) step(); loss = mse(); draw(); return; }
    if (!running) { running = true; requestAnimationFrame(frame); }
  };
  const nearest = (e) => {
    const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = null, d = 14; pts.forEach(p => { const dd = Math.hypot(sx(p.x) - mx, sy(p.y) - my); if (dd < d) { d = dd; best = p; } });
    return { mx, my, best };
  };
  cv.addEventListener('pointerdown', e => {
    const { mx, my, best } = nearest(e);
    if (best) pts = pts.filter(p => p !== best);
    else pts.push({ x: clamp((mx - P) / (st.w - 2 * P) * 2 - 1, -1, 1), y: clamp(-((my - P) / (st.h - 2 * P) * 2 - 1), -1, 1) });
    kick();
  });
  cv.addEventListener('pointermove', e => { const h = nearest(e).best; if (h !== hover) { hover = h; draw(); } });
  cv.addEventListener('pointerleave', () => { hover = null; draw(); });
  const setDeg = d => { deg = d; $('#tLine').setAttribute('aria-pressed', d === 1); $('#tCurve').setAttribute('aria-pressed', d === 3); resetW(); kick(); };
  $('#tLine').onclick = () => setDeg(1);
  $('#tCurve').onclick = () => setDeg(3);
  $('#tReset').onclick = () => { seed(); resetW(); kick(); };
  $('#tClear').onclick = () => { pts = []; resetW(); draw(); };
  whenVisible(cv, v => { visible = v; if (v) kick(); });
  seed(); resetW(); kick();
})();

/* ───────────── short version ───────────── */
(() => {
  const human = $('#shortHuman'), resume = $('#shortResume'), note = $('#note');
  const mH = $('#mHuman'), mR = $('#mResume');
  const set = h => { human.hidden = !h; resume.hidden = h; note.hidden = !h; mH.setAttribute('aria-pressed', h); mR.setAttribute('aria-pressed', !h); };
  mH.onclick = () => set(true); mR.onclick = () => set(false);
  $$('.fn').forEach(b => b.addEventListener('click', () => {
    $$('.fn').forEach(o => o.setAttribute('aria-expanded', o === b));
    note.style.opacity = 0;
    setTimeout(() => { note.textContent = b.dataset.note; note.style.opacity = 1; }, 120);
  }));
})();

/* ───────────── evolution ───────────── */
(() => {
  const tabs = $$('#rail button'), stages = $$('.stage'), motifs = $$('.motif'), fill = $('#railFill'), big = $('#bigYr');
  const years = ['2022', '2023', '2024', '2025', '2026', 'next'];
  let cur = -1;
  function go(i, focus) {
    i = clamp(i, 0, tabs.length - 1);
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.classList.toggle('past', k < i); t.tabIndex = k === i ? 0 : -1; });
    stages.forEach((s, k) => { s.hidden = k !== i; if (k === i) { s.classList.remove('in-anim'); void s.offsetWidth; s.classList.add('in-anim'); } });
    motifs.forEach((m, k) => { m.classList.remove('on'); if (k === i) { void m.getBoundingClientRect(); m.classList.add('on'); } });
    fill.style.width = (i / (tabs.length - 1) * 100) + '%';
    big.textContent = years[i];
    $('#evoPrev').disabled = i === 0; $('#evoNext').disabled = i === tabs.length - 1;
    if (focus) tabs[i].focus({ preventScroll: true });
    const rail = $('#rail');
    if (cur !== -1 && rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: tabs[i].offsetLeft - (rail.clientWidth - tabs[i].offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
    cur = i;
  }
  tabs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  $('#rail').addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, true); }
  });
  $('#evoPrev').onclick = () => go(cur - 1);
  $('#evoNext').onclick = () => go(cur + 1);
  go(0);
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { go(0); io.disconnect(); } }, { threshold: .35 });
  io.observe($('.evo'));
})();

/* ───────────── project tabs ───────────── */
function selectProject(p) {
  $$('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.p === p));
  $$('.panel').forEach(el => { el.hidden = el.id !== 'p-' + p; });
  if (p === 'cv') window.dispatchEvent(new Event('resize'));
  if (p === 'kyr') window.dispatchEvent(new Event('kyr-shown'));
}
$$('.tabs button').forEach(b => b.addEventListener('click', () => selectProject(b.dataset.p)));
$$('[data-go]').forEach(a => a.addEventListener('click', () => selectProject(a.dataset.go)));

/* ───────────── steppers ───────────── */
const STEPPERS = {
  kyr: [
    ['PDFs', 'Official government documents: acts, rules, notifications. 400+ of them went in.', 'Some are clean text, some are scans, all of them are long.', '*.pdf   →   400+ files in'],
    ['Extraction', 'Pull the text out, page by page, keeping track of which document and page it came from.', 'Tables and multi-column layouts come out scrambled — and a scrambled rule is a wrong rule.', '129. Wearing of protec-\ntive head-gear.— Every\nperson driving…        Page 47'],
    ['Cleaning', 'Strip headers, footers, page numbers and broken hyphenation. Drop duplicates. Decide what stays.', 'Over-cleaning deletes the one line that mattered. Under-cleaning feeds noise to the model.', '129. Wearing of protective headgear. Every person driving or riding…'],
    ['Chunking', 'Split the text into passages big enough to carry meaning and small enough to embed.', 'A rule and its penalty land in different chunks, and retrieval only finds half the answer.', 'chunk = { text, source, page }'],
    ['Embeddings', 'nomic-embed-text, served locally through Ollama, turns every chunk into a vector. Similar meaning, nearby numbers.', '"Near" is only as good as the text you embedded. Garbage in, confidently-near garbage out.', 'embed("helmet rules")\n# [0.021, -0.118, 0.067, … 768 dims]'],
    ['Chroma', 'The vector database stores each embedding with its metadata: document, page, section.', 'Metadata you forget to store is a citation you can never show.', 'collection.add(ids=ids, embeddings=vecs, metadatas=meta)'],
    ['Retriever', 'The question is embedded the same way. Chroma returns the nearest chunks.', 'Close is not the same as relevant. Retrieval can be confidently wrong.', 'docs = retriever.invoke("Is a helmet compulsory?")'],
    ['LLM', 'A Groq-hosted LLM, wired up with LangChain LCEL, sees only the retrieved context and a strict instruction: answer from this, or say you can\'t.', 'Models love being helpful. The pull toward answering from memory is the real adversary.', 'chain = prompt | llm | StrOutputParser()\nanswer = chain.invoke({"context": docs, "question": q})'],
    ['Answer', 'A grounded answer with its sources — or a clean refusal when the documents don\'t support one.', 'A refusal is only a feature if it fires at the right time, so it has to be tested like one.', '"…protective headgear is required."  [source: page 47]\n"I can\'t find that in the documents I was given."']
  ],
  cv: [
    ['Source', 'A webcam, a video file or an RTSP stream: the same pipeline, three different doors.', 'RTSP buffers pile up and you end up analysing the past. Always work on the latest frame.', 'cap = cv2.VideoCapture(source)   # 0 | "clip.mp4" | "rtsp://…"'],
    ['Decode', 'OpenCV hands over frames as arrays of pixels.', 'Decoding and inference on one thread: the GPU waits for the CPU, and latency creeps up.', 'ok, frame = cap.read()'],
    ['Detect', 'YOLOv8 finds the people in each frame. CUDA is what makes it real-time rather than a slideshow.', 'Low light, occlusion and half-visible bodies all lower confidence.', 'res = model(frame, classes=[0], device="cuda")'],
    ['Zone test', 'Is the person standing inside the polygon? Zones can be redrawn on the fly.', 'Testing the box centre instead of the feet triggers alarms for people walking just outside.', 'inside = point_in_polygon(foot_point, zone)'],
    ['Event', 'Entering the zone raises one event, not two hundred.', 'Detections flicker. Without a debounce one visitor looks like a crowd.', 'if inside and not was_inside:\n    log_event(track_id, now)'],
    ['Evidence', 'A timestamped snapshot and clip are saved for each event.', 'Disks fill up. Evidence needs rotation, naming and a retention rule.', 'cv2.imwrite(f"events/{ts}.jpg", frame)']
  ],
  ez: [
    ['Student lands', 'A browser asks for the course catalogue.', 'Catalogue pages are where N+1 database queries hide.', 'GET /courses/'],
    ['URL router', 'Django\'s urls.py maps the path to a view.', 'Ambiguous patterns silently shadow each other.', 'path("courses/<slug:slug>/", views.course_detail)'],
    ['View', 'Checks the session, loads the course, decides what this student may see or do.', 'The permission check you forgot is the bug you ship.', '@login_required\ndef enroll(request, slug): …'],
    ['Database', 'The ORM writes a pending order. Courses, enrolments and payments are separate, related models.', 'Half-written state when something fails midway. Use transactions.', 'Order.objects.create(user=u, course=c, status="pending")'],
    ['Payment', 'The student pays through the gateway, and the gateway confirms back to the server.', 'Trusting the browser redirect instead of the server-side confirmation.', 'if verify_with_gateway(payment_id): order.status = "paid"'],
    ['Unlock', 'Confirmed payment activates the enrolment. The dashboard shows the course and starts tracking progress.', 'Idempotency: the same confirmation arriving twice must not enrol twice.', 'Enrollment.objects.get_or_create(user=u, course=c)']
  ]
};

$$('[data-stepper]').forEach(root => {
  const data = STEPPERS[root.dataset.stepper];
  root.innerHTML = `<ol class="steps">${data.map((s, i) => `<li><button type="button" class="step" data-i="${i}"><span class="si mono">${pad(i + 1)}</span><span class="st">${esc(s[0])}</span></button></li>`).join('')}</ol>
    <div class="detail" aria-live="polite"><p class="dk mono"></p><h4 class="dt"></h4><p class="dd"></p><p class="dr"><b>where it bites</b><span></span></p><pre class="code"></pre></div>
    <p class="step-ctl"><button type="button" class="pill play">▶ play the journey</button> <span class="fine mono">code samples are illustrative</span></p>`;
  const steps = $$('.step', root), d = $('.detail', root), play = $('.play', root);
  let cur = 0, timer = null;
  const show = i => {
    cur = i; const s = data[i];
    steps.forEach((b, k) => { b.classList.toggle('done', k < i); k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current'); });
    $('.dk', d).textContent = `step ${pad(i + 1)} / ${pad(data.length)}`;
    $('.dt', d).textContent = s[0]; $('.dd', d).textContent = s[1]; $('.dr span', d).textContent = s[2];
    $('.code', d).innerHTML = highlight(s[3]);
    d.classList.remove('swap'); void d.offsetWidth; d.classList.add('swap');
  };
  const stop = () => { clearInterval(timer); timer = null; play.textContent = '▶ play the journey'; };
  steps.forEach((b, i) => b.addEventListener('click', () => { stop(); show(i); }));
  play.onclick = () => {
    if (timer) return stop();
    play.textContent = '❚❚ pause'; if (cur >= data.length - 1) show(0);
    timer = setInterval(() => { if (cur >= data.length - 1) return stop(); show(cur + 1); }, 2200);
  };
  show(0);
});

/* ───────────── KnowYourRules: curation grid ───────────── */
(() => {
  const grid = $('#docs'), btn = $('#curate'); if (!grid) return;
  const r = rng(21);
  grid.innerHTML = Array.from({ length: 420 }, () => `<i class="d ${r() < .13 ? 'keep' : 'drop'}" style="--t:${(r() * .9).toFixed(2)}s"></i>`).join('');
  const run = () => { grid.classList.remove('cut'); void grid.offsetWidth; setTimeout(() => grid.classList.add('cut'), 400); };
  btn.onclick = run;
  let done = false;
  const go = () => { if (!done && $('#p-kyr') && !$('#p-kyr').hidden) { done = true; run(); } };
  whenVisible(grid, v => { if (v) go(); }, { threshold: .6 });
  addEventListener('kyr-shown', () => { done = false; });
})();

/* ───────────── KnowYourRules: a toy retriever that can say no ───────────── */
(() => {
  const form = $('#askForm'); if (!form) return;
  const CHUNKS = [
    ['Sec. 3', 'Driving licence. No person may drive a motor vehicle in a public place without a valid driving licence that authorises them to drive that class of vehicle.'],
    ['Sec. 112', 'Limits of speed. No person shall drive a motor vehicle at a speed exceeding the maximum, or below the minimum, speed limit fixed for that road, area or class of vehicle.'],
    ['Sec. 119', 'Traffic signs and signals. Every driver must obey mandatory traffic signs and signals, and follow directions given by a police officer controlling traffic.'],
    ['Sec. 129', 'Protective headgear. Every person driving or riding a motorcycle, and any pillion rider, must wear protective headgear (a helmet) of the prescribed standard. Sikhs wearing a turban are exempt.'],
    ['Sec. 184', 'Dangerous driving. Driving at a speed or in a manner that is dangerous to the public, considering the nature of the road and traffic, is an offence.'],
    ['Sec. 185', 'Driving under the influence. Driving a motor vehicle with alcohol above the permitted limit of 30 mg per 100 ml of blood is an offence.'],
    ['Sec. 194B', 'Seat belts. Driving without wearing a seat belt, or carrying passengers who are not wearing one, is penalised.']
  ].map(([s, text]) => ({ s, text, src: `Motor Vehicles Act, 1988 (as amended) — ${s}` }));
  const SYN = { helmet: 'headgear', helmets: 'headgear', drunk: 'alcohol', drinking: 'alcohol', beer: 'alcohol', liquor: 'alcohol', seatbelt: 'belt', licence: 'license', licences: 'license', licenses: 'license' };
  const STOP = new Set(('a an the is are was were be do does did i you we me my to of in on at for and or if it its this that what whats which who whom will can could should would have has had how when where why any than then there their about with from by as tonight today while need needed compulsory mandatory legal allowed rule rules law laws must').split(' '));
  const stem = w => { let b = (SYN[w] || w).replace(/(ing|ed|es|s)$/, ''); if (b.length < 4) b = SYN[w] || w; if (b.length > 4) b = b.replace(/e$/, ''); return b; };
  const toks = t => [...new Set((t.toLowerCase().replace(/['’]/g, '').match(/[a-z0-9]+/g) || []).filter(w => !STOP.has(w)).map(stem))];
  CHUNKS.forEach(c => c.set = new Set(toks(c.text)));
  const THRESH = .5, out = $('#askOut');

  function ask(q) {
    const qt = toks(q);
    if (!qt.length) { out.innerHTML = ''; return; }
    const scored = CHUNKS.map(c => ({ c, v: qt.filter(t => c.set.has(t)).length / qt.length })).sort((a, b) => b.v - a.v);
    const top = scored[0], ok = top.v >= THRESH;
    out.innerHTML = `<p class="thr mono">1 · embed question → [${qt.map(esc).join(', ')}] &nbsp; 2 · similarity to ${CHUNKS.length} chunks (line = threshold)</p>
      <ul class="hits">${scored.slice(0, 4).map((x, i) => `<li class="hit ${i === 0 && ok ? 'top' : ''}"><span class="mono">${esc(x.c.s)}</span><span class="hb"><i style="width:0" data-w="${Math.round(x.v * 100)}"></i></span><span class="mono">${Math.round(x.v * 100)}%</span></li>`).join('')}</ul>
      ${ok ? `<div class="verdict-box"><p class="vh">grounded answer</p><p>${esc(top.c.text)}</p><p class="src">source → ${esc(top.c.src)}</p></div>`
           : `<div class="verdict-box no"><p class="vh">refused</p><p>I couldn't find support for that in the documents I was given, so I won't guess.</p><p class="src">best match was ${Math.round(top.v * 100)}% — below the ${Math.round(THRESH * 100)}% threshold</p></div>`}`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.hb i', out).forEach(i => { i.style.width = i.dataset.w + '%'; })));
  }
  const input = $('#askQ');
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  $('#askChips').innerHTML = ['Do I have to wear a helmet?', 'What is the alcohol limit for drivers?', 'Is a seat belt required?', 'Who will win tonight\'s cricket match?', 'How do I bake a cake while driving?']
    .map(q => `<button type="button" class="chip">${esc(q)}</button>`).join('');
  $$('#askChips .chip').forEach(b => b.addEventListener('click', () => { input.value = b.textContent; ask(b.textContent); }));
})();

/* ───────────── computer vision: draw the zone ───────────── */
(() => {
  const cv = $('#zoneSim'); if (!cv) return;
  const SRC = ['webcam (0)', 'video file', 'rtsp://camera-01/stream'];
  let src = 0, visible = false, last = 0, snap = 0;
  const zone = [[.55, .3], [.93, .3], [.96, .92], [.5, .92]];
  const r = rng(3);
  const mk = id => ({ id, x: r(), y: .35 + r() * .6, tx: r(), ty: .35 + r() * .6, sp: 7e-5 + r() * 6e-5, inside: false });
  const people = [1, 2, 3, 4].map(mk);
  const log = $('#evLog');
  const inPoly = (x, y) => { let c = false; for (let i = 0, j = zone.length - 1; i < zone.length; j = i++) { const [xi, yi] = zone[i], [xj, yj] = zone[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const st = canvas2d(cv);
  const addLog = (p, entered) => {
    const t = new Date(), li = document.createElement('li'); if (entered) li.className = 'in';
    li.innerHTML = `<b>${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}</b> person #${p.id} ${entered ? `entered zone → snap_${pad(++snap, 4)}.jpg` : 'left zone'}`;
    log.prepend(li); while (log.children.length > 7) log.lastChild.remove();
  };

  function frame(now) {
    if (visible) requestAnimationFrame(frame); else return;
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
    // zone
    c.beginPath(); zone.forEach(([x, y], i) => i ? c.lineTo(x * W, y * H) : c.moveTo(x * W, y * H)); c.closePath();
    c.fillStyle = 'rgba(255,106,77,.13)'; c.fill();
    c.setLineDash([7, 6]); c.strokeStyle = '#ff6a4d'; c.lineWidth = 1.6; c.stroke(); c.setLineDash([]);
    zone.forEach(([x, y]) => { c.fillStyle = '#f0e9db'; c.beginPath(); c.arc(x * W, y * H, 6, 0, 7); c.fill(); c.strokeStyle = '#ff6a4d'; c.lineWidth = 2; c.stroke(); });
    // people, back to front
    [...people].sort((a, b) => a.y - b.y).forEach(p => {
      const fx = p.x * W, fy = p.y * H, bh = H * (.12 + .2 * p.y), bw = bh * .42, col = p.inside ? '#ff6a4d' : '#7fd49a';
      c.strokeStyle = col; c.fillStyle = col; c.lineWidth = p.inside ? 2.5 : 1.4;
      c.globalAlpha = .22; c.beginPath(); c.arc(fx, fy - bh * .8, bw * .2, 0, 7); c.fill(); c.fillRect(fx - bw * .27, fy - bh * .66, bw * .54, bh * .56); c.globalAlpha = 1;
      c.strokeRect(fx - bw / 2, fy - bh, bw, bh);
      c.font = '600 10px JetBrains Mono, monospace'; const label = p.inside ? `#${p.id} UNAUTHORIZED` : `person ${(.86 + (p.id * 37 % 13) / 100).toFixed(2)}`;
      const tw = c.measureText(label).width + 8; c.fillRect(fx - bw / 2, fy - bh - 15, tw, 15); c.fillStyle = '#0d0c09'; c.fillText(label, fx - bw / 2 + 4, fy - bh - 4);
    });
    c.fillStyle = 'rgba(240,233,219,.75)'; c.font = '500 11px JetBrains Mono, monospace';
    c.fillText(`SIMULATION · src: ${SRC[src]}`, 12, 20);
    c.fillStyle = '#ff6a4d'; c.fillText('● REC', W - 54, 20);
    c.fillStyle = 'rgba(255,255,255,.025)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1);
  }
  whenVisible(cv, v => { visible = v && cv.offsetParent !== null; if (visible) { last = performance.now(); requestAnimationFrame(frame); } });

  // dragging corners
  let drag = -1;
  const hit = e => { const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; return zone.findIndex(([zx, zy]) => Math.hypot(zx * b.width - x, zy * b.height - y) < 16); };
  cv.addEventListener('pointerdown', e => { drag = hit(e); if (drag > -1) { cv.setPointerCapture(e.pointerId); e.preventDefault(); } });
  cv.addEventListener('pointermove', e => {
    if (drag > -1) { const b = cv.getBoundingClientRect(); zone[drag] = [clamp((e.clientX - b.left) / b.width, .01, .99), clamp((e.clientY - b.top) / b.height, .22, .99)]; }
    else cv.style.cursor = hit(e) > -1 ? 'grab' : 'default';
  });
  const end = () => { drag = -1; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);

  $('#srcChips').innerHTML = SRC.map((s, i) => `<button type="button" class="chip" aria-pressed="${i === 0}">${esc(s)}</button>`).join('');
  $$('#srcChips .chip').forEach((b, i) => b.addEventListener('click', () => { src = i; $$('#srcChips .chip').forEach((o, k) => o.setAttribute('aria-pressed', k === i)); }));
  $('#addPerson').onclick = () => { if (people.length < 9) people.push(mk(people.length + 1)); };
})();

/* ───────────── notebook ───────────── */
(() => {
  const cells = $$('.cell'); if (!cells.length) return;
  let n = 0;
  const run = cell => new Promise(res => {
    const out = $('.cout', cell), pr = $('.prompt', cell); if (!out) return res();
    cell.classList.add('busy'); pr.textContent = 'In [*]:';
    setTimeout(() => {
      cell.classList.remove('busy'); pr.textContent = `In [${++n}]:`;
      if (!out.dataset.raw) out.dataset.raw = out.textContent;
      out.innerHTML = out.dataset.raw.split('\n').map((l, i) => `<span style="--i:${i}">${esc(l) || '&nbsp;'}</span>`).join('');
      out.hidden = false; res();
    }, reduced ? 0 : 450);
  });
  cells.forEach(c => $('.run', c).addEventListener('click', () => run(c)));
  $('#runAll').onclick = async () => { for (const c of cells) { await run(c); await new Promise(r => setTimeout(r, reduced ? 0 : 250)); } };
  $('#clearAll').onclick = () => { n = 0; cells.forEach(c => { $('.cout', c).hidden = true; $('.prompt', c).textContent = 'In [ ]:'; }); };
})();

/* ───────────── learning map ───────────── */
(() => {
  const svg = $('#mapSvg'); if (!svg) return;
  const RINGS = [
    { n: 'daily', r: 72, off: 12, items: [['SQL', 'Where I started, and still how I think: in sets.'], ['Python', 'My default for anything that isn\'t a query.'], ['PL/SQL', 'Procedures, cursors and a lot of defensive coding.'], ['Linux', 'Half my debugging happens in a shell.'], ['Git', 'Small commits, messages I can read later.']] },
    { n: 'working', r: 140, off: 40, items: [['Oracle', 'Years of real data-system work.'], ['Django', 'Ez-Learn runs on it.'], ['FastAPI', 'Serves KnowYourRules.'], ['pandas / NumPy', 'Daily bread for data work.'], ['scikit-learn', 'Classical ML, forecasting, recommenders.']] },
    { n: 'learning', r: 205, off: -8, items: [['RAG', 'Built one end to end. Still learning why they fail.'], ['LangChain LCEL', 'Comfortable composing chains. Wary of magic.'], ['Chroma', 'The vector store behind KnowYourRules.'], ['Ollama', 'Local models and local embeddings.'], ['YOLOv8 / OpenCV', 'Real-time detection at ~35 FPS.'], ['Deep learning', 'Concepts solid. Hands-on depth growing.'], ['NLP', 'Lexicons to embeddings, slowly.'], ['Docker', 'Packaging things so they run elsewhere.'], ['Cloud deployment', 'Render so far. Broader cloud next.']] },
    { n: 'frontier', r: 252, off: 30, items: [['AI agents', 'Loops, tools, budgets — and knowing when to stop.'], ['LLM evaluation', 'Currently my favourite unsolved problem.'], ['Multimodal AI', 'Models that see and read. Curious about the crossover with YOLO.'], ['Production AI', 'Logging, cost, latency, failure modes.']] }
  ];
  const C = 280, NS = 'http://www.w3.org/2000/svg';
  svg.setAttribute('viewBox', '-70 -10 700 580');
  let html = '';
  RINGS.forEach((g, ri) => { html += `<circle class="ring ${ri === 3 ? 'edge' : ''}" cx="${C}" cy="${C}" r="${g.r}"/>`; });
  html += `<circle class="core" cx="${C}" cy="${C}" r="5"/>`;
  RINGS.forEach((g, ri) => g.items.forEach(([name, note], i) => {
    const a = (g.off + i * 360 / g.items.length) * Math.PI / 180, x = C + g.r * Math.cos(a), y = C + g.r * Math.sin(a), right = Math.cos(a) >= -.05;
    html += `<g data-r="${ri}" data-n="${esc(name)}" data-note="${esc(note)}" tabindex="0" role="button" aria-label="${esc(name)} — ${g.n}"><circle class="hit" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16"/><circle class="pt" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/><text x="${(x + (right ? 12 : -12)).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${right ? 'start' : 'end'}">${esc(name)}</text></g>`;
  }));
  svg.innerHTML = html;
  const ring = $('#mapRing'), name = $('#mapName'), note = $('#mapNote');
  const show = g => { $$('g', svg).forEach(o => o.classList.toggle('on', o === g)); ring.textContent = RINGS[g.dataset.r].n; name.textContent = g.dataset.n; note.textContent = g.dataset.note; };
  $$('g', svg).forEach(g => ['mouseenter', 'focus', 'click'].forEach(ev => g.addEventListener(ev, () => show(g))));
})();

/* ───────────── experiments ───────────── */
// 01 · forecast shootout
(() => {
  const cv = $('#fc'); if (!cv) return;
  const MODELS = [
    { k: 'naive', n: 'naive', c: '--mute', dash: [3, 4] },
    { k: 'snaive', n: 'seasonal-naive', c: '--c4' },
    { k: 'trend', n: 'linear trend', c: '--c3' },
    { k: 'ts', n: 'trend + season', c: '--c1' }
  ];
  const show = { naive: true, snaive: true, trend: true, ts: true };
  let seed = 7, y = [], preds = {}, mae = {};
  const TR = 36, N = 48;
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
    $('#fcChips').innerHTML = MODELS.map(m => `<button type="button" class="chip" data-k="${m.k}" aria-pressed="${show[m.k]}" style="--cc:var(${m.c})"><i></i>${m.n} · ${mae[m.k].toFixed(1)}</button>`).join('') + '<button type="button" class="pill" id="fcRoll">↻ re-roll noise</button>';
    $$('#fcChips .chip').forEach(b => b.onclick = () => { show[b.dataset.k] = !show[b.dataset.k]; b.setAttribute('aria-pressed', show[b.dataset.k]); draw(); });
    $('#fcRoll').onclick = () => { seed = (seed * 31 + 17) % 9973; build(); };
  }
  function verdict() {
    const s = MODELS.slice().sort((a, b) => mae[a.k] - mae[b.k]);
    $('#fcVerdict').textContent = `MAE on the 12 hidden months → winner: ${s[0].n} (${mae[s[0].k].toFixed(1)}), last: ${s[3].n} (${mae[s[3].k].toFixed(1)}). ` + (s[0].k === 'ts' ? 'The clever one won — this time.' : 'A simpler model won. This is why you check.');
  }
  const st = canvas2d(cv, () => draw());
  function draw() {
    const { ctx: c, w: W, h: H } = st; if (!W || !y.length) return;
    const ink = css(cv, '--ink'), rule = css(cv, '--rule'), P = 14;
    const all = [...y, ...Object.values(preds).flat()], lo = Math.min(...all) - 5, hi = Math.max(...all) + 5;
    const X = i => P + i / (N - 1) * (W - 2 * P), Y = v => H - P - (v - lo) / (hi - lo) * (H - 2 * P);
    c.clearRect(0, 0, W, H);
    c.fillStyle = rule; c.globalAlpha = .35; c.fillRect(X(TR - .5), 0, W - X(TR - .5), H); c.globalAlpha = 1;
    c.fillStyle = css(cv, '--mute'); c.font = '500 10px JetBrains Mono, monospace'; c.fillText('train', P, 14); c.fillText('hidden', X(TR - .5) + 6, 14);
    c.strokeStyle = ink; c.lineWidth = 2; c.setLineDash([]); c.beginPath(); y.forEach((v, i) => i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v))); c.stroke();
    MODELS.forEach(m => {
      if (!show[m.k]) return;
      c.strokeStyle = css(cv, m.c); c.lineWidth = 2; c.setLineDash(m.dash || []); c.beginPath(); c.moveTo(X(TR - 1), Y(y[TR - 1]));
      preds[m.k].forEach((p, i) => c.lineTo(X(TR + i), Y(p))); c.stroke();
    });
    c.setLineDash([]);
  }
  build();
})();

// 02 · taste engine
(() => {
  const pick = $('#recPick'); if (!pick) return;
  const TAGS = ['sci-fi', 'cerebral', 'warm', 'music', 'tech', 'animated', 'dark', 'funny'];
  const FILMS = [
    ['Dune', [1, .6, 0, 0, 0, 0, .6, 0]], ['Interstellar', [1, .9, .4, .2, .3, 0, .2, 0]], ['Inception', [.8, 1, 0, 0, .3, 0, .4, 0]],
    ['Amélie', [0, .2, 1, .3, 0, 0, 0, .7]], ['Paddington 2', [0, 0, 1, 0, 0, .3, 0, 1]], ['Whiplash', [0, .5, 0, 1, 0, 0, .7, 0]],
    ['The Social Network', [0, .6, 0, 0, 1, 0, .3, .2]], ['Spirited Away', [.3, .3, .8, .2, 0, 1, .2, .2]], ['Blade Runner 2049', [1, .8, 0, .2, .5, 0, .8, 0]], ['Grand Budapest Hotel', [0, .2, .6, .2, 0, 0, 0, 1]]
  ].map(([n, v]) => ({ n, v }));
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0), norm = a => Math.sqrt(dot(a, a)) || 1;
  const cos = (a, b) => dot(a, b) / (norm(a) * norm(b));
  let liked = [1];
  const out = $('#recOut');
  pick.innerHTML = FILMS.map((f, i) => `<button type="button" class="chip" data-i="${i}">${esc(f.n)}</button>`).join('');
  const render = () => {
    $$('.chip', pick).forEach(b => b.setAttribute('aria-pressed', liked.includes(+b.dataset.i)));
    if (!liked.length) { out.innerHTML = '<li class="empty">Pick something you like.</li>'; return; }
    const prof = TAGS.map((_, k) => liked.reduce((s, i) => s + FILMS[i].v[k], 0));
    const recs = FILMS.map((f, i) => ({ f, i, s: cos(prof, f.v) })).filter(x => !liked.includes(x.i)).sort((a, b) => b.s - a.s).slice(0, 3);
    out.innerHTML = recs.map(({ f, s }) => {
      const why = liked.map(i => ({ i, s: cos(FILMS[i].v, f.v) })).sort((a, b) => b.s - a.s)[0].i;
      const shared = TAGS.map((t, k) => ({ t, w: f.v[k] * FILMS[why].v[k] })).filter(x => x.w > 0).sort((a, b) => b.w - a.w).slice(0, 2).map(x => x.t).join(' + ');
      return `<li><b>${esc(f.n)}</b><span class="mono">${Math.round(s * 100)}% match</span><small>because you liked ${esc(FILMS[why].n)}${shared ? ` · shared: ${shared}` : ''}</small></li>`;
    }).join('');
  };
  pick.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return; const i = +b.dataset.i;
    liked = liked.includes(i) ? liked.filter(x => x !== i) : [...liked, i].slice(-3); render();
  });
  render();
})();

// 03 · which words moved the needle
(() => {
  const inp = $('#nlpIn'); if (!inp) return;
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
      if (v) { total += v; hits++; html += `<span class="w ${v > 0 ? 'pos' : 'neg'}" style="--a:${Math.min(1, Math.abs(v) / 2)}" title="weight ${v}">${esc(p)}<sup>${v > 0 ? '+' : ''}${v}</sup></span>`; }
      else html += esc(p);
      prev = k;
    });
    words.innerHTML = html;
    const label = !hits ? 'no opinion (none of my 30 words showed up)' : total > .4 ? 'positive' : total < -.4 ? 'negative' : 'mixed / unsure';
    verdict.textContent = `score ${total.toFixed(1)} → ${label}` + (/oh great|love that for me|yeah right/i.test(inp.value) ? '  ·  wrong! a human can hear the sarcasm. the lexicon can\'t.' : '');
  };
  inp.addEventListener('input', run);
  $('#nlpSarcasm').onclick = () => { inp.value = 'Oh great, another bug. Love that for me.'; run(); };
  run();
})();

// 04 · pixel brain
(() => {
  const cv = $('#pix'); if (!cv) return;
  const COLS = 5, ROWS = 7;
  // 5x7 templates, one string per row
  const T = [
    ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'], ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'], ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
    ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'], ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'], ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
    ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'], ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..']
  ].map(rows => rows.join('').split('').map(ch => ch === '#' ? 1 : 0));
  let grid = Array(COLS * ROWS).fill(0), paint = 1, down = false;
  const st = canvas2d(cv, () => draw());
  const guess = $('#pixGuess'), bars = $('#pixBars');
  function draw() {
    const { ctx: c, w: W, h: H } = st; if (!W) return;
    const cw = W / COLS, ch = H / ROWS, ink = css(cv, '--ink'), rule = css(cv, '--rule');
    c.clearRect(0, 0, W, H);
    grid.forEach((v, i) => { const x = i % COLS, y = i / COLS | 0; if (v) { c.fillStyle = ink; c.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2); } });
    c.strokeStyle = rule; c.lineWidth = 1; c.beginPath();
    for (let x = 1; x < COLS; x++) { c.moveTo(x * cw, 0); c.lineTo(x * cw, H); } for (let y = 1; y < ROWS; y++) { c.moveTo(0, y * ch); c.lineTo(W, y * ch); } c.stroke();
  }
  function classify() {
    const on = grid.reduce((a, b) => a + b, 0);
    if (!on) { guess.textContent = '?'; bars.innerHTML = '<li><span></span><i></i><b>draw a digit</b></li>'; return; }
    const sc = T.map((t, d) => { let both = 0, either = 0; t.forEach((v, i) => { if (v && grid[i]) both++; if (v || grid[i]) either++; }); return { d, j: both / either }; });
    const ex = sc.map(s => Math.exp(8 * s.j)), Z = ex.reduce((a, b) => a + b, 0);
    const ranked = sc.map((s, i) => ({ ...s, p: ex[i] / Z })).sort((a, b) => b.p - a.p).slice(0, 3);
    guess.textContent = ranked[0].d;
    bars.innerHTML = ranked.map(r => `<li><span>${r.d}</span><i><em style="width:${Math.round(r.p * 100)}%"></em></i><b>${Math.round(r.p * 100)}%</b></li>`).join('');
  }
  const cellAt = e => { const b = cv.getBoundingClientRect(); return clamp(Math.floor((e.clientX - b.left) / b.width * COLS), 0, COLS - 1) + clamp(Math.floor((e.clientY - b.top) / b.height * ROWS), 0, ROWS - 1) * COLS; };
  const apply = e => { const i = cellAt(e); if (grid[i] !== paint) { grid[i] = paint; draw(); classify(); } };
  cv.addEventListener('pointerdown', e => { down = true; cv.setPointerCapture(e.pointerId); paint = grid[cellAt(e)] ? 0 : 1; apply(e); });
  cv.addEventListener('pointermove', e => { if (down) apply(e); });
  ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { down = false; }));
  $('#pixClear').onclick = () => { grid.fill(0); draw(); classify(); };
  $('#pixNoisy').onclick = () => { grid = T[7].slice(); [3, 12, 27].forEach(i => { grid[i] ^= 1; }); draw(); classify(); };
  grid = T[3].slice(); draw(); classify();
})();

// 05 · agent loop
(() => {
  const chips = $('#agChips'); if (!chips) return;
  const GOALS = [
    { g: 'How many rows are in the orders table — and is that over 1,000?', steps: [
      ['thought', 'I need a row count. I have a sql tool.'], ['action', 'sql("SELECT COUNT(*) FROM orders")'], ['observation', '[(1284,)]'],
      ['thought', 'Now compare it with 1,000.'], ['action', 'calculator("1284 > 1000")'], ['observation', 'True'], ['final', '1,284 rows — yes, over 1,000. Query shown above.']] },
    { g: 'Email this report to my manager.', steps: [
      ['thought', 'The goal is to send an email. What tools do I have? sql, search_docs, calculator.'], ['thought', 'None of them can send email. Pretending would be worse than saying so.'],
      ['refuse', 'I can\'t send email with the tools I\'ve been given. I can draft the message for you to send.']] }
  ];
  const trace = $('#agTrace'), CLS = { thought: 't-thought', action: 't-action', observation: 't-obs', final: 't-final', refuse: 't-refuse' };
  let timer = null;
  chips.innerHTML = GOALS.map((g, i) => `<button type="button" class="chip" aria-pressed="false">${esc(g.g)}</button>`).join('');
  $$('.chip', chips).forEach((b, gi) => b.addEventListener('click', () => {
    clearTimeout(timer); $$('.chip', chips).forEach((o, k) => o.setAttribute('aria-pressed', k === gi)); trace.innerHTML = '';
    let i = 0; const next = () => {
      const [k, t] = GOALS[gi].steps[i++]; const li = document.createElement('li'); li.className = CLS[k]; li.innerHTML = `<b>${k}</b>${esc(t)}`; trace.append(li);
      if (i < GOALS[gi].steps.length) timer = setTimeout(next, reduced ? 0 : 750);
    }; next();
  }));
  $$('.chip', chips)[0].click();
})();

/* ───────────── toolbox ───────────── */
(() => {
  const chain = $('#chain'); if (!chain) return;
  const STAGES = [
    ['SQL', [['SQL', 'Joins, windows, set-based thinking.'], ['Oracle', 'Production data work, not just tutorials.'], ['PL/SQL', 'Procedures and scripts that had to be correct.'], ['Linux & shell', 'Where jobs run and where things get debugged.'], ['Git', 'Small commits, readable history.']]],
    ['Data', [['Python', 'The glue for everything else.'], ['pandas', 'Cleaning and shaping tables.'], ['NumPy', 'The arrays under everything.'], ['Visualisation', 'If I can\'t plot it I don\'t understand it yet.'], ['Django', 'The backend that serves the data (Ez-Learn).']]],
    ['ML', [['scikit-learn', 'Baselines first, always.'], ['Feature engineering', 'Where most of the gain actually is.'], ['Time-series forecasting', 'Trend, season, and honest error bars.'], ['Recommenders', 'Similarity, and explaining why.'], ['Evaluation metrics', 'MAE, precision, recall — choosing the one that matters.']]],
    ['Deep learning', [['Neural networks', 'Concepts solid; depth growing.'], ['YOLOv8', 'Real-time person detection.'], ['OpenCV', 'Frames in, decisions out.'], ['CUDA', 'The difference between a demo and 35 FPS.'], ['NLP', 'Text as numbers.']]],
    ['LLMs', [['Prompting', 'Instructions as an interface.'], ['Groq API', 'Fast hosted inference.'], ['Ollama', 'Local models and embeddings.'], ['LangChain LCEL', 'Composable chains.']]],
    ['RAG', [['Embeddings', 'nomic-embed-text, locally.'], ['Chroma', 'Vector storage with metadata.'], ['Chunking', 'The most underrated hyperparameter.'], ['Retrieval', 'Where most RAG bugs live.'], ['FastAPI', 'Putting it behind an endpoint.']]],
    ['Agents', [['Tool use', 'Giving models hands, carefully.'], ['Agent loops', 'Thought, action, observation.'], ['LLM evaluation', 'The thing I\'m building next.'], ['Docker', 'Same behaviour everywhere.'], ['Cloud deployment', 'Render today; more to come.']]]
  ];
  const tools = $('#tools'), noteBox = $('#toolNote');
  chain.innerHTML = STAGES.map((s, i) => `<button type="button" role="tab" class="cnode" data-i="${i}"><span class="mono">${pad(i + 1)}</span>${esc(s[0])}</button>${i < STAGES.length - 1 ? '<span class="carrow" aria-hidden="true">→</span>' : ''}`).join('');
  const nodes = $$('.cnode', chain);
  function go(i) {
    nodes.forEach((n, k) => { n.setAttribute('aria-selected', k === i); n.classList.toggle('past', k < i); });
    tools.innerHTML = STAGES.slice(0, i + 1).flatMap((s, k) => s[1].map(([n, note], j) => `<li><button type="button" class="tool ${k === i ? 'new' : ''}" data-n="${esc(n)}" data-note="${esc(note)}" data-s="${esc(s[0])}" style="animation-delay:${k === i ? j * 50 : 0}ms">${esc(n)}</button></li>`)).join('');
  }
  const note = b => { noteBox.innerHTML = `<p class="mono dim">from the “${b.dataset.s}” stage</p><h3>${b.dataset.n}</h3><p>${b.dataset.note}</p>`; };
  tools.addEventListener('mouseover', e => { const b = e.target.closest('.tool'); if (b) note(b); });
  tools.addEventListener('focusin', e => { const b = e.target.closest('.tool'); if (b) note(b); });
  tools.addEventListener('click', e => { const b = e.target.closest('.tool'); if (b) note(b); });
  nodes.forEach((n, i) => n.addEventListener('click', () => go(i)));
  go(STAGES.length - 1);
})();

/* ───────────── contact: compose an INSERT ───────────── */
(() => {
  const f = $('#cForm'); if (!f) return;
  const name = $('#cName'), mail = $('#cMail'), msg = $('#cMsg'), prev = $('#cPrev'), out = $('#cMsgOut');
  const lit = v => v.trim() ? `<span class="s">'${esc(v.trim().replace(/'/g, "''"))}'</span>` : '<span class="s">\'…\'</span>';
  const render = () => { prev.innerHTML = `<span class="k">INSERT INTO</span> conversations (name, reply_to, message)\n<span class="k">VALUES</span> (${lit(name.value)},\n        ${lit(mail.value)},\n        ${lit(msg.value)});`; };
  [name, mail, msg].forEach(el => el.addEventListener('input', render)); render();
  f.addEventListener('submit', e => {
    e.preventDefault();
    const who = name.value.trim() || 'a curious visitor';
    const body = `Hi Jayanth,\n\n${msg.value.trim() || 'I came across your portfolio and wanted to say hello.'}\n\n— ${who}${mail.value.trim() ? ` (${mail.value.trim()})` : ''}`;
    location.href = `mailto:vukkisajayanth@gmail.com?subject=${encodeURIComponent('Hello from ' + who)}&body=${encodeURIComponent(body)}`;
    out.textContent = '1 row inserted — your mail app should open. If not, write to vukkisajayanth@gmail.com.';
  });
})();

/* ───────────── command palette ( / ) ───────────── */
(() => {
  const pal = $('#palette'), inp = $('#palIn'), list = $('#palList');
  const KW = { top: 'home hero start', short: 'about intro summary', evolution: 'journey story', builds: 'projects work', deep: 'projects kyr rag cv yolo ez-learn', obsession: 'notebook rag agents', learning: 'skills map', lab: 'experiments playground', toolbox: 'tools stack tech', timeline: 'git log history', contact: 'email hire insert' };
  const items = $$('[data-nav]').map((s, i) => ({ id: s.id, t: s.dataset.nav, n: pad(i), kw: (KW[s.id] || '') + ' ' + s.id }));
  let shown = items, sel = 0, opener = null;
  const render = () => { list.innerHTML = shown.map((it, i) => `<li role="option" data-id="${it.id}" aria-selected="${i === sel}"><span class="mono">${it.n}</span>${esc(it.t)}</li>`).join('') || '<li><span class="mono">—</span>no rows returned</li>'; };
  const open = () => { opener = document.activeElement; pal.hidden = false; inp.value = ''; shown = items; sel = 0; render(); inp.focus(); };
  const close = () => { pal.hidden = true; opener && opener.focus && opener.focus(); };
  const go = id => { close(); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
  inp.addEventListener('input', () => { const q = inp.value.toLowerCase().trim(); shown = items.filter(it => (it.t + ' ' + it.kw).toLowerCase().includes(q)); sel = 0; render(); });
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

/* ───────────── small delight ───────────── */
(() => {
  const title = document.title;
  document.addEventListener('visibilitychange', () => { document.title = document.hidden ? 'still training… come back →' : title; });
})();

})();
