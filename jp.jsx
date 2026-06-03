/* ============================================================
   jp.jsx — Japanese rendering, audio, icons
   ============================================================ */

// Parse "{漢字|reading}" into tokens: strings + [base, reading] pairs.
function parseJP(str) {
  if (!str) return [];
  const parts = [];
  const re = /\{([^|{}]+)\|([^|{}]+)\}/g;
  let last = 0, m;
  while ((m = re.exec(str))) {
    if (m.index > last) parts.push(str.slice(last, m.index));
    parts.push([m[1], m[2]]);
    last = re.lastIndex;
  }
  if (last < str.length) parts.push(str.slice(last));
  return parts;
}

// Plain text (no furigana markup) for speech + measuring.
function plainJP(str) {
  return parseJP(str).map((p) => (Array.isArray(p) ? p[0] : p)).join("");
}

// Render Japanese with optional <ruby> furigana.
function JP({ text, style, className = "" }) {
  const parts = parseJP(text);
  return (
    <span className={"jp " + className} style={style}>
      {parts.map((p, i) =>
        Array.isArray(p) ? (
          <ruby key={i}>
            {p[0]}
            <rt>{p[1]}</rt>
          </ruby>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </span>
  );
}

// Japanese that shrinks to fit on one line before it's allowed to wrap.
// Measures the phrase at `maxSize` against the available width and scales down
// to at most `minSize`; only wraps if it still overflows at the floor.
function AutoFitJP({ text, maxSize, minSize = 20, lineHeight = 2.0, color = "var(--ink)", weight = 500 }) {
  const wrapRef = React.useRef(null);
  const measRef = React.useRef(null);
  const [size, setSize] = React.useState(maxSize);
  React.useLayoutEffect(() => {
    const wrap = wrapRef.current, meas = measRef.current;
    if (!wrap || !meas) return;
    const fit = () => {
      const avail = wrap.clientWidth;
      const natural = meas.scrollWidth; // measured at maxSize, no wrapping
      let s = maxSize;
      if (natural > avail && avail > 0) s = Math.max(minSize, Math.floor(maxSize * (avail / natural)));
      setSize(s);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [text, maxSize, minSize]);
  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <span
        ref={measRef}
        aria-hidden="true"
        style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", fontSize: maxSize, lineHeight, letterSpacing: "0.01em", left: 0, top: 0, pointerEvents: "none" }}
      >
        <JP text={text} />
      </span>
      <JP text={text} style={{ display: "block", fontSize: size, fontWeight: weight, lineHeight, color, letterSpacing: "0.01em" }} />
    </div>
  );
}

// ── Speech (Web Speech API), graceful fallback ──────────────
const Speech = {
  voice: null,
  ready: false,
  init() {
    if (this.ready || !("speechSynthesis" in window)) return;
    const score = (v) => {
      const n = (v.name || "").toLowerCase();
      let s = 0;
      if (/natural|premium|enhanced|neural|siri/.test(n)) s += 6;
      if (/google/.test(n)) s += 4;
      if (/kyoko|o-ren|oren|otoya|hattori|sayaka|nanami|ayumi|haruka|ichiro/.test(n)) s += 3;
      if (v.localService === false) s += 2; // network voices are usually higher quality
      return s;
    };
    const pick = () => {
      const vs = window.speechSynthesis.getVoices();
      const ja = vs.filter((v) => /^ja\b|ja[-_]?jp/i.test(v.lang || ""));
      this.voice = ja.slice().sort((a, b) => score(b) - score(a))[0] || null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
    this.ready = true;
  },
  speak(text, onState) {
    if (!("speechSynthesis" in window)) { onState && onState("unsupported"); return; }
    this.init();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(plainJP(text));
    u.lang = "ja-JP";
    if (this.voice) u.voice = this.voice;
    u.rate = 0.92;
    u.pitch = 1.02;
    u.onend = () => onState && onState("idle");
    u.onerror = () => onState && onState("idle");
    onState && onState("playing");
    window.speechSynthesis.speak(u);
  },
};

function AudioButton({ text, size = 44, label = true }) {
  const [state, setState] = React.useState("idle");
  const playing = state === "playing";
  return (
    <button
      onClick={(e) => { e.stopPropagation(); Speech.speak(text, setState); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 9,
        height: size, padding: label ? "0 16px 0 13px" : 0, width: label ? "auto" : size,
        justifyContent: "center",
        borderRadius: 999, cursor: "pointer",
        border: "1px solid var(--line-strong)",
        background: playing ? "var(--accent)" : "rgba(240,237,230,0.03)",
        color: playing ? "var(--accent-ink)" : "var(--ink-2)",
        fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600,
        letterSpacing: "0.02em",
        transition: "background 0.2s ease, color 0.2s ease, transform 0.1s ease",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Icon name={playing ? "sound-on" : "sound"} size={17} />
      {label && <span>{playing ? "Playing" : "Listen"}</span>}
    </button>
  );
}

// ── Icon set (thin, editorial line icons) ───────────────────
function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.6 }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
  };
  switch (name) {
    case "today":
      return (<svg {...common}><path d="M12 3a9 9 0 1 0 9 9" /><path d="M12 7v5l3 2" /></svg>);
    case "library":
      return (<svg {...common}><path d="M5 4h5v16H5zM14 4h5v16h-5z" /><path d="M10 8h4M10 12h4" /></svg>);
    case "you":
      return (<svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>);
    case "sound":
      return (<svg {...common}><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 9.5a3.5 3.5 0 0 1 0 5" /></svg>);
    case "sound-on":
      return (<svg {...common}><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8a5.5 5.5 0 0 1 0 8" /><path d="M19 5.5a9 9 0 0 1 0 13" /></svg>);
    case "close":
      return (<svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>);
    case "chevron-r":
      return (<svg {...common}><path d="M9 5l7 7-7 7" /></svg>);
    case "chevron-up":
      return (<svg {...common}><path d="M6 15l6-6 6 6" /></svg>);
    case "check":
      return (<svg {...common}><path d="M4 12.5l5 5L20 6" /></svg>);
    case "x-mark":
      return (<svg {...common}><path d="M6 6l12 12M18 6L6 18" /></svg>);
    case "arrow-up":
      return (<svg {...common}><path d="M12 19V5M6 11l6-6 6 6" /></svg>);
    case "arrow-r":
      return (<svg {...common}><path d="M5 12h13M12 6l6 6-6 6" /></svg>);
    case "spark":
      return (<svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></svg>);
    case "bookmark":
      return (<svg {...common}><path d="M6 4h12v16l-6-4-6 4z" /></svg>);
    case "book":
      return (<svg {...common}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 1 2-2h12" /></svg>);
    case "flame":
      return (<svg {...common}><path d="M12 3c1 3-2 4-2 7a3 3 0 0 0 6 0c0-1-.5-2-1-2.5C16 10 17 12 17 14a5 5 0 0 1-10 0c0-4 4-6 5-11z" /></svg>);
    case "dot-grid":
      return (<svg {...common}><circle cx="7" cy="7" r="1" fill={color} stroke="none"/><circle cx="12" cy="7" r="1" fill={color} stroke="none"/><circle cx="17" cy="7" r="1" fill={color} stroke="none"/><circle cx="7" cy="12" r="1" fill={color} stroke="none"/><circle cx="12" cy="12" r="1" fill={color} stroke="none"/><circle cx="17" cy="12" r="1" fill={color} stroke="none"/></svg>);
    default:
      return null;
  }
}

Object.assign(window, { parseJP, plainJP, JP, AutoFitJP, AudioButton, Icon, Speech });
