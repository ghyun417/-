"""글씨 없는 인스타그램 배경 이미지(1080×1350) SVG를 만듭니다.
레퍼런스: 광택 있는 3D 이모지 오브젝트(클립보드·돋보기·원형 차트) + 반짝이 장식.
실행: python3 make_bg.py  →  bg.html (렌더링은 render 스크립트로 PNG 저장)
"""
import math

W, H = 1080, 1350


def sector(cx, cy, r, a0, a1):
    """원 중심 (cx, cy)에서 각도 a0→a1(도, 0=위쪽, 시계 방향) 부채꼴 경로."""
    def pt(a):
        t = math.radians(a - 90)
        return cx + r * math.cos(t), cy + r * math.sin(t)
    x0, y0 = pt(a0)
    x1, y1 = pt(a1)
    large = 1 if a1 - a0 > 180 else 0
    return f"M{cx},{cy} L{x0:.1f},{y0:.1f} A{r},{r} 0 {large} 1 {x1:.1f},{y1:.1f} Z"


def pie3d(x, y, r, slices, depth=26, squash=0.62, tilt=-14):
    """눕혀 놓은 3D 원형 차트. slices = [(시작각, 끝각, 윗면색, 옆면색, 틈)]"""
    out = [f'<g transform="translate({x} {y}) rotate({tilt}) scale(1 {squash})">']
    # 옆면(두께): 같은 조각을 아래로 겹겹이 내려 어둡게
    for k in range(depth, 0, -2):
        for a0, a1, top, side, gap in slices:
            mid = math.radians((a0 + a1) / 2 - 90)
            ox, oy = gap * math.cos(mid), gap * math.sin(mid)
            out.append(f'<path d="{sector(ox, oy + k, r, a0, a1)}" fill="{side}"/>')
    for a0, a1, top, side, gap in slices:
        mid = math.radians((a0 + a1) / 2 - 90)
        ox, oy = gap * math.cos(mid), gap * math.sin(mid)
        out.append(f'<path d="{sector(ox, oy, r, a0, a1)}" fill="url(#{top})"/>')
    out.append(f'<ellipse cx="{-r*0.35:.0f}" cy="{-r*0.45:.0f}" rx="{r*0.45:.0f}" ry="{r*0.18:.0f}" fill="#fff" opacity="0.35" transform="rotate(-20)"/>')
    out.append('</g>')
    return "\n".join(out)


def donut3d(x, y, r, w, top_a, top_b, side_a, side_b, depth=22, squash=0.6, tilt=18, split=250):
    """눕혀 놓은 3D 도넛 차트(두 색)."""
    ri = r - w
    def ring(a0, a1, dy):
        def pt(rr, a):
            t = math.radians(a - 90)
            return rr * math.cos(t), rr * math.sin(t) + dy
        (x0, y0), (x1, y1) = pt(r, a0), pt(r, a1)
        (x2, y2), (x3, y3) = pt(ri, a1), pt(ri, a0)
        large = 1 if a1 - a0 > 180 else 0
        return (f"M{x0:.1f},{y0:.1f} A{r},{r} 0 {large} 1 {x1:.1f},{y1:.1f} "
                f"L{x2:.1f},{y2:.1f} A{ri},{ri} 0 {large} 0 {x3:.1f},{y3:.1f} Z")
    out = [f'<g transform="translate({x} {y}) rotate({tilt}) scale(1 {squash})">']
    for k in range(depth, 0, -2):
        out.append(f'<path d="{ring(0, split, k)}" fill="{side_a}"/>')
        out.append(f'<path d="{ring(split + 6, 354, k)}" fill="{side_b}"/>')
    out.append(f'<path d="{ring(0, split, 0)}" fill="url(#{top_a})"/>')
    out.append(f'<path d="{ring(split + 6, 354, 0)}" fill="url(#{top_b})"/>')
    out.append(f'<ellipse cx="{-r*0.4:.0f}" cy="{-r*0.62:.0f}" rx="{r*0.4:.0f}" ry="{r*0.12:.0f}" fill="#fff" opacity="0.4" transform="rotate(-25)"/>')
    out.append('</g>')
    return "\n".join(out)


def sparkle(x, y, s, op=1.0):
    p = f"M0,-{s} C{s*0.12},-{s*0.12} {s*0.12},-{s*0.12} {s},0 C{s*0.12},{s*0.12} {s*0.12},{s*0.12} 0,{s} C-{s*0.12},{s*0.12} -{s*0.12},{s*0.12} -{s},0 C-{s*0.12},-{s*0.12} -{s*0.12},-{s*0.12} 0,-{s} Z"
    return f'<path d="{p}" fill="#fff" opacity="{op}" transform="translate({x} {y})"/>'


def plus(x, y, s, op=0.9):
    return (f'<g transform="translate({x} {y})" opacity="{op}"><rect x="-{s/2}" y="-{s*0.11:.1f}" width="{s}" height="{s*0.22:.1f}" rx="{s*0.11:.1f}" fill="#fff"/>'
            f'<rect x="-{s*0.11:.1f}" y="-{s/2}" width="{s*0.22:.1f}" height="{s}" rx="{s*0.11:.1f}" fill="#fff"/></g>')


DEFS = """
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#b9ddff"/><stop offset="0.45" stop-color="#dcefff"/><stop offset="0.78" stop-color="#f3f9ff"/><stop offset="1" stop-color="#ffffff"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  <radialGradient id="dropShadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#2b5f99" stop-opacity="0.32"/><stop offset="1" stop-color="#2b5f99" stop-opacity="0"/></radialGradient>
  <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>

  <!-- 클립보드 -->
  <linearGradient id="board" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5aa2ff"/><stop offset="0.5" stop-color="#2d7cf0"/><stop offset="1" stop-color="#1a56c2"/></linearGradient>
  <linearGradient id="boardEdge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#174aa8"/><stop offset="1" stop-color="#0f3a8a"/></linearGradient>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9eff6"/></linearGradient>
  <linearGradient id="clip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6eaef"/><stop offset="0.5" stop-color="#a9b3bf"/><stop offset="1" stop-color="#6f7a87"/></linearGradient>

  <!-- 돋보기 -->
  <linearGradient id="ringRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a9a"/><stop offset="0.45" stop-color="#ff4f5c"/><stop offset="1" stop-color="#c92637"/></linearGradient>
  <radialGradient id="lens" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="0.5" stop-color="#cfe6ff" stop-opacity="0.75"/><stop offset="1" stop-color="#7fb4ef" stop-opacity="0.8"/></radialGradient>
  <linearGradient id="handle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff6b78"/><stop offset="1" stop-color="#b81e30"/></linearGradient>

  <!-- 차트 윗면 -->
  <linearGradient id="pBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fb0ff"/><stop offset="1" stop-color="#2a6fe0"/></linearGradient>
  <linearGradient id="pRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a8f"/><stop offset="1" stop-color="#e8414f"/></linearGradient>
  <linearGradient id="pYellow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#f6b81c"/></linearGradient>
  <linearGradient id="pGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fe0a6"/><stop offset="1" stop-color="#25a865"/></linearGradient>

  <!-- 자동차 -->
  <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9e9e"/><stop offset="0.4" stop-color="#ff5a66"/><stop offset="1" stop-color="#c8283b"/></linearGradient>
  <linearGradient id="carSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.22"/><stop offset="0.2" stop-color="#000" stop-opacity="0"/><stop offset="0.85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.2"/></linearGradient>
  <linearGradient id="carGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6fcff"/><stop offset="0.5" stop-color="#bfe2fa"/><stop offset="1" stop-color="#78afdc"/></linearGradient>
  <radialGradient id="tire" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#535c6a"/><stop offset="0.7" stop-color="#22272f"/><stop offset="1" stop-color="#0d1014"/></radialGradient>
  <radialGradient id="rim" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#d3dbe5"/><stop offset="1" stop-color="#8f9caa"/></radialGradient>

  <!-- 지도 핀 -->
  <linearGradient id="pin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fd3a4"/><stop offset="0.55" stop-color="#2fb36c"/><stop offset="1" stop-color="#1a8a4f"/></linearGradient>
</defs>
"""


def clipboard(x, y, rot=-6):
    return f"""
<g transform="translate({x} {y}) rotate({rot})">
  <ellipse cx="20" cy="430" rx="250" ry="34" fill="url(#dropShadow)"/>
  <rect x="-182" y="-238" width="364" height="476" rx="40" fill="url(#boardEdge)" transform="translate(14 14)"/>
  <rect x="-182" y="-238" width="364" height="476" rx="40" fill="url(#board)"/>
  <path d="M-150,-212 Q-60,-226 120,-214" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.4"/>
  <g transform="rotate(4)"><rect x="-140" y="-176" width="290" height="372" rx="16" fill="#dfe6ee"/></g>
  <g transform="rotate(2)"><rect x="-144" y="-180" width="290" height="372" rx="16" fill="#eef2f7"/></g>
  <rect x="-148" y="-186" width="296" height="378" rx="16" fill="url(#paper)"/>
  <g transform="translate(-108 -104)">
    {''.join(f'<rect x="0" y="{i*92}" width="44" height="44" rx="10" fill="#e8f1fd" stroke="#9cc3f2" stroke-width="3"/><path d="M10,{i*92+22} L20,{i*92+32} L36,{i*92+12}" stroke="#2d7cf0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="66" y="{i*92+8}" width="{150 - i*28}" height="12" rx="6" fill="#c7d6e8"/><rect x="66" y="{i*92+28}" width="{110 - i*12}" height="10" rx="5" fill="#dde6f1"/>' for i in range(3))}
  </g>
  <rect x="-70" y="-262" width="140" height="62" rx="18" fill="url(#clip)"/>
  <circle cx="0" cy="-246" r="12" fill="#5b6572"/>
  <rect x="-58" y="-256" width="116" height="10" rx="5" fill="#fff" opacity="0.6"/>
</g>"""


def magnifier(x, y, rot=-35, s=1.0):
    return f"""
<g transform="translate({x} {y}) rotate({rot}) scale({s})">
  <rect x="-22" y="88" width="44" height="150" rx="22" fill="url(#handle)"/>
  <rect x="-10" y="96" width="10" height="130" rx="5" fill="#fff" opacity="0.35"/>
  <circle r="104" fill="url(#ringRed)"/>
  <circle r="74" fill="url(#lens)"/>
  <path d="M-48,-30 A56,56 0 0 1 -10,-58" stroke="#fff" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.9"/>
  <path d="M-78,-58 A96,96 0 0 1 -30,-94" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.45"/>
</g>"""


def car(x, y, s=1.0):
    return f"""
<g transform="translate({x} {y}) scale({s})">
  <ellipse cx="0" cy="150" rx="300" ry="30" fill="url(#dropShadow)"/>
  <path d="M-262,54 Q-262,16 -222,8 L-144,-4 Q-98,-66 -20,-72 L72,-72 Q130,-69 170,-14 L230,-2 Q272,8 274,50 L274,78 Q274,102 248,102 L-236,102 Q-262,102 -262,78 Z" fill="url(#carBody)"/>
  <path d="M-262,54 Q-262,16 -222,8 L-144,-4 Q-98,-66 -20,-72 L72,-72 Q130,-69 170,-14 L230,-2 Q272,8 274,50 L274,78 Q274,102 248,102 L-236,102 Q-262,102 -262,78 Z" fill="url(#carSide)"/>
  <path d="M-114,-6 Q-80,-52 -20,-56 L22,-56 L22,-6 Z" fill="url(#carGlass)"/>
  <path d="M38,-56 L72,-56 Q118,-54 150,-6 L38,-6 Z" fill="url(#carGlass)"/>
  <path d="M-98,-12 Q-72,-42 -28,-46" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.85"/>
  <path d="M-226,20 Q-20,-2 240,14" stroke="#fff" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.38"/>
  <path d="M30,-2 L30,92" stroke="#a51d2e" stroke-width="3" opacity="0.45"/>
  <rect x="-22" y="22" width="34" height="9" rx="4.5" fill="#ffe3e3" opacity="0.9"/>
  <rect x="82" y="22" width="34" height="9" rx="4.5" fill="#ffe3e3" opacity="0.9"/>
  <rect x="242" y="24" width="28" height="20" rx="9" fill="#fff6c9"/>
  <rect x="-260" y="24" width="22" height="20" rx="8" fill="#ffd0d0"/>
  <rect x="-250" y="74" width="512" height="12" rx="6" fill="#8e1a28" opacity="0.3"/>
  <g transform="translate(-152 102)"><circle r="54" fill="url(#tire)"/><circle r="29" fill="url(#rim)"/><circle r="9" fill="#6d7a89"/><path d="M-20,-12 A24,24 0 0 1 4,-24" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.8"/></g>
  <g transform="translate(156 102)"><circle r="54" fill="url(#tire)"/><circle r="29" fill="url(#rim)"/><circle r="9" fill="#6d7a89"/><path d="M-20,-12 A24,24 0 0 1 4,-24" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.8"/></g>
</g>"""


def pin(x, y, s=1.0):
    return f"""
<g transform="translate({x} {y}) scale({s})">
  <ellipse cx="0" cy="118" rx="54" ry="12" fill="url(#dropShadow)"/>
  <path d="M0,-110 C-56,-110 -86,-68 -86,-26 C-86,34 0,110 0,110 C0,110 86,34 86,-26 C86,-68 56,-110 0,-110 Z" fill="url(#pin)"/>
  <circle cx="0" cy="-28" r="32" fill="#fff"/>
  <path d="M-52,-62 Q-34,-88 -4,-92" stroke="#fff" stroke-width="11" stroke-linecap="round" fill="none" opacity="0.55"/>
</g>"""


svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
{DEFS}
<rect width="{W}" height="{H}" fill="url(#bg)"/>
<circle cx="540" cy="720" r="460" fill="url(#glow)"/>
<circle cx="900" cy="180" r="260" fill="url(#glow)" opacity="0.6"/>
{''.join(sparkle(x, y, s, o) for x, y, s, o in [(170, 400, 34, 1), (930, 430, 26, 0.95), (120, 980, 22, 0.9), (960, 1010, 30, 1), (820, 330, 16, 0.8), (260, 300, 14, 0.7)])}
{''.join(plus(x, y, s) for x, y, s in [(110, 540, 30), (165, 590, 22), (965, 600, 28), (915, 650, 20), (240, 1080, 22)])}
{car(540, 860, 1.25)}
</svg>"""

html = f"""<!doctype html><html><head><meta charset="utf-8"><title>배경</title>
<style>html,body{{margin:0;background:#8a96a6}} #c1{{width:{W}px;height:{H}px}}</style></head>
<body><div id="c1">{svg}</div></body></html>"""

with open("bg.html", "w", encoding="utf-8") as f:
    f.write(html)
with open("survey-bg.svg", "w", encoding="utf-8") as f:
    f.write(svg)
print("ok")
