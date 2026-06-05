/* ============================================================
   app.jsx — Shell, navigation, progress, tweaks, mount
   ============================================================ */

const FONT_PAIRS = {
  Editorial: { en: "'Spectral', Georgia, serif", jp: "'Noto Serif JP', serif" },
  Literary: { en: "'Newsreader', Georgia, serif", jp: "'Zen Old Mincho', serif" },
  "Modern Sans": { en: "'Hanken Grotesk', system-ui, sans-serif", jp: "'Noto Sans JP', sans-serif" },
};
const DENSITY = {
  compact: { pad: 20, gap: 12 },
  regular: { pad: 26, gap: 16 },
  comfy: { pad: 32, gap: 20 },
};
const ACCENT_INK = "#16140f";

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#e8a13a",
  "fontPair": "Editorial",
  "density": "regular",
  "radius": 18,
  "showFurigana": true,
  "showRomaji": false,
  "cardStyle": "editorial"
}/*EDITMODE-END*/;

const PROGRESS_KEY = "keigo-progress-v1";
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch (e) { return {}; }
}

function isNative() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    window.innerWidth <= 480
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState("today");
  const [lesson, setLesson] = React.useState(null); // subtopicId or null
  const [progress, setProgress] = React.useState(loadProgress);
  const [native, setNative] = React.useState(isNative);
  const streak = 4;

  React.useEffect(() => {
    const handler = () => { setNative(isNative()); fitDevice(); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // persist progress (max frac wins)
  function bumpProgress(id, frac) {
    setProgress((prev) => {
      const cur = prev[id]?.frac || 0;
      if (frac <= cur) return prev;
      const next = { ...prev, [id]: { frac } };
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }

  function resetProgress() {
    try { localStorage.removeItem(PROGRESS_KEY); } catch (e) {}
    setProgress({});
  }

  const pair = FONT_PAIRS[t.fontPair] || FONT_PAIRS.Editorial;
  const dens = DENSITY[t.density] || DENSITY.regular;

  const appVars = {
    "--accent": t.accent,
    "--accent-ink": ACCENT_INK,
    "--font-en": pair.en,
    "--font-jp": pair.jp,
    "--density-pad": dens.pad + "px",
    "--density-gap": dens.gap + "px",
    "--radius": t.radius + "px",
  };

  const cls = [
    native ? "native" : "",
    t.showFurigana ? "" : "furi-off",
    t.showRomaji ? "" : "romaji-off",
  ].filter(Boolean).join(" ");

  function openLesson(id) { setLesson(id); }
  function closeLesson() { setLesson(null); setTab("library"); }

  return (
    <div className={cls} style={{ ...appVars, position: "relative", height: native ? "var(--app-height, 100dvh)" : "100%", width: "100%", background: "var(--bg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* active screen — fills all space above the tab bar */}
      <div style={{ flex: 1, position: "relative", minHeight: 0, overflow: "hidden" }}>
        {tab === "today" && <TodayScreen progress={progress} onOpen={openLesson} streak={streak} />}
        {tab === "library" && <LibraryScreen progress={progress} onOpen={openLesson} />}
        {tab === "you" && <YouScreen progress={progress} streak={streak} onReset={resetProgress} />}
      </div>

      {/* bottom tab bar — normal flow, sits at the column's bottom */}
      <TabBar tab={tab} setTab={setTab} />

      {/* immersive lesson overlay */}
      {lesson && (
        <LessonFeed subtopicId={lesson} cardStyle={t.cardStyle} onClose={closeLesson} onProgress={bumpProgress} />
      )}

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Learning aids" />
        <TweakToggle label="Furigana (readings)" value={t.showFurigana} onChange={(v) => setTweak("showFurigana", v)} />
        <TweakToggle label="Romaji" value={t.showRomaji} onChange={(v) => setTweak("showRomaji", v)} />

        <TweakSection label="Lesson card style" />
        <TweakRadio label="Style" value={t.cardStyle} options={["editorial", "framed", "minimal"]} onChange={(v) => setTweak("cardStyle", v)} />

        <TweakSection label="Typography" />
        <TweakSelect label="Font pairing" value={t.fontPair} options={["Editorial", "Literary", "Modern Sans"]} onChange={(v) => setTweak("fontPair", v)} />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />

        <TweakSection label="Shape & color" />
        <TweakSlider label="Corner roundness" value={t.radius} min={2} max={28} step={1} unit="px" onChange={(v) => setTweak("radius", v)} />
        <TweakColor label="Accent" value={t.accent} options={["#e8a13a", "#d9683a", "#6fa88c", "#8a90d6"]} onChange={(v) => setTweak("accent", v)} />
      </TweaksPanel>
    </div>
  );
}

function TabBar({ tab, setTab }) {
  const tabs = [
    { id: "today", label: "Today", icon: "today" },
    { id: "library", label: "Library", icon: "library" },
    { id: "you", label: "You", icon: "you" },
  ];
  return (
    <div
      style={{
        flexShrink: 0, zIndex: 20,
        paddingBottom: "var(--pad-bottom-tab)", paddingTop: 14,
        display: "flex", justifyContent: "space-around", alignItems: "center",
        background: "var(--bg)",
        borderTop: "1px solid var(--line)",
      }}
    >
      {tabs.map((tb) => {
        const on = tab === tb.id;
        return (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              padding: "6px 18px", color: on ? "var(--accent)" : "var(--ink-3)",
              transition: "color 0.2s ease",
            }}
          >
            <Icon name={tb.icon} size={22} strokeWidth={on ? 1.9 : 1.5} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: on ? 700 : 600, letterSpacing: "0.04em" }}>{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Device scaling to fit viewport ──────────────────────────
function fitDevice() {
  const scaler = document.getElementById("scaler");
  if (!scaler) return;
  if (isNative()) {
    scaler.style.transform = "none";
    return;
  }
  const W = 402, H = 874, margin = 24;
  const s = Math.min((window.innerWidth - margin) / W, (window.innerHeight - margin) / H, 1);
  scaler.style.transform = `scale(${s})`;
}
window.addEventListener("resize", fitDevice);

function Root() {
  const [native, setNative] = React.useState(isNative);
  React.useEffect(() => {
    fitDevice();
    const handler = () => setNative(isNative());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (native) {
    return <App />;
  }
  return (
    <IOSDevice dark>
      <App />
    </IOSDevice>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
fitDevice();
