// Email-signature studio for Silver Klíma.
//
// Layout: brand header → settings form → 2×2 grid of variant cards.
// Each card renders the live signature on a faux "email body" surface and
// offers two copy modes: rich (text/html + text/plain — the path Outlook
// users will actually take) and raw HTML (for the signature editor's HTML
// pane).

const { useState, useMemo, useCallback, useEffect, useRef } = React;
const { VARIANTS, buildPlain, COLORS, BANNERS, DEFAULT_BANNER } = window.SK_SIGNATURES;

const DEFAULT_DATA = {
  name: 'Kovács Péter',
  position: 'értékesítési munkatárs',
  phone: '+36 30 123 4567',
  email: 'peter@silverklima.hu',
  website: 'silverklima.hu',
};

// Logo + banner URLs the COPIED HTML points to (user must host them on
// silverklima.hu). For the on-screen preview we always swap in the local
// paths so the file works offline. Banner identity is carried via
// `bannerKey` so the signature builders can resolve the right PNG.
const LOGO_PRODUCTION = 'https://silverklima.hu/email/silverklima-logo.png';
const LOGO_PREVIEW    = 'assets/logo-silverklima.png';

function buildUrls(bannerKey, { production = false } = {}) {
  return {
    logo: production ? LOGO_PRODUCTION : LOGO_PREVIEW,
    bannerKey,
    production,
  };
}

// ---------------------------------------------------------------------------
// Clipboard

async function copyRich(html, plain) {
  try {
    if (window.ClipboardItem && navigator.clipboard?.write) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (e) {
    // fall through to execCommand
  }
  // Fallback: select a hidden contenteditable div and execCommand('copy').
  try {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    div.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    div.innerHTML = html;
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    const ok = document.execCommand('copy');
    sel.removeAllRanges();
    document.body.removeChild(div);
    return ok;
  } catch (e) {
    return false;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Form field

function Field({ label, value, onChange, placeholder, optional, type = 'text' }) {
  return (
    <label style={fieldStyles.wrap}>
      <span style={fieldStyles.label}>
        {label}
        {optional && <span style={fieldStyles.opt}> · opcionális</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={fieldStyles.input}
      />
    </label>
  );
}

const fieldStyles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 0,
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: COLORS.silver,
    fontWeight: 500,
  },
  opt: {
    color: COLORS.mist,
    textTransform: 'none',
    letterSpacing: '0.02em',
    fontWeight: 400,
  },
  input: {
    fontFamily: "'Hanken Grotesk', Arial, Helvetica, sans-serif",
    fontSize: 14,
    color: COLORS.ink,
    padding: '10px 12px',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    background: '#fff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    letterSpacing: '-0.005em',
  },
};

// ---------------------------------------------------------------------------
// Variant card

function VariantCard({ variant, data, bannerKey, focus }) {
  const [richState, setRichState] = useState('idle'); // idle | done | err
  const [rawState, setRawState] = useState('idle');
  const previewRef = useRef(null);

  // Two HTML strings: the one we display (local logo) and the one we copy
  // (production logo URL).
  const previewHTML = useMemo(
    () => variant.build(data, buildUrls(bannerKey, { production: false })),
    [data, variant, bannerKey],
  );
  const productionHTML = useMemo(
    () => variant.build(data, buildUrls(bannerKey, { production: true })),
    [data, variant, bannerKey],
  );

  const handleRich = useCallback(async () => {
    // Copy WHAT THE USER SEES — preview HTML with the local logo path
    // resolved against the page origin, so pasting into Outlook Web pulls
    // the logo immediately. For Outlook Desktop they'll need to re-host.
    const previewEl = previewRef.current;
    const html = previewEl ? previewEl.innerHTML : previewHTML;
    const ok = await copyRich(html, buildPlain(data));
    setRichState(ok ? 'done' : 'err');
    setTimeout(() => setRichState('idle'), 1800);
  }, [previewHTML, data]);

  const handleRaw = useCallback(async () => {
    const ok = await copyText(productionHTML);
    setRawState(ok ? 'done' : 'err');
    setTimeout(() => setRawState('idle'), 1800);
  }, [productionHTML]);

  return (
    <div style={cardStyles.card}>
      {/* Header */}
      <div style={cardStyles.header}>
        <div>
          <div style={cardStyles.label}>{variant.label}</div>
          <div style={cardStyles.subtitle}>{variant.subtitle}</div>
        </div>
        <div style={cardStyles.tag}>/ {String(variant.id).padStart(2, '0')}</div>
      </div>

      {/* Email-body preview surface */}
      <div style={cardStyles.surface}>
        <div style={cardStyles.surfaceInner}>
          {/* Faux email header line */}
          <div style={cardStyles.emailMeta}>
            <span style={cardStyles.emailMetaKey}>Tárgy</span>
            <span style={cardStyles.emailMetaVal}>Visszaigazolás · felmérés időpont</span>
          </div>
          <div style={cardStyles.emailBody}>
            <span style={{ color: COLORS.silver }}>Üdvözlettel,</span>
          </div>
          {/* The signature itself */}
          <div
            ref={previewRef}
            className="sk-sig-preview"
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={cardStyles.actions}>
        <button
          type="button"
          onClick={handleRich}
          style={{
            ...cardStyles.btnPrimary,
            ...(richState === 'done' ? cardStyles.btnPrimaryDone : null),
          }}
        >
          {richState === 'done'
            ? '✓ Vágólapon — beilleszthető'
            : richState === 'err'
            ? 'Hiba — próbáld a HTML-t'
            : 'Másolás Outlookba'}
        </button>
        <button
          type="button"
          onClick={handleRaw}
          style={cardStyles.btnGhost}
        >
          {rawState === 'done' ? '✓ HTML' : rawState === 'err' ? 'Hiba' : 'HTML kód'}
        </button>
        <button
          type="button"
          onClick={() => focus(variant.id)}
          style={cardStyles.btnIcon}
          aria-label="Nagy nézet"
          title="Nagy nézet"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 3 3 6 3"></polyline>
            <polyline points="13 6 13 3 10 3"></polyline>
            <polyline points="3 10 3 13 6 13"></polyline>
            <polyline points="13 10 13 13 10 13"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

const cardStyles = {
  card: {
    background: '#fff',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 20,
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  label: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.ink,
    letterSpacing: '-0.015em',
  },
  subtitle: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 12.5,
    color: COLORS.silver,
    fontWeight: 400,
    marginTop: 2,
    letterSpacing: '-0.005em',
  },
  tag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.14em',
    color: COLORS.mist,
    fontWeight: 500,
    paddingTop: 4,
  },
  surface: {
    background: '#F8F9FA',
    borderRadius: 12,
    padding: 18,
    minHeight: 220,
  },
  surfaceInner: {
    background: '#fff',
    borderRadius: 8,
    padding: '16px 20px 20px',
    border: `1px solid ${COLORS.line}`,
  },
  emailMeta: {
    display: 'flex',
    gap: 14,
    paddingBottom: 10,
    marginBottom: 14,
    borderBottom: `1px dashed ${COLORS.line}`,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  emailMetaKey: {
    color: COLORS.mist,
  },
  emailMetaVal: {
    color: COLORS.silver,
    textTransform: 'none',
    letterSpacing: '0.02em',
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 12,
  },
  emailBody: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 13,
    color: COLORS.silver,
    marginBottom: 18,
  },
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  btnPrimary: {
    flex: '1 1 auto',
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    background: COLORS.ink,
    border: 0,
    borderRadius: 999,
    padding: '11px 18px',
    cursor: 'pointer',
    letterSpacing: '-0.005em',
    transition: 'background 0.2s, transform 0.15s',
  },
  btnPrimaryDone: {
    background: '#2E8B57',
  },
  btnGhost: {
    flex: '0 0 auto',
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: COLORS.ink,
    background: '#fff',
    border: `1.5px solid ${COLORS.line}`,
    borderRadius: 999,
    padding: '9.5px 14px',
    cursor: 'pointer',
    letterSpacing: '-0.005em',
    transition: 'border-color 0.2s, color 0.2s',
  },
  btnIcon: {
    flex: '0 0 auto',
    width: 36,
    height: 36,
    borderRadius: 999,
    border: `1.5px solid ${COLORS.line}`,
    background: '#fff',
    color: COLORS.silver,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.2s, color 0.2s',
  },
};

// ---------------------------------------------------------------------------
// Focus overlay — fullscreen preview of one variant.

function FocusOverlay({ variant, data, bannerKey, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!variant) return null;
  const html = variant.build(data, buildUrls(bannerKey));

  return (
    <div style={focusStyles.scrim} onClick={onClose}>
      <div style={focusStyles.wrap} onClick={(e) => e.stopPropagation()}>
        <div style={focusStyles.bar}>
          <div>
            <div style={focusStyles.barLabel}>{variant.label}</div>
            <div style={focusStyles.barSub}>{variant.subtitle}</div>
          </div>
          <button onClick={onClose} style={focusStyles.close} aria-label="Bezárás">×</button>
        </div>
        <div style={focusStyles.frame}>
          <div style={focusStyles.email}>
            <div style={cardStyles.emailMeta}>
              <span style={cardStyles.emailMetaKey}>Tárgy</span>
              <span style={cardStyles.emailMetaVal}>Visszaigazolás · felmérés időpont</span>
            </div>
            <div style={{ ...cardStyles.emailBody, fontSize: 14, marginBottom: 24 }}>
              <span style={{ color: COLORS.silver }}>Kedves Anna,</span>
              <br /><br />
              <span style={{ color: COLORS.silver }}>Köszönöm a visszajelzést — a felmérést a jövő héten csütörtökön 14:00-kor be tudjuk illeszteni.</span>
              <br /><br />
              <span style={{ color: COLORS.silver }}>Üdvözlettel,</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const focusStyles = {
  scrim: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26,31,34,0.65)',
    backdropFilter: 'blur(8px)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  wrap: {
    width: '100%',
    maxWidth: 880,
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
  },
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: `1px solid ${COLORS.line}`,
  },
  barLabel: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.ink,
    letterSpacing: '-0.015em',
  },
  barSub: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 12.5,
    color: COLORS.silver,
    marginTop: 2,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 999,
    border: `1.5px solid ${COLORS.line}`,
    background: '#fff',
    color: COLORS.ink,
    fontSize: 20,
    lineHeight: 1,
    cursor: 'pointer',
  },
  frame: {
    background: '#F8F9FA',
    padding: 40,
    flex: '1 1 auto',
    overflow: 'auto',
  },
  email: {
    background: '#fff',
    borderRadius: 10,
    padding: '28px 36px 36px',
    maxWidth: 640,
    margin: '0 auto',
    border: `1px solid ${COLORS.line}`,
  },
};

// ---------------------------------------------------------------------------
// Banner picker — horizontal row of 4 banner thumbnails. The active one is
// highlighted with a green ring + check chip. Selecting one rebuilds every
// variant's signature to use that banner.

function BannerPicker({ active, onSelect }) {
  const keys = Object.keys(BANNERS);
  return (
    <section style={pickerStyles.card}>
      <div style={pickerStyles.head}>
        <span style={appStyles.sectionTag}>◉ BANNER STÍLUS</span>
        <span style={pickerStyles.hint}>
          A választott banner mind a 4 aláírás-változatban élesben fog megjelenni.
        </span>
      </div>
      <div style={pickerStyles.row}>
        {keys.map((k) => {
          const b = BANNERS[k];
          const isActive = k === active;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onSelect(k)}
              style={{
                ...pickerStyles.tile,
                ...(isActive ? pickerStyles.tileActive : null),
              }}
            >
              <div style={pickerStyles.thumbWrap}>
                <img
                  src={b.preview}
                  alt={b.label}
                  style={pickerStyles.thumb}
                  draggable={false}
                />
                {isActive && (
                  <span style={pickerStyles.checkChip}>✓</span>
                )}
              </div>
              <div style={pickerStyles.tileMeta}>
                <div style={pickerStyles.tileLabel}>{b.label}</div>
                <div style={pickerStyles.tileSub}>{b.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const pickerStyles = {
  card: {
    background: '#fff',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 20,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  head: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    flexWrap: 'wrap',
  },
  hint: {
    fontSize: 13,
    color: COLORS.silver,
    fontStyle: 'italic',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 10,
    background: '#fff',
    border: `1.5px solid ${COLORS.line}`,
    borderRadius: 14,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
  },
  tileActive: {
    borderColor: COLORS.green,
    boxShadow: `0 0 0 3px ${COLORS.greenSoft}, 0 6px 18px rgba(34,197,94,0.12)`,
  },
  thumbWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '5 / 1',
    background: '#f5f4ee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  checkChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 999,
    background: COLORS.green,
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
  },
  tileMeta: {
    padding: '0 4px 4px 4px',
  },
  tileLabel: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.ink,
    letterSpacing: '-0.005em',
  },
  tileSub: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 11.5,
    color: COLORS.silver,
    marginTop: 2,
    lineHeight: 1.35,
  },
};

// ---------------------------------------------------------------------------
// App

function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [focusId, setFocusId] = useState(null);
  const [bannerKey, setBannerKey] = useState(DEFAULT_BANNER);
  const set = (k) => (v) => setData((d) => ({ ...d, [k]: v }));

  const focusVariant = useMemo(
    () => VARIANTS.find((v) => v.id === focusId),
    [focusId],
  );

  return (
    <div style={appStyles.page}>
      <div style={appStyles.container}>
        {/* Header */}
        <header style={appStyles.header}>
          <div style={appStyles.brand}>
            <img
              src="assets/logo-silverklima.png"
              alt="Silver Klíma"
              style={{ height: 38, width: 'auto', display: 'block' }}
            />
            <span style={appStyles.brandTag}>
              <span style={{ color: COLORS.mist }}>◌ </span>
              EMAIL ALÁÍRÁS · TEMPLATE
            </span>
          </div>
          <div style={appStyles.headline}>
            <h1 style={appStyles.h1}>
              Aláírás. Sablon.
              <br />
              <span style={appStyles.h1Italic}>Outlookba.</span>
            </h1>
            <p style={appStyles.lede}>
              Töltsd ki egyszer, válassz változatot, másold a vágólapra.
              Mind a négy table-alapú, beleilleszthető Outlook Desktopba,
              Outlook Webbe és Macre.
            </p>
          </div>
        </header>

        {/* Settings form */}
        <section style={appStyles.formCard}>
          <div style={appStyles.formHead}>
            <span style={appStyles.sectionTag}>✦ ADATOK</span>
            <span style={appStyles.formHint}>
              A pozíció üresen is hagyható — a sablon enélkül is rendben néz ki.
            </span>
          </div>
          <div style={appStyles.formGrid}>
            <Field label="Név" value={data.name} onChange={set('name')} placeholder="Kovács Péter" />
            <Field label="Pozíció" value={data.position} onChange={set('position')} placeholder="értékesítési munkatárs" optional />
            <Field label="Telefon" value={data.phone} onChange={set('phone')} placeholder="+36 30 123 4567" />
            <Field label="Email" value={data.email} onChange={set('email')} placeholder="peter@silverklima.hu" type="email" />
            <Field label="Weboldal" value={data.website} onChange={set('website')} placeholder="silverklima.hu" />
          </div>
        </section>

        {/* Banner picker */}
        <BannerPicker active={bannerKey} onSelect={setBannerKey} />

        {/* Variants grid */}
        <section>
          <div style={appStyles.gridHead}>
            <span style={appStyles.sectionTag}>↻ VÁLTOZATOK · 04</span>
            <span style={appStyles.gridHint}>
              Klikkelj a <strong style={{ color: COLORS.ink, fontWeight: 600 }}>Másolás Outlookba</strong> gombra, majd Outlookban: <em>Fájl → Beállítások → Levél → Aláírások → Új → Ctrl+V</em>.
            </span>
          </div>
          <div style={appStyles.grid}>
            {VARIANTS.map((v) => (
              <VariantCard key={v.id} variant={v} data={data} bannerKey={bannerKey} focus={setFocusId} />
            ))}
          </div>
        </section>

        {/* How-to / footer */}
        <section style={appStyles.howto}>
          <div style={appStyles.howtoHead}>
            <span style={appStyles.sectionTag}>⌂ TELEPÍTÉS</span>
          </div>
          <ol style={appStyles.steps}>
            <li>
              <strong>Töltsd ki</strong> fent a saját adataidat. Az előnézet azonnal frissül.
            </li>
            <li>
              <strong>Másold</strong> a kiválasztott változatot a <em>Másolás Outlookba</em> gombbal.
            </li>
            <li>
              <strong>Outlook Desktop:</strong> Fájl → Beállítások → Levél → Aláírások → Új → Ctrl+V → Mentés.
              <br />
              <strong>Outlook Web / Mac:</strong> Beállítások → Levél → Megírás és válaszadás → Beillesztés a szövegmezőbe.
            </li>
            <li>
              A <strong>logó</strong> az előnézetben a helyi képet használja. Outlookba másoláskor az aktuálisan megjelenő képet viszi át a vágólap. Ha nem jelenne meg, használd az <em>Aláírás-szerkesztőben</em> a <em>Kép beszúrása</em> gombot, és tedd be a Silver Klíma logót.
            </li>
            <li>
              A <strong>HTML kód</strong> gombbal a forráskódot kapod meg (production logó-URL-lel: <code style={appStyles.code}>silverklima.hu/email/silverklima-logo.png</code>) — ezt használd, ha az Outlook aláírás-fájljába (.htm) közvetlenül szerkesztesz.
            </li>
          </ol>
        </section>

        <footer style={appStyles.footer}>
          <span>Silver Concept Kft. · Bútorgyári u. 1/b, 9027 Győr</span>
          <span style={{ color: COLORS.mist }}>·</span>
          <span>Silver Klíma · 2018 óta</span>
        </footer>
      </div>

      {focusVariant && (
        <FocusOverlay
          variant={focusVariant}
          data={data}
          bannerKey={bannerKey}
          onClose={() => setFocusId(null)}
        />
      )}
    </div>
  );
}

const appStyles = {
  page: {
    minHeight: '100vh',
    background: '#F6F7F8',
    fontFamily: "'Hanken Grotesk', sans-serif",
    color: COLORS.ink,
    padding: '48px 28px 80px',
  },
  container: {
    maxWidth: 1280,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 36,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  brandTag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.16em',
    color: COLORS.silver,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  headline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    maxWidth: 760,
  },
  h1: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 'clamp(40px, 5.6vw, 72px)',
    fontWeight: 800,
    lineHeight: 0.98,
    letterSpacing: '-0.035em',
    color: COLORS.ink,
    margin: 0,
  },
  h1Italic: {
    fontStyle: 'italic',
    fontWeight: 500,
    color: COLORS.greenDeep,
  },
  lede: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 17,
    lineHeight: 1.45,
    color: COLORS.silver,
    margin: 0,
    maxWidth: 580,
    textWrap: 'pretty',
  },
  sectionTag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.16em',
    color: COLORS.green,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  formCard: {
    background: '#fff',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 20,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  formHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    flexWrap: 'wrap',
  },
  formHint: {
    fontSize: 13,
    color: COLORS.silver,
    fontStyle: 'italic',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
  },
  gridHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 16,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  gridHint: {
    fontSize: 13,
    color: COLORS.silver,
    maxWidth: 620,
    lineHeight: 1.5,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: 20,
  },
  howto: {
    background: '#fff',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 20,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  howtoHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  steps: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: 14,
    lineHeight: 1.6,
    color: COLORS.silver,
    paddingLeft: 20,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  code: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    background: '#F6F7F8',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 4,
    padding: '1px 6px',
    color: COLORS.ink,
  },
  footer: {
    display: 'flex',
    gap: 10,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.06em',
    color: COLORS.silver,
    paddingTop: 24,
    borderTop: `1px solid ${COLORS.line}`,
    flexWrap: 'wrap',
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
