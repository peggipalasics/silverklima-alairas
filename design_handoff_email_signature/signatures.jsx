// Outlook-safe email signature generators.
//
// Each `build*(data, logoUrl, bannerUrl)` returns a string of inline-styled,
// table-based HTML ready to paste into Outlook (Desktop, Web, Mac, Modern).
// Rules:
//   - No flex, no grid, no CSS custom properties, no external stylesheet.
//   - Every <table> has cellpadding=0 cellspacing=0 border=0.
//   - Fonts use 'Hanken Grotesk', Arial, Helvetica, sans-serif so the
//     preview renders in brand type but Outlook falls back to Arial cleanly.
//   - mso-line-height-rule: exactly tames Outlook Windows's extra leading.
//   - <img> tags carry explicit width/height attrs + style="display:block".
//   - The Zöld Település banner is a real PNG (`<img>`) — Outlook strips most
//     advanced CSS but renders images reliably, so an image banner survives
//     every client cleanly and reads as a graphic strip, not a CSS card.

const FONT = "'Hanken Grotesk', Arial, Helvetica, sans-serif";
const MONO = "'JetBrains Mono', 'Consolas', 'Courier New', monospace";

// Brand palette. Tailwind green scale, anchored on `#22c55e` (g500) which
// is the Zöld Település site's primary accent. Banner uses the deeper
// hero gradient (g950 → g700).
const COLORS = {
  ink: '#1A1F22',
  silver: '#6B6B6B',
  mist: '#C5C7CA',
  line: '#E4E7E9',
  green: '#22c55e',       // g500 — brand primary
  greenDeep: '#15803d',   // g700 — line accents, footer hairlines
  greenDark: '#14532d',   // g900 — dark text on light
  greenInk:  '#052e16',   // g950 — deepest, used in app surfaces
  greenSoft: '#dcfce7',   // g100 — soft fills, tags
  bg: '#FFFFFF',
};

// Banner options. Each is a flat-vector PNG, modern brand-mark style.
const BANNERS = {
  leaf: {
    label: 'Levél',
    subtitle: 'Egyetlen erőteljes levél-mark + impulzus pont',
    preview: 'assets/banner-leaf.png',
    production: 'https://silverklima.hu/email/banner-leaf.png',
    w: 520, h: 104,
  },
  trees: {
    label: 'Fasor',
    subtitle: 'Geometrikus fa-skyline a horizonton',
    preview: 'assets/banner-trees.png',
    production: 'https://silverklima.hu/email/banner-trees.png',
    w: 520, h: 104,
  },
  rings: {
    label: 'Évgyűrűk',
    subtitle: 'Koncentrikus zöld körök — fa-keresztmetszet',
    preview: 'assets/banner-rings.png',
    production: 'https://silverklima.hu/email/banner-rings.png',
    w: 520, h: 104,
  },
  contour: {
    label: 'Topográfia',
    subtitle: 'Térképszerű szélvonal-tájkép',
    preview: 'assets/banner-contour.png',
    production: 'https://silverklima.hu/email/banner-contour.png',
    w: 520, h: 104,
  },
};

const DEFAULT_BANNER = 'leaf';
const BANNER_ALT = '1 klíma = 1 fa — Zöld Település Program · zoldtelepules.hu';

// ----------------------------------------------------------------------------
// Shared helpers

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const telHref = (phone) => 'tel:' + String(phone || '').replace(/[^\d+]/g, '');

const ensureHttp = (url) => {
  const u = String(url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return 'https://' + u.replace(/^\/+/, '');
};

const stripProto = (url) =>
  String(url || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');

// Image-based banner. `urls.bannerKey` picks which banner to render.
// `width` lets compact use a narrower crop.
function bannerImage(urls, width) {
  const key = (urls && urls.bannerKey) || DEFAULT_BANNER;
  const asset = BANNERS[key] || BANNERS[DEFAULT_BANNER];
  const useProduction = !!(urls && urls.production);
  const src = useProduction ? asset.production : asset.preview;
  const w = width || asset.w;
  const h = Math.round(asset.h * (w / asset.w));
  return `
<a href="https://www.zoldtelepules.hu" style="text-decoration: none; border: 0; display: inline-block;">
  <img src="${esc(src)}" width="${w}" height="${h}" alt="${esc(BANNER_ALT)}" style="display: block; border: 0; outline: none; text-decoration: none; width: ${w}px; height: ${h}px; max-width: 100%;">
</a>`.trim();
}

// Position line — collapses to nothing if blank, so the signature still looks
// balanced without it.
function positionLine(position, size = 13, italic = false) {
  if (!position || !String(position).trim()) return '';
  const fs = italic ? 'italic' : 'normal';
  const fw = italic ? '500' : '400';
  return `<div style="font-family: ${FONT}; font-style: ${fs}; font-weight: ${fw}; font-size: ${size}px; color: ${COLORS.silver}; line-height: 1.35; margin-top: 2px; mso-line-height-rule: exactly;">${esc(position)}</div>`;
}

// `urls`: { logo, banner } — caller can pass production or preview URLs.
// All variants accept this same envelope.

// ----------------------------------------------------------------------------
// Variant 1 — Klasszikus: logo left, hairline divider, contact stack right,
// full-width forest banner below.

function buildClassic(data, urls) {
  const { name, position, phone, email, website } = data;
  const site = stripProto(website) || 'silverklima.hu';
  const siteHref = ensureHttp(website || 'silverklima.hu');

  return `
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: ${FONT}; color: ${COLORS.ink}; border-collapse: collapse;">
  <tr>
    <td style="padding: 0 0 14px 0; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation">
        <tr>
          <td style="padding: 2px 22px 0 0; vertical-align: top; border-right: 1px solid ${COLORS.line};">
            <img src="${esc(urls.logo)}" width="148" height="61" alt="Silver Klíma" style="display: block; border: 0; outline: none; text-decoration: none; width: 148px; height: 61px;">
          </td>
          <td style="padding: 0 0 0 22px; vertical-align: top;">
            <div style="font-family: ${FONT}; font-size: 17px; font-weight: 700; color: ${COLORS.ink}; letter-spacing: -0.012em; line-height: 1.2; mso-line-height-rule: exactly;">${esc(name)}</div>
            ${positionLine(position, 13)}
            <div style="height: 10px; line-height: 10px; font-size: 10px;">&nbsp;</div>
            <div style="font-family: ${FONT}; font-size: 13px; line-height: 1.7; color: ${COLORS.ink}; mso-line-height-rule: exactly;">
              <a href="${telHref(phone)}" style="color: ${COLORS.ink}; text-decoration: none;">${esc(phone)}</a><br>
              <a href="mailto:${esc(email)}" style="color: ${COLORS.ink}; text-decoration: none;">${esc(email)}</a>
              <span style="color: ${COLORS.mist};">&nbsp;·&nbsp;</span>
              <a href="${esc(siteHref)}" style="color: ${COLORS.ink}; text-decoration: none; border-bottom: 1.5px solid ${COLORS.green};">${esc(site)}</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td>
      ${bannerImage(urls, 520)}
    </td>
  </tr>
</table>`.trim();
}

// ----------------------------------------------------------------------------
// Variant 2 — Editorial: NAME first (big, with period), italic position,
// green accent bar, single-line contact row, full-bleed banner, then a
// small lock-up with the Silver Klíma logo + kicker at the very bottom.
// Logo at the bottom resolves the earlier "logo-before-name" weirdness while
// keeping the magazine-style hierarchy.

function buildEditorial(data, urls) {
  const { name, position, phone, email, website } = data;
  const site = stripProto(website) || 'silverklima.hu';
  const siteHref = ensureHttp(website || 'silverklima.hu');
  const nameWithDot = String(name || '').trim().replace(/\.$/, '') + '.';

  return `
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: ${FONT}; color: ${COLORS.ink}; border-collapse: collapse;">
  <tr>
    <td style="padding: 0;">
      <div style="font-family: ${FONT}; font-size: 22px; font-weight: 800; color: ${COLORS.ink}; letter-spacing: -0.025em; line-height: 1.05; mso-line-height-rule: exactly;">${esc(nameWithDot)}</div>
      ${positionLine(position, 13, true)}
    </td>
  </tr>
  <tr>
    <td style="padding: 10px 0 10px 0;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse: separate;">
        <tr>
          <td width="28" height="2" style="width: 28px; height: 2px; background-color: ${COLORS.green}; font-size: 0; line-height: 0; mso-line-height-rule: exactly;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 0 14px 0;">
      <div style="font-family: ${FONT}; font-size: 13px; line-height: 1.5; color: ${COLORS.ink}; mso-line-height-rule: exactly;">
        <a href="${telHref(phone)}" style="color: ${COLORS.ink}; text-decoration: none; font-weight: 500;">${esc(phone)}</a>
        <span style="color: ${COLORS.mist};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        <a href="mailto:${esc(email)}" style="color: ${COLORS.ink}; text-decoration: none;">${esc(email)}</a>
        <span style="color: ${COLORS.mist};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        <a href="${esc(siteHref)}" style="color: ${COLORS.ink}; text-decoration: none; border-bottom: 1.5px solid ${COLORS.green};">${esc(site)}</a>
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding: 0 0 14px 0;">
      ${bannerImage(urls, 520)}
    </td>
  </tr>
  <tr>
    <td style="padding: 4px 0 0 0;">
      <!-- Footer lock-up: small logo aligned with a quiet, all-caps brand label. -->
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 0 12px 0 0; vertical-align: middle;">
            <img src="${esc(urls.logo)}" width="96" height="40" alt="Silver Klíma" style="display: block; border: 0; outline: none; text-decoration: none; width: 96px; height: 40px;">
          </td>
          <td style="padding: 0; vertical-align: middle;">
            <span style="font-family: ${MONO}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLORS.silver}; font-weight: 500;">Silver Concept Kft. · Klimatizálás 2018 óta</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}

// ----------------------------------------------------------------------------
// Variant 3 — Kompakt: small logo left, name & position top-right, labelled
// contact rows below, narrow forest banner under the whole block. Tightest
// vertical footprint while still showing the image banner.

function buildCompact(data, urls) {
  const { name, position, phone, email, website } = data;
  const site = stripProto(website) || 'silverklima.hu';
  const siteHref = ensureHttp(website || 'silverklima.hu');

  // Position appears inline after the name with a separator (or omitted).
  const nameLine = position && position.trim()
    ? `<span style="font-weight: 700; color: ${COLORS.ink};">${esc(name)}</span><span style="color: ${COLORS.mist};">&nbsp;·&nbsp;</span><span style="color: ${COLORS.silver}; font-weight: 400;">${esc(position)}</span>`
    : `<span style="font-weight: 700; color: ${COLORS.ink};">${esc(name)}</span>`;

  return `
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family: ${FONT}; color: ${COLORS.ink}; border-collapse: collapse;">
  <tr>
    <td style="padding: 0 0 12px 0; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation">
        <tr>
          <td style="padding: 0 18px 0 0; vertical-align: top;">
            <img src="${esc(urls.logo)}" width="104" height="43" alt="Silver Klíma" style="display: block; border: 0; outline: none; text-decoration: none; width: 104px; height: 43px;">
          </td>
          <td style="padding: 0; vertical-align: top;">
            <div style="font-family: ${FONT}; font-size: 14px; line-height: 1.25; mso-line-height-rule: exactly; letter-spacing: -0.005em;">${nameLine}</div>
            <div style="height: 6px; line-height: 6px; font-size: 6px;">&nbsp;</div>
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 0 8px 0 0; vertical-align: top;">
                  <span style="font-family: ${MONO}; font-size: 10px; color: ${COLORS.silver}; letter-spacing: 0.12em; text-transform: uppercase;">T</span>
                </td>
                <td style="padding: 0; vertical-align: top;">
                  <a href="${telHref(phone)}" style="font-family: ${FONT}; font-size: 13px; color: ${COLORS.ink}; text-decoration: none; line-height: 1.5;">${esc(phone)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 8px 0 0; vertical-align: top;">
                  <span style="font-family: ${MONO}; font-size: 10px; color: ${COLORS.silver}; letter-spacing: 0.12em; text-transform: uppercase;">E</span>
                </td>
                <td style="padding: 0; vertical-align: top;">
                  <a href="mailto:${esc(email)}" style="font-family: ${FONT}; font-size: 13px; color: ${COLORS.ink}; text-decoration: none; line-height: 1.5;">${esc(email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 8px 0 0; vertical-align: top;">
                  <span style="font-family: ${MONO}; font-size: 10px; color: ${COLORS.silver}; letter-spacing: 0.12em; text-transform: uppercase;">W</span>
                </td>
                <td style="padding: 0; vertical-align: top;">
                  <a href="${esc(siteHref)}" style="font-family: ${FONT}; font-size: 13px; color: ${COLORS.ink}; text-decoration: none; border-bottom: 1.5px solid ${COLORS.green}; line-height: 1.5;">${esc(site)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td>
      ${bannerImage(urls, 420)}
    </td>
  </tr>
</table>`.trim();
}

// ----------------------------------------------------------------------------
// Variant 4 — Kártya: hairline-bordered card, logo + contact in a padded
// interior, full-bleed image banner sitting flush to the card's bottom edge.

function buildCard(data, urls) {
  const { name, position, phone, email, website } = data;
  const site = stripProto(website) || 'silverklima.hu';
  const siteHref = ensureHttp(website || 'silverklima.hu');

  return `
<table cellpadding="0" cellspacing="0" border="0" width="540" role="presentation" style="font-family: ${FONT}; color: ${COLORS.ink}; border-collapse: separate; border: 1px solid ${COLORS.line}; border-radius: 14px; background-color: #FFFFFF; overflow: hidden;">
  <tr>
    <td style="padding: 20px 22px 4px 22px; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 0 22px 0 0; vertical-align: middle;">
            <img src="${esc(urls.logo)}" width="118" height="49" alt="Silver Klíma" style="display: block; border: 0; outline: none; text-decoration: none; width: 118px; height: 49px;">
          </td>
          <td style="padding: 0; vertical-align: middle;">
            <div style="font-family: ${FONT}; font-size: 16px; font-weight: 700; color: ${COLORS.ink}; letter-spacing: -0.012em; line-height: 1.2; mso-line-height-rule: exactly;">${esc(name)}</div>
            ${positionLine(position, 12)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 12px 22px 18px 22px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="border-top: 1px solid ${COLORS.line}; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0 0 0;">
            <div style="font-family: ${FONT}; font-size: 13px; line-height: 1.85; color: ${COLORS.ink}; mso-line-height-rule: exactly;">
              <span style="font-family: ${MONO}; font-size: 10px; color: ${COLORS.silver}; letter-spacing: 0.14em; text-transform: uppercase;">TEL</span>
              &nbsp;&nbsp;
              <a href="${telHref(phone)}" style="color: ${COLORS.ink}; text-decoration: none;">${esc(phone)}</a>
              <br>
              <span style="font-family: ${MONO}; font-size: 10px; color: ${COLORS.silver}; letter-spacing: 0.14em; text-transform: uppercase;">MAIL</span>
              &nbsp;
              <a href="mailto:${esc(email)}" style="color: ${COLORS.ink}; text-decoration: none;">${esc(email)}</a>
              <br>
              <span style="font-family: ${MONO}; font-size: 10px; color: ${COLORS.silver}; letter-spacing: 0.14em; text-transform: uppercase;">WEB</span>
              &nbsp;&nbsp;
              <a href="${esc(siteHref)}" style="color: ${COLORS.ink}; text-decoration: none; border-bottom: 1.5px solid ${COLORS.green};">${esc(site)}</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 0; font-size: 0; line-height: 0;">
      ${bannerImage(urls, 540)}
    </td>
  </tr>
</table>`.trim();
}

// ----------------------------------------------------------------------------
// Plain-text fallback — Outlook accepts both text/html and text/plain on the
// clipboard. The plain version is what shows up if the recipient strips HTML.

function buildPlain(data) {
  const { name, position, phone, email, website } = data;
  const site = stripProto(website) || 'silverklima.hu';
  const lines = [
    name,
    position && position.trim() ? position : null,
    '— Silver Klíma —',
    phone,
    email,
    site,
    '',
    '✦ 1 klíma = 1 fa — Zöld Település Program · zoldtelepules.hu',
  ].filter(Boolean);
  return lines.join('\n');
}

// ----------------------------------------------------------------------------

const VARIANTS = [
  {
    id: 'classic',
    label: 'Klasszikus',
    subtitle: 'Logó · függőleges elválasztó · adatok · erdős banner',
    build: buildClassic,
  },
  {
    id: 'editorial',
    label: 'Editorial',
    subtitle: 'Magazinos — név elöl, banner, alul kis logó-blokk',
    build: buildEditorial,
  },
  {
    id: 'compact',
    label: 'Kompakt',
    subtitle: 'Kis logó, címkézett sorok, keskeny banner',
    build: buildCompact,
  },
  {
    id: 'card',
    label: 'Kártya',
    subtitle: 'Hajszálkeret, alul full-bleed banner-kép',
    build: buildCard,
  },
];

window.SK_SIGNATURES = {
  VARIANTS,
  buildPlain,
  FONT,
  COLORS,
  BANNERS,
  DEFAULT_BANNER,
};
