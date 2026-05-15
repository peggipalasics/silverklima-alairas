# Handoff: Silver Klíma Email Signature Studio

## Overview

A standalone HTML "studio" page that lets a Silver Klíma employee fill in their personal contact details, pick one of four signature layouts and one of four banner visuals, and copy the resulting Outlook-compatible HTML signature to their clipboard with one click. The end output (what gets pasted into Outlook) is plain table-based HTML referencing two production-hosted images — the Silver Klíma logo and a chosen "Zöld Település Program" banner.

The "Zöld Település Program" is Silver Klíma's CSR program: for every air-conditioner sold, the company plants a tree in the buyer's village. The banner reinforces this in every outgoing email.

## About the Design Files

The files in this bundle are **design references created in HTML** — they show the intended look, behaviour, and (most importantly) the exact output HTML/PNG assets that should be shipped. **Two things to keep distinct:**

1. **The studio app** (`Aláírás Template.html` + `app.jsx` + supporting JSX). This is a single-page React-via-Babel prototype showing how the studio should feel. In the real product, recreate it in your stack's preferred environment (React, Vue, SvelteKit, etc.). It has no backend — all logic is client-side.

2. **The signature HTML it generates** (the strings returned by `buildClassic` / `buildEditorial` / `buildCompact` / `buildCard` in `signatures.jsx`). **This output is production-ready and should be preserved verbatim.** Every inline style, every `cellpadding="0" cellspacing="0" border="0"` table attribute, and the `mso-line-height-rule: exactly` declarations exist because Outlook (Desktop, Web, Mac) renders email HTML through a hostile mix of legacy Word engines. Don't "modernize" the output HTML into flexbox or styled-components — it will break in the recipient's inbox.

## Fidelity

**High-fidelity (hifi).** Exact colours, type, spacing, and copy are final. The studio chrome is hifi too, but its visual treatment (the cream/grey app shell, the form, the banner picker) is intentionally restrained so the signature previews carry the visual weight. If you reimplement the studio in your stack's design system, you can swap the chrome styling; the signature output itself must remain pixel-stable.

## Screens / Views

The studio is a single scrollable page with five vertical sections.

### 1 — Header

- Brand mark: Silver Klíma logo (38px tall) + monospace eyebrow `◌ EMAIL ALÁÍRÁS · TEMPLATE`
- Headline: `Aláírás. Sablon. / Outlookba.` — `Outlookba.` rendered in deep green italic at 500 weight; the rest in 800 weight `Hanken Grotesk`, `letter-spacing: -0.035em`, `line-height: 0.98`, responsive `clamp(40px, 5.6vw, 72px)`.
- Lede paragraph, max-width 580px, `silver` colour, `textWrap: 'pretty'`.

### 2 — Settings form

White card, `border-radius: 20`, `border: 1px solid #E4E7E9`, padding 28px.
- Section tag (monospace, green): `✦ ADATOK`
- Hint (italic, silver, right side): "A pozíció üresen is hagyható…"
- Grid of 5 fields (`repeat(auto-fit, minmax(180px, 1fr))`, gap 16):
  1. Név (default `Kovács Péter`)
  2. Pozíció (default `értékesítési munkatárs`, marked optional)
  3. Telefon (default `+36 30 123 4567`)
  4. Email (default `peter@silverklima.hu`, `type=email`)
  5. Weboldal (default `silverklima.hu`)

Each field: monospace 10px uppercase label with `0.14em` letter-spacing, then a 14px Hanken Grotesk input with `padding: 10px 12px`, `border: 1px solid #E4E7E9`, `border-radius: 8`. Focus state: green border + `box-shadow: 0 0 0 3px rgba(34,197,94,0.18)`.

### 3 — Banner picker

White card, same chrome as the form.
- Section tag: `◉ BANNER STÍLUS`
- Hint (italic, silver): "A választott banner mind a 4 aláírás-változatban élesben fog megjelenni."
- Grid of 4 tiles (`repeat(auto-fit, minmax(220px, 1fr))`, gap 12), each containing:
  - A 5:1 thumbnail (`object-fit: cover`) of the banner PNG
  - Label (14px, 700) + subtitle (11.5px, silver)
- The active tile has `border: 1.5px solid #22c55e`, a green ring (`box-shadow: 0 0 0 3px #dcfce7, 0 6px 18px rgba(34,197,94,0.12)`), and a circular green ✓ chip in the thumb's top-right corner.

Selecting a tile re-renders all four signature variants below.

### 4 — Variants grid

Section tag `↻ VÁLTOZATOK · 04`, hint pointing to the *Másolás Outlookba* button, then a `repeat(auto-fit, minmax(420px, 1fr))` grid of four cards. Each card:

- Header: `{Variant label}` (18px, 700) + subtitle, plus a monospace `/ 00` ordinal in the top-right.
- Faux email-body surface: light grey outer pad, white inner pane with a dashed-bottom mock "Tárgy" line, a faded "Üdvözlettel," cue, then the live signature HTML rendered via `dangerouslySetInnerHTML`.
- Action row: a black pill button `Másolás Outlookba` (flex-grows), a ghost pill `HTML kód`, and a 36×36 circular expand icon button.

Button states:
- Idle (primary): black `#1A1F22` bg, white text, 11px 18px padding.
- Done (after copy): bg changes to `#2E8B57`, label becomes `✓ Vágólapon — beilleszthető` for 1.8s.
- Error: label becomes `Hiba — próbáld a HTML-t` for 1.8s.
- Hover (all buttons): `transform: translateY(-1px)`; ghost buttons get green border on hover.

### 5 — Focus overlay

When the user clicks the expand icon on a card, a fullscreen overlay opens:
- Scrim: `rgba(26,31,34,0.65)` with `backdrop-filter: blur(8px)`.
- Centred white panel `max-width: 880`, `max-height: 92vh`, `border-radius: 20`, with a top bar (label + subtitle + ✕ close button) and a scrollable email frame.
- The email frame contains a longer mock message ("Kedves Anna, Köszönöm a visszajelzést…") followed by the signature.
- ESC closes; click on scrim closes.

### 6 — How-to / footer

White card with section tag `⌂ TELEPÍTÉS` and a numbered `<ol>` styled with a CSS-counter pseudo-element producing green `01`, `02`, `03`… markers. Final footer is a monospace 11px line: "Silver Concept Kft. · Bútorgyári u. 1/b, 9027 Győr · Silver Klíma · 2018 óta".

## The Four Signature Variants

All four return inline-styled table HTML. They share a `data` object (`{name, position, phone, email, website}`) and a `urls` object (`{logo, bannerKey, production}`). The position is optional — every layout handles it being blank gracefully.

### Klasszikus

Most conservative, two-column layout.
- Left cell: Silver Klíma logo, 148×61px, with a `border-right: 1px solid #E4E7E9` divider and 22px right padding.
- Right cell: name (17px, 700, letter-spacing -0.012em), italic-optional position (13px, silver), 10px spacer, then a stack of links — phone, email · website. The website has a green hairline `border-bottom: 1.5px solid #22c55e`.
- Below the two-column row: a full-width 520×104 banner image.

### Editorial

Magazine-style, name-first hierarchy.
- Row 1: `{Name}.` (a literal period appended) at 22px, 800 weight, letter-spacing -0.025em. Italic position below at 13px, 500.
- Row 2: a 28×2 green accent bar.
- Row 3: single-line contact row: phone (medium) · email · website (green hairline). Mist-coloured `·` separators.
- Row 4: 520×104 banner.
- Row 5: small footer lock-up — Silver Klíma logo 96×40 + monospace 10px uppercase line "Silver Concept Kft. · Klimatizálás 2018 óta".

This variant places the logo *after* the name on purpose. The earlier "logo on top" version felt out-of-order.

### Kompakt

Tightest vertical footprint.
- Two columns: 104×43 logo on the left, name+contact stack on the right.
- Name and position inline: `**Name** · position` (700 / 400 with mist `·`).
- Below the name, three labelled rows: `T`, `E`, `W` monospace eyebrows (10px, 0.12em letter-spacing, silver) next to their links.
- A narrower 420×104 banner below.

### Kártya

Hairline-bordered card.
- Outer table has `border: 1px solid #E4E7E9`, `border-radius: 14`.
- Top section: logo (118×49) + name (16px, 700) + position, padded 20px / 22px.
- Middle section: hairline top border, then labelled `TEL` / `MAIL` / `WEB` rows (monospace 10px in silver) with the link values inline.
- Bottom section: a full-bleed 540×104 banner image, padding/font reset to 0/0 to ensure it sits flush.

## The Four Banner Images

Each banner is a 1560×312 PNG, displayed at 520×104 in most variants (Kompakt uses 420, Kártya uses 540). All four carry the same headline `1 klíma = 1 fa`, eyebrow `✦ ZÖLD TELEPÜLÉS PROGRAM`, and CTA `zoldtelepules.hu →`.

| Key | Label | Visual mark |
|-----|-------|-------------|
| `leaf` | Levél | A single bold green leaf with vein detail + a small "pulse" dot. **Default.** |
| `trees` | Fasor | A geometric tree skyline — vertical strokes capped with filled circle canopies, varied heights, on a dotted horizon line. |
| `rings` | Évgyűrűk | Concentric green growth rings (tree cross-section), with a dashed radial tick. |
| `contour` | Topográfia | Topographic contour lines forming three soft hill clusters, with a darkening gradient mask under the type. |

The banners are generated procedurally (see the canvas scripts in the original project) but should be **shipped as static PNGs** — don't reproduce the canvas code in production. They live at:

```
https://silverklima.hu/email/banner-leaf.png
https://silverklima.hu/email/banner-trees.png
https://silverklima.hu/email/banner-rings.png
https://silverklima.hu/email/banner-contour.png
https://silverklima.hu/email/silverklima-logo.png
```

These URLs must be reachable on the open internet (no auth, correct CORS, long Cache-Control) so Outlook clients can fetch them when the recipient opens the email.

## Interactions & Behavior

### Clipboard copy

The primary action — `Másolás Outlookba` — writes **two clipboard payloads simultaneously**:

```js
new ClipboardItem({
  'text/html':  new Blob([html],  { type: 'text/html'  }),
  'text/plain': new Blob([plain], { type: 'text/plain' }),
})
```

This is the only reliable way to make Outlook accept a signature paste cleanly: it picks the HTML payload, while text-only mail clients (or Outlook's "paste as plain text") get the legible fallback.

If `navigator.clipboard.write` fails or is unavailable (older Safari, http://), fall back to a hidden contentEditable div + `document.execCommand('copy')`. The fallback is required — the studio's whole reason to exist is the copy action.

### Plain-text fallback

```
Kovács Péter
értékesítési munkatárs
— Silver Klíma —
+36 30 123 4567
peter@silverklima.hu
silverklima.hu

✦ 1 klíma = 1 fa — Zöld Település Program · zoldtelepules.hu
```

### The two "what gets copied" modes

1. **Másolás Outlookba (primary)** — copies the *preview* HTML, i.e. with the local `assets/logo-silverklima.png` and `assets/banner-*.png` paths. This is what the user is looking at on screen. When pasted into Outlook Web (compose pane), the browser still has those URLs in scope, so the images render immediately. For Outlook Desktop, the user re-inserts the logo via the signature editor's *Insert Image* button (instructions are in the *⌂ TELEPÍTÉS* card).
2. **HTML kód (secondary)** — copies the *production* HTML, i.e. with absolute `https://silverklima.hu/email/...` URLs. This is for the user who edits Outlook's `.htm` signature file directly, or who's pasting into a webmail's "edit HTML source" view.

### Banner picker

Changing the active banner key re-renders all four variant previews via React state. Persist the chosen key to `localStorage` so the studio remembers the user's choice across reloads. Also persist the form `data` the same way.

### Focus overlay

- Open: clicking the expand icon on any variant card sets `focusId = variant.id`, which mounts `FocusOverlay`.
- ESC, ✕ button, or scrim click all close.
- While open: `document.body.style.overflow = 'hidden'` to suppress scroll; restore on unmount.

### Validation

The form is not validated. Empty values render gracefully (the position line collapses; an empty name is allowed though discouraged). A nice-to-have for production: tel: and mailto: validation, and a "please fill name" hint if name is blank.

## State Management

Trivial — entirely client-side:

```ts
{
  data: { name, position, phone, email, website }, // form fields
  bannerKey: 'leaf' | 'trees' | 'rings' | 'contour',
  focusId: string | null, // which variant is open in fullscreen
  // per VariantCard:
  richState: 'idle' | 'done' | 'err',
  rawState: 'idle' | 'done' | 'err',
}
```

Persist `data` and `bannerKey` to `localStorage` under e.g. `silverklima.signature.v1`.

## Design Tokens

### Colours

| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#1A1F22` | Body text, primary buttons |
| `silver` | `#6B6B6B` | Secondary text, labels |
| `mist` | `#C5C7CA` | Dividers, separators (`·`), placeholder marks |
| `line` | `#E4E7E9` | Hairline borders on cards/inputs |
| `green` (g500) | `#22c55e` | Brand primary — link hairlines, accent bars, banner mark colours |
| `greenDeep` (g700) | `#15803d` | Step counters, footer hairlines |
| `greenDark` (g900) | `#14532d` | Banner mid-gradient |
| `greenInk` (g950) | `#052e16` | Banner darkest gradient stop |
| `greenSoft` (g100) | `#dcfce7` | Active-tile glow ring |
| App page bg | `#F6F7F8` | The whole studio canvas |

The green scale is the Tailwind green family (g50 → g950) as used on `zoldtelepules.hu`. Use the full scale if you need intermediate values.

### Typography

- **Hanken Grotesk** (400 / 500 / 600 / 700 / 800; italic 400 / 500) — body, headlines.
- **JetBrains Mono** (400 / 500 / 600) — eyebrows, labels, step counters, code spans.
- **Fallback stack** (used inside the signature HTML so Outlook clients fall back cleanly): `'Hanken Grotesk', Arial, Helvetica, sans-serif`.

Both fonts are loaded from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

### Spacing

The studio uses ad-hoc px values (no scale token), all derived from a 4-px base. Common: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 36, 48, 80.

Inside the signature HTML, padding values are deliberately tuned for Outlook's quirks — keep them verbatim.

### Border radius

- Inputs: 8
- Pills (buttons): 999
- Cards: 14, 20
- Banner image corners: untouched (the PNG provides any rounding via its content; the `<img>` itself is square).
- Faux email surface inner pane: 8

### Shadows

- Active banner tile: `0 0 0 3px #dcfce7, 0 6px 18px rgba(34,197,94,0.12)`
- Focus overlay panel: `0 24px 80px rgba(0,0,0,0.3)`
- Done-state check chip: `0 2px 6px rgba(0,0,0,0.18)`

### Inputs (signature HTML specifics)

| Where | Value |
|-------|-------|
| Every `<table>` | `cellpadding="0" cellspacing="0" border="0"` |
| Outlook Word leading reset | `mso-line-height-rule: exactly;` on every text-containing `<td>` |
| Every `<img>` | explicit `width`/`height` HTML attrs + `style="display:block; border:0; outline:none; text-decoration:none;"` |
| Anchor inside banner | `style="text-decoration:none; border:0; display:inline-block;"` |
| Link to website | `border-bottom: 1.5px solid #22c55e` (acts as a "green underline" that survives Outlook's link rewriting) |

## Assets

Lives in `assets/` inside this handoff bundle:

- `logo-silverklima.png` — primary brand logo. Provided by Silver Klíma.
- `banner-leaf.png`, `banner-trees.png`, `banner-rings.png`, `banner-contour.png` — the four banner PNGs at 1560×312 (≈ 3× the 520×104 display size for retina).

In production, all five must be hosted at the URLs in *§ The Four Banner Images*. Set long `Cache-Control` (e.g. `public, max-age=31536000`) and let cache-bust via filename if a banner is ever redesigned (e.g. `banner-leaf-v2.png`).

## Files

- `Aláírás Template.html` — the studio entry point. Pulls React + Babel + Google Fonts from CDNs, mounts `<App />` into `#root`. The `<style>` block has the page-wide chrome rules (input focus, button hover, `<ol>` counters, signature link reset).
- `signatures.jsx` — the pure-logic core: `buildClassic`, `buildEditorial`, `buildCompact`, `buildCard`, `buildPlain`, the `BANNERS` map, and shared helpers (`esc`, `telHref`, `ensureHttp`, `stripProto`, `bannerImage`, `positionLine`). Exposed on `window.SK_SIGNATURES`. **The four `build*` functions are the production contract — port them as-is, do not refactor their output.**
- `app.jsx` — the studio UI: `Field`, `VariantCard`, `BannerPicker`, `FocusOverlay`, `App`, all inline `*Styles` objects, and the clipboard utilities (`copyRich`, `copyText`). React 18, no router, mounts at module bottom.

## Suggested implementation steps

1. **Port `signatures.jsx` first.** It's pure JS with no React or DOM dependencies (the `buildBanner` / `bannerImage` helper just returns a string). Move it into your stack's util folder. Add a unit test that asserts the output HTML for a fixed `data` snapshot is byte-stable — this catches accidental refactors that would break Outlook rendering.
2. **Host the assets.** Upload the 4 PNG banners and the logo to whatever CDN / static host the SilverKlima site uses, at the URLs in *§ Assets*. Verify they're publicly fetchable (curl + browser private window).
3. **Recreate the studio chrome** in your framework. The layout is a single column of cards in a centred 1280-max-width container — Tailwind, plain CSS, or your existing components all fit. The fiddly parts to get right are: the banner thumbnails' active state, the copy-success transition on the primary button, and the focus overlay (it must trap scroll and respond to ESC).
4. **Wire `localStorage` persistence** for `bannerKey` and `data`. Keep the key namespaced (e.g. `silverklima.signature.v1`) so future schema changes don't collide.
5. **Optional polish**: a small "preview as it'll look in Outlook Desktop" toggle that switches the preview font from `Hanken Grotesk` to `Arial` — Outlook Desktop doesn't load custom fonts, so signatures actually render in Arial there. The visual delta is non-trivial and would catch surprises for the end user.
6. **Don't ship the React + Babel CDN tags.** Compile properly. The HTML prototype uses inline Babel only because it had to be a single drag-and-drop file.

## Out of scope / not designed

- No backend, no auth — anyone with the URL can use the studio.
- No analytics, no event tracking.
- No multi-language UI (the studio is Hungarian only).
- No dark mode (the signature itself doesn't have one; recipients render it on whatever background their client uses).
- No per-user templates — every employee gets the same four layouts and four banner choices.
- No signature *editor* — only the form fields are user-editable; the layout and banner are picks, not custom-buildable.
