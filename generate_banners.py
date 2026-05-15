"""Generate the 4 Silver Klíma banners as 1560×312 PNGs.

Two flavours:
  * Zöld Település (leaf, trees)  — green CSR banners. Headline: "1 klíma = 1 fa".
  * Általános gépészet (rings, contour) — dark slate banners, stacked services
    (Klíma. Hőszivattyú. Légtechnika. Épületgépészet.) + silverklima.hu CTA.

Re-run after editing TEXT / COLORS below to refresh assets/banner-*.png.
"""
from PIL import Image, ImageDraw, ImageFont
import math, os, random

W, H = 1560, 312
OUT_DIR = os.path.join(os.path.dirname(__file__), 'assets')

# ============================================================================
# Copy
# ============================================================================

# --- Zöld Település banners (leaf, trees) ---
EYEBROW  = "✦  ELINDULT — ZÖLD TELEPÜLÉS PROGRAM"
HEADLINE = "1 klíma = 1 fa"
CTA      = "zoldtelepules.hu"

# --- Általános gépészet banners (rings, contour) ---
# Four services stacked vertically. Each tuple: (text, color_key, italic).
GENERAL_LINES = [
    ('Klíma.',          'white',     False),
    ('Hőszivattyú.',    'teal',      False),
    ('Légtechnika.',    'light',     False),
    ('Épületgépészet.', 'med',       True),
]
GENERAL_CTA = "silverklima.hu"

# ============================================================================
# Palette
# ============================================================================

# Zöld Település (warm green gradient)
BG_TOP        = (5, 46, 22)       # #052e16  greenInk
BG_BOT        = (15, 70, 38)
GREEN         = (34, 197, 94)
GREEN_MID     = (74, 222, 128)
GREEN_SOFT    = (134, 239, 172)
GREEN_DEEP    = (21, 128, 61)
GREEN_DARK    = (20, 83, 45)
WHITE         = (255, 255, 255)
EYEBROW_COL   = GREEN_MID
CTA_COL       = (200, 220, 210)

# Általános gépészet (dark slate)
DARK_TOP      = (22, 26, 32)      # #161A20
DARK_BOT      = (12, 15, 19)      # darker bottom
TEAL          = (123, 203, 211)   # #7BCBD3 — inspired by the source artwork
LIGHT_GRAY    = (176, 182, 188)   # #B0B6BC
MED_GRAY      = (118, 125, 132)   # #767D84
PIPE_TEAL     = (123, 203, 211)
PIPE_MID      = (90, 158, 168)
PIPE_DEEP     = (52, 90, 100)

GENERAL_COLOR_MAP = {
    'white': WHITE,
    'teal':  TEAL,
    'light': LIGHT_GRAY,
    'med':   MED_GRAY,
}

# ============================================================================
# Fonts (macOS system)
# ============================================================================

HELV  = "/System/Library/Fonts/Helvetica.ttc"
MENLO = "/System/Library/Fonts/Menlo.ttc"

def f_sans(size, weight='bold'):
    # 0=Regular, 1=Bold, 2=Oblique, 3=Bold Oblique, 4=Light
    idx = {'regular': 0, 'bold': 1, 'italic': 2, 'bold_italic': 3, 'light': 4}[weight]
    return ImageFont.truetype(HELV, size, index=idx)

def f_mono(size, weight='bold'):
    idx = {'regular': 0, 'bold': 1}[weight]
    return ImageFont.truetype(MENLO, size, index=idx)

# ============================================================================
# Helpers
# ============================================================================

def vertical_gradient(img, top, bot):
    base = Image.new('RGB', (1, H), 0)
    pix = base.load()
    for y in range(H):
        t = y / (H - 1)
        pix[0, y] = (
            int(top[0] + (bot[0] - top[0]) * t),
            int(top[1] + (bot[1] - top[1]) * t),
            int(top[2] + (bot[2] - top[2]) * t),
        )
    img.paste(base.resize((W, H)))

def draw_tracked(draw, xy, text, font, fill, tracking_em=0.0):
    x, y = xy
    extra = int(font.size * tracking_em)
    for ch in text:
        draw.text((x, y), ch, fill=fill, font=font)
        bbox = font.getbbox(ch)
        x += (bbox[2] - bbox[0]) + extra

def text_width_tracked(text, font, tracking_em=0.0):
    extra = int(font.size * tracking_em)
    total = 0
    for ch in text:
        bbox = font.getbbox(ch)
        total += (bbox[2] - bbox[0]) + extra
    return total - extra

def draw_arrow(draw, x, y, length, color, weight=3):
    """Vector right-arrow (avoids missing-glyph issues in system fonts)."""
    draw.line([(x, y), (x + length, y)], fill=color, width=weight)
    head = 12
    draw.line([(x + length, y), (x + length - head, y - head)], fill=color, width=weight)
    draw.line([(x + length, y), (x + length - head, y + head)], fill=color, width=weight)

# ============================================================================
# Right-side visual marks
# ============================================================================

def draw_leaf(draw):
    """Bold mint leaf + pulse dot."""
    cx, cy = 1360, H // 2
    leaf_w, leaf_h = 200, 290
    leaf = Image.new('RGBA', (leaf_w, leaf_h), (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(leaf)
    pts = []
    steps = 80
    for i in range(steps + 1):
        t = i / steps
        w = math.sin(math.pi * t) ** 0.85 * (leaf_w / 2)
        pts.append((leaf_w / 2 + w, t * leaf_h))
    for i in range(steps, -1, -1):
        t = i / steps
        w = math.sin(math.pi * t) ** 0.85 * (leaf_w / 2)
        pts.append((leaf_w / 2 - w, t * leaf_h))
    ldraw.polygon(pts, fill=GREEN)
    ldraw.line([(leaf_w * 0.5, 6), (leaf_w * 0.5, leaf_h - 6)], fill=BG_TOP, width=3)
    for t in (0.22, 0.40, 0.58, 0.76):
        ya = t * leaf_h
        ldraw.line([(leaf_w * 0.5, ya),
                    (leaf_w * 0.78, ya + (leaf_h * 0.5 - ya) * 0.35),
                    (leaf_w * 0.95, leaf_h * 0.5)], fill=BG_TOP, width=2)
        ldraw.line([(leaf_w * 0.5, leaf_h - ya),
                    (leaf_w * 0.22, leaf_h - ya - (leaf_h * 0.5 - ya) * 0.35),
                    (leaf_w * 0.05, leaf_h * 0.5)], fill=BG_TOP, width=2)
    leaf = leaf.rotate(-14, resample=Image.BICUBIC, expand=True)
    draw._image.paste(leaf, (cx - leaf.width // 2, cy - leaf.height // 2), leaf)
    px, py = 1120, int(H * 0.32)
    r = 22
    draw.ellipse([px - r, py - r, px + r, py + r], outline=GREEN_SOFT, width=3)
    draw.ellipse([px - 7, py - 7, px + 7, py + 7], fill=GREEN_SOFT)


def draw_trees(draw):
    horizon = int(H * 0.62)
    for x in range(740, W - 30, 14):
        draw.line([(x, horizon), (x + 6, horizon)], fill=GREEN_DEEP, width=2)
    random.seed(2)
    x = 760
    while x < W - 60:
        h = random.choice([60, 80, 100, 120, 140, 95])
        r = random.choice([18, 22, 26, 28, 22, 20])
        col = random.choice([GREEN, GREEN, GREEN_SOFT, GREEN_DEEP, GREEN_MID])
        draw.line([(x, horizon), (x, horizon - h)], fill=GREEN_DEEP, width=3)
        draw.ellipse([x - r, horizon - h - r, x + r, horizon - h + r], fill=col)
        x += random.randint(45, 70)


def draw_pipes_schematic(draw):
    """Modern multi-level pipe network: two stacked horizontal runs, curved
    elbows, a pump, two pressure gauges, a gate valve, flow arrows and dotted
    technical-measurement lines. Used by the 'rings' slot."""
    x0, x1 = 870, W - 80
    pipe_w_main = 12
    pipe_w_acc  = 7

    y_top = 92                       # upper run
    y_bot = H - 92                   # lower run

    def pipe(p1, p2, color=PIPE_TEAL, w=pipe_w_main):
        """Outlined pipe: dark rim + teal core."""
        draw.line([p1, p2], fill=PIPE_DEEP, width=w + 6)
        draw.line([p1, p2], fill=color,     width=w)

    def arc(cx, cy, r, ang0, ang1, color=PIPE_TEAL, w=pipe_w_main):
        """A rounded elbow drawn as an arc (with rim)."""
        # bbox of full circle
        bbox = [cx - r, cy - r, cx + r, cy + r]
        draw.arc(bbox, start=ang0, end=ang1, fill=PIPE_DEEP, width=w + 6)
        draw.arc(bbox, start=ang0, end=ang1, fill=color,     width=w)

    R = 26   # elbow radius

    # ----- Upper run: straight, with a rounded elbow down on the right -----
    pipe((x0, y_top), (x1 - 220 - R, y_top))
    arc(x1 - 220 - R, y_top + R, R, 270, 360)
    pipe((x1 - 220, y_top + R), (x1 - 220, y_bot - R))
    arc(x1 - 220 - R, y_bot - R, R, 0, 90)
    pipe((x1 - 220 - R, y_bot), (x1, y_bot))

    # ----- Lower run: separate auxiliary pipe coming from below-left -----
    pipe((x0, y_bot), (x1 - 220 - 2 * R - 90, y_bot), w=pipe_w_acc)

    # ----- Vertical riser connecting the two runs (middle-left) -----
    rx = x0 + 220
    pipe((rx, y_top + 6), (rx, y_bot - 6), w=pipe_w_acc)

    # T-joints
    def tee(x, y, w=pipe_w_main + 8):
        draw.ellipse([x - w/2, y - w/2, x + w/2, y + w/2], fill=PIPE_DEEP)
        draw.ellipse([x - w/2 + 4, y - w/2 + 4, x + w/2 - 4, y + w/2 - 4], fill=PIPE_TEAL)
    tee(rx, y_top)
    tee(rx, y_bot, w=pipe_w_acc + 8)

    # ----- Pump on the upper run (circular body with curved internal arrows) -----
    px, py = x0 + 380, y_top
    pr = 36
    # Body
    draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=DARK_TOP, outline=PIPE_TEAL, width=5)
    draw.ellipse([px - pr + 12, py - pr + 12, px + pr - 12, py + pr - 12],
                 outline=PIPE_TEAL, width=3)
    # Internal swept arrow suggesting rotation
    for ang_start in (30, 150, 270):
        a0 = ang_start
        a1 = ang_start + 80
        draw.arc([px - pr + 7, py - pr + 7, px + pr - 7, py + pr - 7],
                 start=a0, end=a1, fill=TEAL, width=3)
        # arrowhead at end of each sweep
        rad = math.radians(a1)
        hx = px + math.cos(rad) * (pr - 12)
        hy = py + math.sin(rad) * (pr - 12)
        # short tick perpendicular for arrow-feel
        tx = math.cos(math.radians(a1 + 90))
        ty = math.sin(math.radians(a1 + 90))
        draw.line([(hx, hy), (hx + tx * 6, hy + ty * 6)], fill=TEAL, width=3)

    # ----- Pressure gauges -----
    def gauge(gx, gy, needle_deg=20):
        r = 32
        # short connecting stem to nearest pipe
        # body
        draw.ellipse([gx - r, gy - r, gx + r, gy + r], fill=DARK_TOP, outline=PIPE_TEAL, width=3)
        for a in range(-110, 111, 22):
            rad = math.radians(a - 90)
            draw.line([(gx + math.cos(rad) * (r - 3), gy + math.sin(rad) * (r - 3)),
                       (gx + math.cos(rad) * (r - 11), gy + math.sin(rad) * (r - 11))],
                       fill=LIGHT_GRAY, width=2)
        rad = math.radians(needle_deg - 90)
        draw.line([(gx, gy), (gx + math.cos(rad) * (r - 8), gy + math.sin(rad) * (r - 8))],
                  fill=TEAL, width=3)
        draw.ellipse([gx - 5, gy - 5, gx + 5, gy + 5], fill=TEAL)

    # Gauge 1: above-pump stem
    g1x, g1y = px + 110, y_top - 70
    draw.line([(g1x, y_top - pipe_w_main // 2), (g1x, g1y + 22)], fill=PIPE_DEEP, width=10)
    draw.line([(g1x, y_top - pipe_w_main // 2), (g1x, g1y + 22)], fill=PIPE_TEAL, width=4)
    gauge(g1x, g1y, needle_deg=35)

    # Gauge 2: floating top-right corner — different angle, smaller
    g2x, g2y = x1 - 60, y_top - 56
    draw.line([(g2x, y_top - pipe_w_main // 2), (g2x, g2y + 22)], fill=PIPE_DEEP, width=10)
    draw.line([(g2x, y_top - pipe_w_main // 2), (g2x, g2y + 22)], fill=PIPE_TEAL, width=4)
    gauge(g2x, g2y, needle_deg=-25)

    # ----- Gate valve on the lower pipe -----
    vx, vy = x0 + 560, y_bot
    # body sits on the pipe
    draw.rectangle([vx - 26, vy - 18, vx + 26, vy + 18], fill=PIPE_DEEP, outline=PIPE_TEAL, width=3)
    draw.line([(vx, vy - 18), (vx, vy - 40)], fill=PIPE_TEAL, width=3)
    draw.ellipse([vx - 14, vy - 50, vx + 14, vy - 28], outline=PIPE_TEAL, width=3)
    # cross inside handwheel
    draw.line([(vx - 12, vy - 39), (vx + 12, vy - 39)], fill=PIPE_TEAL, width=2)
    draw.line([(vx, vy - 49), (vx, vy - 29)], fill=PIPE_TEAL, width=2)

    # ----- Flow arrows along upper pipe -----
    for ax in (x0 + 140, x0 + 760, x0 + 580):
        # avoid drawing on top of the pump body
        if abs(ax - px) < pr + 10:
            continue
        draw.polygon([(ax - 9, y_top - 6), (ax - 9, y_top + 6), (ax + 5, y_top)], fill=DARK_TOP)
        draw.polygon([(ax - 7, y_top - 4), (ax - 7, y_top + 4), (ax + 4, y_top)], fill=WHITE)

    # ----- Dotted measurement line just under the upper pipe (technical feel) -----
    for mx in range(x0, x1 - 230, 14):
        draw.line([(mx, y_top + 38), (mx + 6, y_top + 38)], fill=PIPE_DEEP, width=2)
    # tick marks at ends
    draw.line([(x0, y_top + 32), (x0, y_top + 44)], fill=PIPE_DEEP, width=2)
    draw.line([(x1 - 240, y_top + 32), (x1 - 240, y_top + 44)], fill=PIPE_DEEP, width=2)


def draw_airflow(draw):
    """Modern air-flow visualization: a wall vent on the left emitting a band
    of curved streamlines drifting toward the right. Used by 'contour' slot."""
    # ---- Vent on the left ----
    vx0, vy0 = 880, H // 2 - 90
    vx1, vy1 = vx0 + 80, vy0 + 180
    # outer body
    draw.rounded_rectangle([vx0, vy0, vx1, vy1], radius=10,
                            fill=DARK_TOP, outline=PIPE_TEAL, width=4)
    # horizontal louver slats
    slat_count = 6
    inner_top = vy0 + 16
    inner_bot = vy1 - 16
    step = (inner_bot - inner_top) / slat_count
    for i in range(slat_count + 1):
        y = inner_top + i * step
        draw.line([(vx0 + 12, y), (vx1 - 12, y)], fill=PIPE_TEAL, width=3)
    # small status dot
    draw.ellipse([vx1 - 22, vy1 - 22, vx1 - 12, vy1 - 12], fill=TEAL)

    # ---- Airflow streamlines emanating from the vent ----
    # Each streamline is a cubic-ish curve sampled at many points.
    flow_origin_x = vx1 + 2
    end_x = W - 60
    # Vertical band of streamlines, slightly varying amplitude & phase
    lines = []
    for i in range(11):
        # vertical start y across the vent face
        sy = inner_top + 6 + i * ((inner_bot - inner_top - 12) / 10)
        # end y drifts: streams fan out very slightly
        drift = (i - 5) * 18
        ey = sy + drift
        # control: amplitude & phase of a gentle sine ripple
        amp   = 14 + (i % 3) * 5
        phase = i * 0.42
        lines.append((sy, ey, amp, phase))

    for idx, (sy, ey, amp, phase) in enumerate(lines):
        pts = []
        for t in [k / 80 for k in range(81)]:
            x = flow_origin_x + (end_x - flow_origin_x) * t
            base_y = sy + (ey - sy) * t
            # ripple grows then fades for a "puff" feel
            envelope = math.sin(math.pi * t) ** 1.2
            ripple = math.sin(t * math.pi * 2.6 + phase) * amp * envelope
            pts.append((x, base_y + ripple))
        # vary stroke colour: middle band brighter, outer bands dim
        is_mid = abs(idx - 5) <= 1
        col = TEAL if is_mid else PIPE_MID
        w   = 4 if is_mid else 3
        # subtle "soft" shadow line just below
        draw.line(pts, fill=col, width=w)

        # Small arrow chevron at ~78% along each streamline
        t_arrow = 0.78
        # compute position + direction
        def at(t):
            x = flow_origin_x + (end_x - flow_origin_x) * t
            envelope = math.sin(math.pi * t) ** 1.2
            ripple = math.sin(t * math.pi * 2.6 + phase) * amp * envelope
            return (x, sy + (ey - sy) * t + ripple)
        p_now = at(t_arrow)
        p_nxt = at(t_arrow + 0.012)
        ang = math.atan2(p_nxt[1] - p_now[1], p_nxt[0] - p_now[0])
        # chevron — two short lines meeting at the streamline
        chev = 8
        ang_l = ang + math.radians(140)
        ang_r = ang - math.radians(140)
        if is_mid:
            draw.line([(p_now[0], p_now[1]),
                       (p_now[0] + math.cos(ang_l) * chev, p_now[1] + math.sin(ang_l) * chev)],
                      fill=WHITE, width=2)
            draw.line([(p_now[0], p_now[1]),
                       (p_now[0] + math.cos(ang_r) * chev, p_now[1] + math.sin(ang_r) * chev)],
                      fill=WHITE, width=2)

    # ---- Temperature pill in the upper-right (subtle technical annotation) ----
    px, py = W - 200, 56
    pad = 14
    label = "21°C"
    tf = f_sans(28, 'bold')
    tw = text_width_tracked(label, tf, 0.0)
    draw.rounded_rectangle([px - pad, py - 8, px + tw + pad, py + 38], radius=22,
                            fill=DARK_TOP, outline=PIPE_TEAL, width=2)
    draw.text((px, py - 2), label, fill=TEAL, font=tf)


# ============================================================================
# Builders
# ============================================================================

def build_zold(variant, out_path):
    """Build a Zöld Település banner (leaf / trees)."""
    img = Image.new('RGB', (W, H), BG_TOP)
    vertical_gradient(img, BG_TOP, BG_BOT)
    draw = ImageDraw.Draw(img, 'RGBA')

    if variant == 'leaf':
        draw_leaf(draw)
    elif variant == 'trees':
        draw_trees(draw)

    pad_x = 78
    # Eyebrow
    eyebrow_font = f_mono(28, 'bold')
    draw_tracked(draw, (pad_x, 64), EYEBROW, eyebrow_font, EYEBROW_COL, tracking_em=0.16)
    # Headline
    headline_font = f_sans(118, 'bold')
    draw_tracked(draw, (pad_x - 4, 110), HEADLINE, headline_font, WHITE, tracking_em=-0.025)
    # CTA with arrow
    cta_font = f_sans(38, 'regular')
    cta_y = 240
    draw_tracked(draw, (pad_x, cta_y), CTA, cta_font, CTA_COL, tracking_em=0.0)
    cta_w = text_width_tracked(CTA, cta_font, 0.0)
    arrow_y = cta_y + int(cta_font.size * 0.55)
    draw_arrow(draw, pad_x + cta_w + 22, arrow_y, 44, CTA_COL, weight=3)

    img.save(out_path, 'PNG', optimize=True)
    print('wrote', out_path)


def build_general(variant, out_path):
    """Build a general-mechanical banner (rings / contour slots, dark slate)."""
    img = Image.new('RGB', (W, H), DARK_TOP)
    vertical_gradient(img, DARK_TOP, DARK_BOT)
    draw = ImageDraw.Draw(img, 'RGBA')

    if variant == 'rings':
        draw_pipes_schematic(draw)
    elif variant == 'contour':
        draw_airflow(draw)

    # ---- Stacked words on the left ----
    pad_x = 78
    line_size = 54
    line_h = 60
    top_y = 18
    font_bold   = f_sans(line_size, 'bold')
    font_italic = f_sans(line_size, 'bold_italic')

    for i, (text, color_key, italic) in enumerate(GENERAL_LINES):
        font = font_italic if italic else font_bold
        color = GENERAL_COLOR_MAP[color_key]
        y = top_y + i * line_h
        draw_tracked(draw, (pad_x, y), text, font, color, tracking_em=-0.025)

    # ---- CTA at the bottom (silverklima.hu →) ----
    cta_font = f_sans(28, 'regular')
    cta_y = top_y + 4 * line_h + 8        # right under the stack
    draw_tracked(draw, (pad_x, cta_y), GENERAL_CTA, cta_font, LIGHT_GRAY, tracking_em=0.0)
    cta_w = text_width_tracked(GENERAL_CTA, cta_font, 0.0)
    arrow_y = cta_y + int(cta_font.size * 0.55)
    draw_arrow(draw, pad_x + cta_w + 16, arrow_y, 32, LIGHT_GRAY, weight=2)

    img.save(out_path, 'PNG', optimize=True)
    print('wrote', out_path)


# ============================================================================
# Entry
# ============================================================================

if __name__ == '__main__':
    os.makedirs(OUT_DIR, exist_ok=True)
    for v in ('leaf', 'trees'):
        build_zold(v, os.path.join(OUT_DIR, f'banner-{v}.png'))
    for v in ('rings', 'contour'):
        build_general(v, os.path.join(OUT_DIR, f'banner-{v}.png'))
    print('done.')
