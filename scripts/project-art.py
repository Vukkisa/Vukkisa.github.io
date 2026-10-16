"""Four project illustrations from one shared art direction (1200x900, 4:3).

Usage: python3 scripts/project-art.py app/public/images/projects
All four share one palette, texture, stroke weights and a single cobalt accent; edit P / WARM to restyle
the set. Writes light versions (name.svg) and dark versions (name-dark.svg) from the same drawings.
"""
import math, random, sys
OUT = sys.argv[1]
W, H = 1200, 900

# ---- shared art direction -------------------------------------------------------------------
P = dict(bg='#f4f4f1', paper='#fbfbf9', ink='#2a2a30', g1='#e8e8e3', g2='#dadad4', g3='#c7c7c0', g4='#9c9c95',
         acc='#2340ff', acc_soft='#dde2ff', shadow='#141428', shadow_op=1)
WARM = dict(bg='#f6f1e8', paper='#fffaf2', g1='#efe6d8', g2='#e5d9c7', g3='#d3c4ae', g4='#a8977f')
LIGHT, LIGHT_WARM = dict(P), dict(WARM)
DARK = dict(bg='#101115', paper='#191a1f', ink='#e9e8e4', g1='#1f2026', g2='#2b2d34', g3='#3b3e47', g4='#80838d',
            acc='#8e9cff', acc_soft='#232a52', shadow='#000000', shadow_op=4)
DARK_WARM = dict(bg='#15130f', paper='#1e1b16', g1='#26221c', g2='#342e26', g3='#473f34', g4='#8f816c')
GRAIN_RGB = '0'   # grain colour channel: 0 = dark specks (light theme), 1 = light specks (dark theme)

def defs(bg):
    return f'''<defs>
  <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1" fill="{P['ink']}" fill-opacity=".08"/></pattern>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 {GRAIN_RGB}  0 0 0 0 {GRAIN_RGB}  0 0 0 0 {GRAIN_RGB}  0 0 0 .045 0"/>
  </filter>
</defs>
<rect width="{W}" height="{H}" fill="{bg}"/>
<rect width="{W}" height="{H}" fill="url(#dots)"/>'''

GRAIN = f'<rect width="{W}" height="{H}" filter="url(#grain)"/>'

def card(x, y, w, h, fill, stroke, r=10, sw=1.5, shadow=True, extra=''):
    s = f'<rect x="{x+8:.1f}" y="{y+10:.1f}" width="{w}" height="{h}" rx="{r}" fill="{P["shadow"]}" fill-opacity="{.06 * P["shadow_op"]:.2f}"/>' if shadow else ''
    return s + f'<rect x="{x:.1f}" y="{y:.1f}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'

def bar(x, y, w, fill, h=6):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h}" rx="{h/2}" fill="{fill}"/>'

def svg(body, bg=None):
    bg = bg or P['bg']   # read at call time: P is swapped between the light and dark passes
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{defs(bg)}{body}{GRAIN}</svg>'

# ---- 1. KnowYourRules: documents -> retrieved passages -> one grounded answer ----------------
def kyr():
    rnd = random.Random(3); o = []
    # document stack (left), fanned
    sx, sy, sw_, sh = 150, 250, 300, 400
    for i, rot in enumerate([-5, -2.5, 0]):
        dx, dy = i * 18, -i * 16
        cx, cy = sx + dx + sw_ / 2, sy + dy + sh / 2
        o.append(f'<g transform="rotate({rot} {cx} {cy})">' + card(sx + dx, sy + dy, sw_, sh, P['paper'], P['g3']) )
        if i == 2:
            rows = [(sy + dy + 44 + k * 27) for k in range(12)]
            picked = {2, 6, 9}
            ends = []
            for k, ry in enumerate(rows):
                w = sw_ * (0.55 + rnd.random() * 0.3) if k % 4 else sw_ * 0.4
                o.append(bar(sx + dx + 30, ry, w, P['acc'] if k in picked else P['g2'], 7 if k in picked else 6))
                if k in picked: ends.append((sx + dx + 30 + w, ry + 3.5))
        o.append('</g>')
    # chunk tiles (middle)
    tx, ty = 560, 215
    tiles = []
    for k in range(7):
        y = ty + k * 66
        sel = k in (1, 3, 5)
        o.append(card(tx, y, 110, 46, P['paper'], P['acc'] if sel else P['g3'], r=8, sw=2 if sel else 1.5, shadow=sel))
        o.append(bar(tx + 16, y + 14, 70, P['acc_soft'] if sel else P['g2']))
        o.append(bar(tx + 16, y + 27, 48, P['acc_soft'] if sel else P['g1']))
        if sel: tiles.append(y + 23)
    # flows: passages -> chunks
    for (x0, py), ty_ in zip(ends, tiles):
        o.append(f'<path d="M{x0} {py} C {x0+90} {py}, {tx-90} {ty_}, {tx} {ty_}" fill="none" stroke="{P["acc"]}" stroke-width="1.6" stroke-opacity=".75"/>')
        o.append(f'<circle cx="{x0}" cy="{py}" r="3.5" fill="{P["acc"]}"/>')
    # answer card (right) fed by the selected chunks
    ax, ay, aw, ah = 790, 335, 260, 230
    for ty_ in tiles:
        o.append(f'<path d="M{tx+110} {ty_} C {tx+190} {ty_}, {ax-80} {ay+ah/2}, {ax} {ay+ah/2}" fill="none" stroke="{P["acc"]}" stroke-width="1.6" stroke-opacity=".75"/>')
    o.append(card(ax, ay, aw, ah, P['paper'], P['g4'], r=12))
    for k, w in enumerate([190, 170, 200, 120, 160]):
        o.append(bar(ax + 30, ay + 40 + k * 32, w, P['g2']))
    for k in (0, 2, 4):  # source markers at the end of answer lines
        o.append(f'<rect x="{ax+30+[190,170,200,120,160][k]+10}" y="{ay+38+k*32}" width="10" height="10" rx="2" fill="none" stroke="{P["acc"]}" stroke-width="1.6"/>')
    # grounding: a dashed line from the answer back to its source document
    o.append(f'<path d="M{ax+aw/2} {ay} C {ax+aw/2} 120, {sx+180} 120, {sx+180} {sy-40}" fill="none" stroke="{P["g4"]}" stroke-width="1.3" stroke-dasharray="4 7"/>')
    return svg(''.join(o))

# ---- 2. AI Surveillance: an architectural scene under geometric analysis ---------------------
def surv():
    o = ['<g transform="translate(600 450) scale(.86) translate(-600 -450)">']; vpx, vpy = 600, 300; hz = 400; bot = 780
    def floor_y(t): return hz + (bot - hz) * t
    # back wall + colonnade
    o.append(f'<rect x="150" y="190" width="900" height="{hz-190}" fill="{P["g1"]}" fill-opacity=".7"/>')
    o.append(f'<rect x="150" y="190" width="900" height="26" fill="{P["g2"]}"/>')
    for k in range(7):
        x = 205 + k * 130
        o.append(f'<rect x="{x}" y="216" width="40" height="{hz-216}" fill="{P["paper"]}" stroke="{P["g3"]}" stroke-width="1.5"/>')
        o.append(f'<rect x="{x+40}" y="216" width="10" height="{hz-216}" fill="{P["g2"]}"/>')
    # side planes for depth
    o.append(f'<polygon points="150,190 150,{hz} 95,{bot+20} 95,150" fill="{P["g2"]}" fill-opacity=".75"/>')
    o.append(f'<polygon points="1050,190 1050,{hz} 1105,{bot+20} 1105,150" fill="{P["g1"]}"/>')
    # floor + perspective grid
    o.append(f'<clipPath id="floor"><polygon points="150,{hz} 1050,{hz} 1105,{bot+20} 95,{bot+20}"/></clipPath>')
    o.append(f'<polygon points="150,{hz} 1050,{hz} 1105,{bot+20} 95,{bot+20}" fill="{P["paper"]}"/>')
    o.append('<g clip-path="url(#floor)">')
    for k in range(-8, 9):
        bx = 600 + k * 75
        t0 = (hz - vpy) / (bot + 20 - vpy)
        x0 = vpx + (bx - vpx) * t0
        o.append(f'<line x1="{x0:.1f}" y1="{hz}" x2="{bx}" y2="{bot+20}" stroke="{P["g2"]}" stroke-width="1"/>')
    for k in range(1, 9):
        t = (k / 9) ** 1.6
        y = hz + (bot + 20 - hz) * t
        o.append(f'<line x1="95" y1="{y:.1f}" x2="1105" y2="{y:.1f}" stroke="{P["g2"]}" stroke-width="1"/>')
    o.append('</g>')
    # restricted zone on the floor
    zone = [(520, 545), (790, 528), (870, 668), (548, 700)]
    pts = ' '.join(f'{x},{y}' for x, y in zone)
    o.append(f'<polygon points="{pts}" fill="{P["acc_soft"]}" fill-opacity=".7" stroke="{P["acc"]}" stroke-width="2" stroke-linejoin="round"/>')
    for x, y in zone: o.append(f'<rect x="{x-4}" y="{y-4}" width="8" height="8" fill="{P["paper"]}" stroke="{P["acc"]}" stroke-width="1.6"/>')
    # abstract figures (no features), scaled by depth, each with a detection box and a feet point
    def figure(x, foot_y, s, inside):
        h, w = 118 * s, 38 * s
        top = foot_y - h
        col = P['acc'] if inside else P['ink']
        g = f'<ellipse cx="{x}" cy="{foot_y}" rx="{w*0.55:.1f}" ry="{5*s:.1f}" fill="{P["shadow"]}" fill-opacity="{.08 * P["shadow_op"]:.2f}"/>'
        g += f'<rect x="{x-w/2:.1f}" y="{top+30*s:.1f}" width="{w:.1f}" height="{h-30*s:.1f}" rx="{w/2:.1f}" fill="{P["g4"]}"/>'
        g += f'<circle cx="{x}" cy="{top+14*s:.1f}" r="{13*s:.1f}" fill="{P["g4"]}"/>'
        bx, by, bw, bh = x - w / 2 - 12 * s, top - 8 * s, w + 24 * s, h + 14 * s
        g += f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bw:.1f}" height="{bh:.1f}" fill="none" stroke="{col}" stroke-width="{1.6 if inside else 1.2}" stroke-opacity="{1 if inside else .55}"/>'
        g += f'<circle cx="{x}" cy="{foot_y}" r="{5*s:.1f}" fill="{P["acc"] if inside else P["paper"]}" stroke="{col}" stroke-width="1.6"/>'
        if inside: g += f'<circle cx="{x}" cy="{foot_y}" r="{12*s:.1f}" fill="none" stroke="{P["acc"]}" stroke-width="1.2" stroke-opacity=".6"/>'
        return g
    o.append(figure(330, 590, 0.95, False))
    o.append(figure(905, 520, 0.8, False))
    o.append(figure(690, 640, 1.08, True))
    o.append('</g>')
    # analytical frame: viewfinder corners
    for cx, cy, dx, dy in [(130, 130, 1, 1), (1070, 130, -1, 1), (130, 770, 1, -1), (1070, 770, -1, -1)]:
        o.append(f'<path d="M{cx} {cy+36*dy} V{cy} H{cx+36*dx}" fill="none" stroke="{P["ink"]}" stroke-width="2" stroke-opacity=".7"/>')
    return svg(''.join(o))

# ---- 3. Railway speech recognition: speech pulled out of a noisy acoustic field --------------
def speech():
    rnd = random.Random(11); o = []
    vpx, vpy, bot = 600, 520, 830
    # track: two rails converging + sleepers
    o.append(f'<polygon points="{vpx-6},{vpy} {vpx+6},{vpy} 900,{bot} 300,{bot}" fill="{P["g1"]}"/>')
    for k in range(1, 12):
        t = (k / 12) ** 1.7; y = vpy + (bot - vpy) * t; half = 300 * t + 6
        o.append(f'<rect x="{vpx-half*1.15:.1f}" y="{y-3*t-2:.1f}" width="{half*2.3:.1f}" height="{4+10*t:.1f}" rx="2" fill="{P["g2"]}"/>')
    for side in (-1, 1):
        o.append(f'<line x1="{vpx+side*5}" y1="{vpy}" x2="{vpx+side*230}" y2="{bot}" stroke="{P["g4"]}" stroke-width="3"/>')
    # fade the track into the ground near the horizon
    o.append(f'<rect x="250" y="{vpy-4}" width="700" height="60" fill="{P["bg"]}" fill-opacity=".55"/>')
    cy = 330
    # ambient layers: broad low-frequency hum
    for k, (amp, per, op) in enumerate([(46, 420, .5), (30, 260, .45), (18, 150, .4)]):
        d = 'M' + ' L'.join(f'{x},{cy + amp*math.sin((x+k*70)/per*2*math.pi):.1f}' for x in range(150, 1051, 6))
        o.append(f'<path d="{d}" fill="none" stroke="{P["g3"]}" stroke-width="1.2" stroke-opacity="{op}"/>')
    # noise: dense amplitude bars
    for i, x in enumerate(range(152, 1050, 6)):
        h = 14 + rnd.random() ** 1.6 * 120
        o.append(f'<rect x="{x}" y="{cy-h/2:.1f}" width="2" height="{h:.1f}" rx="1" fill="{P["g3"]}" fill-opacity=".75"/>')
    # speech: three voiced segments separated by silences, drawn as one clean signal
    segs = [(250, 430), (520, 700), (800, 960)]
    def env(x):
        for a, b in segs:
            if a <= x <= b: return math.sin((x - a) / (b - a) * math.pi) ** 0.8
        return 0.0
    pts = []
    for x in range(160, 1041, 2):
        y = cy + 92 * env(x) * (0.6 * math.sin(x / 9.0) + 0.4 * math.sin(x / 4.3 + 1.2))
        pts.append(f'{x},{y:.1f}')
    o.append(f'<path d="M{" L".join(pts)}" fill="none" stroke="{P["acc"]}" stroke-width="2.4" stroke-linejoin="round"/>')
    # segment brackets under each voiced span
    for a, b in segs:
        y = cy + 132
        o.append(f'<path d="M{a} {y-8} V{y} H{b} V{y-8}" fill="none" stroke="{P["ink"]}" stroke-width="1.4" stroke-opacity=".6"/>')
    return svg(''.join(o))

# ---- 4. Ez-Learn: modular learning material, rising step by step ----------------------------
def ezlearn():
    o = []; Q = {**P, **WARM}
    # soft base plane
    o.append(f'<rect x="150" y="700" width="900" height="16" rx="8" fill="{Q["g2"]}"/>')
    steps = 5
    tiles = []
    for i in range(steps):
        w, h = 150, 120 + i * 62
        x, y = 175 + i * 172, 700 - h
        # back page offset (a stack of pages), then the front module
        o.append(card(x + 12, y - 12, w, h, Q['g1'], Q['g3'], r=12, shadow=False))
        o.append(card(x, y, w, h, Q['paper'], Q['g3'], r=12))
        for k in range(min(3 + i, 6)):
            o.append(bar(x + 22, y + 30 + k * 24, (w - 44) * (0.9 if k % 2 == 0 else 0.62), Q['g2']))
        tiles.append((x + w / 2, y))
    # progression path: rises across the tops of the modules
    path = 'M' + ' L'.join(f'{cx:.1f},{ty-34:.1f}' for cx, ty in tiles)
    o.append(f'<path d="{path}" fill="none" stroke="{P["acc"]}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>')
    for i, (cx, ty) in enumerate(tiles):
        last = i == steps - 1
        if last: continue
        o.append(f'<circle cx="{cx:.1f}" cy="{ty-34:.1f}" r="7" fill="{P["acc"] if i < 3 else Q["paper"]}" stroke="{P["acc"]}" stroke-width="2"/>')
    # completion: an abstract seal above the last module
    cx, ty = tiles[-1]; sy = ty - 64
    o.append(f'<polygon points="{cx-14},{sy+20} {cx-24},{sy+62} {cx-8},{sy+52} {cx},{sy+66} {cx+2},{sy+24}" fill="{P["acc"]}" fill-opacity=".85"/>')
    o.append(f'<polygon points="{cx+14},{sy+20} {cx+24},{sy+62} {cx+8},{sy+52} {cx},{sy+66} {cx-2},{sy+24}" fill="{P["acc"]}" fill-opacity=".65"/>')
    o.append(f'<circle cx="{cx:.1f}" cy="{sy:.1f}" r="34" fill="{P["acc_soft"]}" stroke="{P["acc"]}" stroke-width="2.2"/>')
    o.append(f'<circle cx="{cx:.1f}" cy="{sy:.1f}" r="22" fill="none" stroke="{P["acc"]}" stroke-width="1.4" stroke-dasharray="3 4"/>')
    return svg(''.join(o), bg=WARM['bg'])

for suffix, base, warm, grain in [('', LIGHT, LIGHT_WARM, '0'), ('-dark', DARK, DARK_WARM, '1')]:
    P.clear(); P.update(base); WARM.clear(); WARM.update(warm); GRAIN_RGB = grain
    GRAIN = f'<rect width="{W}" height="{H}" filter="url(#grain)"/>'
    for name, fn in [('knowyourrules', kyr), ('ai-surveillance', surv), ('railway-speech', speech), ('ez-learn', ezlearn)]:
        open(f'{OUT}/{name}{suffix}.svg', 'w').write(fn())
        print('wrote', name + suffix)
