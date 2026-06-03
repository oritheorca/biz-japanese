/* ============================================================
   screens.jsx — Today, Library, You, and the immersive LessonFeed
   ============================================================ */

const C = window.CURRICULUM;

function pct(n) { return Math.round(n * 100); }

// Thin progress bar
function Bar({ value, height = 3 }) {
  return (
    <div style={{ height, borderRadius: 999, background: "var(--line-strong)", overflow: "hidden" }}>
      <div style={{ width: pct(value) + "%", height: "100%", background: "var(--accent)", borderRadius: 999, transition: "width 0.5s ease" }} />
    </div>
  );
}

// Segmented bar — one chunk per card
function SegmentBar({ value, count, height = 2.5 }) {
  const filled = Math.round(value * count);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ flex: 1, height, borderRadius: 999, background: i < filled ? "var(--accent)" : "rgba(240,237,230,0.25)", transition: "background 0.3s ease" }} />
      ))}
    </div>
  );
}

// ── Shared subtopic row ─────────────────────────────────────
function SubtopicRow({ id, progress, onOpen, last }) {
  const st = C.subtopics[id];
  const p = progress[id]?.frac || 0;
  return (
    <button
      onClick={() => onOpen(id)}
      style={{
        width: "100%", textAlign: "left", background: "transparent", border: "none",
        cursor: "pointer", padding: "16px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 14,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 7, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-en)", fontSize: 18, color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap" }}>{st.title}</span>
          <JP text={st.jp} style={{ fontSize: 13.5, color: "var(--ink-2)", whiteSpace: "nowrap" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}><SegmentBar value={p} count={st.cards.length} /></div>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-3)", fontWeight: 600, minWidth: 30, textAlign: "right" }}>
            {p > 0 ? pct(p) + "%" : st.cards.length + " cards"}
          </span>
        </div>
      </div>
      <Icon name="chevron-r" size={16} color="var(--ink-3)" />
    </button>
  );
}

// ── Today ───────────────────────────────────────────────────
function TodayScreen({ progress, onOpen, streak }) {
  const phrase = C.subtopics["email-vocab"].cards.find((c) => c.type === "vocab");
  // Walk every subtopic in module order; "Next up" = first one not finished.
  const allIds = C.modules.flatMap((m) => m.subtopics);
  const continueId = allIds.find((id) => (progress[id]?.frac || 0) < 1) || allIds[0];
  const cont = C.subtopics[continueId];
  const activeModule = C.modules.find((m) => m.id === cont.moduleId);
  // The remaining subtopics in that module, for the "Up next" list.
  return (
    <ScreenScroll>
      <div style={{ padding: "10px 24px 30px" }}>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="flame" size={14} color="var(--accent)" />
          <span>Tuesday, June 2 · {streak}-day streak</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-jp)", fontWeight: 500, fontSize: 32, color: "var(--ink)", margin: "12px 0 0", letterSpacing: "0.01em" }}>
          おはようございます。
        </h1>
      </div>

      {/* Continue hero */}
      <div style={{ padding: "0 24px" }}>
        <SectionLabel>Next up</SectionLabel>
        <button
          onClick={() => onOpen(continueId)}
          style={{
            width: "100%", textAlign: "left", cursor: "pointer", marginTop: 12,
            borderRadius: "calc(var(--radius) + 6px)", overflow: "hidden", position: "relative",
            border: "1px solid var(--line)",
            background: "linear-gradient(150deg, var(--raised) 0%, var(--bg-2) 100%)",
            padding: "22px 22px 20px",
          }}
        >
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)" }}>
            {activeModule.title} · {cont.title}
          </div>
          <div style={{ fontFamily: "var(--font-en)", fontSize: 24, color: "var(--ink)", margin: "12px 0 14px", lineHeight: 1.25, textWrap: "balance" }}>
            {cont.summary}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}><Bar value={progress[continueId]?.frac || 0} /></div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
              {(progress[continueId]?.frac || 0) > 0 ? "Resume" : "Start"} <Icon name="arrow-r" size={15} color="var(--accent)" />
            </span>
          </div>
        </button>
      </div>

      {/* Phrase of the day */}
      <div style={{ padding: "48px 24px 0" }}>
        <SectionLabel>Phrase of the day</SectionLabel>
        <div style={{ marginTop: 16, paddingBottom: 4 }}>
          <AutoFitJP text={phrase.jp} maxSize={jpSize(phrase.jp) - 2} minSize={20} lineHeight={2.0} />
          <div className="romaji" style={{ fontFamily: "var(--font-en)", fontStyle: "italic", fontSize: 15, color: "var(--ink-3)", margin: "8px 0 2px" }}>{phrase.romaji}</div>
          <p style={{ fontFamily: "var(--font-en)", fontSize: 18, color: "var(--ink-2)", margin: "8px 0 14px" }}>{phrase.en}</p>
          <AudioButton text={phrase.jp} />
        </div>
      </div>

      {/* Recommended */}
      <div style={{ padding: "48px 24px 0" }}>
        <SectionLabel>Up next in {activeModule.title}</SectionLabel>
        <div style={{ marginTop: 4 }}>
          {activeModule.subtopics.map((id, i, arr) => (
            <SubtopicRow key={id} id={id} progress={progress} onOpen={onOpen} last={i === arr.length - 1} />
          ))}
        </div>
      </div>
    </ScreenScroll>
  );
}

// ── Library ─────────────────────────────────────────────────
function LibraryScreen({ progress, onOpen }) {
  const [open, setOpen] = React.useState(C.modules[0].id);
  function moduleProgress(m) {
    if (!m.subtopics.length) return 0;
    const sum = m.subtopics.reduce((a, id) => a + (progress[id]?.frac || 0), 0);
    return sum / m.subtopics.length;
  }
  return (
    <ScreenScroll>
      <div style={{ padding: "10px 24px 22px" }}>
        <h1 style={{ fontFamily: "var(--font-en)", fontWeight: 400, fontSize: 33, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>Library</h1>
      </div>
      <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {C.modules.map((m) => {
          const live = m.subtopics.length > 0;
          const isOpen = open === m.id && live;
          return (
            <div
              key={m.id}
              style={{
                borderRadius: "calc(var(--radius) + 6px)", border: "1px solid var(--line)",
                background: "var(--bg-2)", overflow: "hidden",
                opacity: live ? 1 : 0.55,
              }}
            >
              <button
                onClick={() => live && setOpen(isOpen ? null : m.id)}
                style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: live ? "pointer" : "default", padding: "20px 20px 18px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)" }}>{m.kicker}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "9px 0 0", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-en)", fontSize: 25, color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap" }}>{m.title}</span>
                      <JP text={m.jp} style={{ fontSize: 16, color: "var(--ink-2)", whiteSpace: "nowrap" }} />
                    </div>
                  </div>
                  {live ? (
                    <span style={{ flexShrink: 0, marginTop: 4, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s ease" }}>
                      <Icon name="chevron-up" size={18} color="var(--ink-3)" />
                    </span>
                  ) : (
                    <span style={{ flexShrink: 0, fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", border: "1px solid var(--line)", borderRadius: 999, padding: "5px 10px", whiteSpace: "nowrap" }}>Soon</span>
                  )}
                </div>
                <p style={{ fontFamily: "var(--font-en)", fontSize: 15.5, lineHeight: 1.5, color: "var(--ink-2)", margin: "12px 0 0", textWrap: "pretty" }}>{m.blurb}</p>
                {live && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                    <div style={{ flex: 1 }}><Bar value={moduleProgress(m)} /></div>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, color: "var(--ink-3)" }}>{m.subtopics.length} topics</span>
                  </div>
                )}
              </button>
              {isOpen && (
                <div style={{ padding: "0 20px 8px" }}>
                  <div style={{ borderTop: "1px solid var(--line)" }}>
                    {m.subtopics.map((id, i, arr) => (
                      <SubtopicRow key={id} id={id} progress={progress} onOpen={onOpen} last={i === arr.length - 1} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScreenScroll>
  );
}

// ── You / progress ──────────────────────────────────────────
function YouScreen({ progress, streak, onReset }) {
  const allSubs = Object.keys(C.subtopics);
  const learned = allSubs.reduce((a, id) => a + Math.round((progress[id]?.frac || 0) * C.subtopics[id].cards.filter((c) => c.type === "vocab").length), 0);
  const completed = allSubs.filter((id) => (progress[id]?.frac || 0) >= 1).length;
  return (
    <ScreenScroll>
      <div style={{ padding: "10px 24px 22px" }}>
        <h1 style={{ fontFamily: "var(--font-en)", fontWeight: 400, fontSize: 33, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>Your progress</h1>
      </div>
      <div style={{ padding: "0 24px", display: "flex", gap: 12 }}>
        <Stat n={streak} label="Day streak" icon="flame" />
        <Stat n={learned} label="Phrases learned" icon="bookmark" />
        <Stat n={completed} label="Subtopics done" icon="check" />
      </div>
      <div style={{ padding: "30px 24px 0" }}>
        <SectionLabel>By module</SectionLabel>
        <div style={{ marginTop: 8 }}>
          {C.modules.filter((m) => m.subtopics.length).map((m) => {
            const frac = m.subtopics.reduce((a, id) => a + (progress[id]?.frac || 0), 0) / m.subtopics.length;
            return (
              <div key={m.id} style={{ padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                  <span style={{ fontFamily: "var(--font-en)", fontSize: 18, color: "var(--ink)" }}>{m.title}</span>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>{pct(frac)}%</span>
                </div>
                <Bar value={frac} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "26px 24px 0" }}>
        <div style={{ padding: "18px 20px", borderRadius: "calc(var(--radius) + 4px)", border: "1px solid rgba(232,161,58,0.22)", background: "rgba(232,161,58,0.06)" }}>
          <div style={{ fontFamily: "var(--font-en)", fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: "var(--ink)" }}>
            “Politeness in Japanese isn't decoration: it's the structure that carries the meaning.”
          </div>
        </div>
      </div>

      <div style={{ padding: "30px 24px 0" }}>
        <ResetProgress onReset={onReset} />
      </div>
    </ScreenScroll>
  );
}

function ResetProgress({ onReset }) {
  const [confirm, setConfirm] = React.useState(false);
  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        style={{
          width: "100%", padding: "14px", borderRadius: "var(--radius)",
          border: "1px solid var(--line)", background: "transparent",
          color: "var(--ink-3)", cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600, letterSpacing: "0.02em",
        }}
      >
        Reset all progress
      </button>
    );
  }
  return (
    <div style={{ padding: "16px 18px", borderRadius: "var(--radius)", border: "1px solid rgba(220,110,90,0.4)", background: "rgba(220,110,90,0.06)" }}>
      <div style={{ fontFamily: "var(--font-en)", fontSize: 15.5, color: "var(--ink)", lineHeight: 1.45, marginBottom: 14 }}>
        Reset progress on all modules? This can't be undone.
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => { onReset(); setConfirm(false); }}
          style={{
            flex: 1, padding: "11px", borderRadius: 12, border: "none",
            background: "rgb(200,96,78)", color: "#fff", cursor: "pointer",
            fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 700,
          }}
        >
          Reset everything
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{
            flex: 1, padding: "11px", borderRadius: 12,
            border: "1px solid var(--line-strong)", background: "transparent",
            color: "var(--ink-2)", cursor: "pointer",
            fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Stat({ n, label, icon }) {
  return (
    <div style={{ flex: 1, padding: "16px 14px", borderRadius: "var(--radius)", border: "1px solid var(--line)", background: "var(--bg-2)" }}>
      <Icon name={icon} size={16} color="var(--accent)" />
      <div style={{ fontFamily: "var(--font-en)", fontSize: 28, color: "var(--ink)", margin: "8px 0 2px", fontWeight: 500 }}>{n}</div>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--ink-3)", fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-3)" }}>
      {children}
    </div>
  );
}

// Standard scrollable screen body (under the header, above tab bar).
function ScreenScroll({ children }) {
  return (
    <div className="noscroll" style={{
      position: "absolute", inset: 0, overflowY: "auto",
      paddingTop: "var(--pad-top)",
      paddingBottom: "calc(120px + var(--safe-bottom))",
    }}>
      {children}
    </div>
  );
}

// ── Immersive lesson feed ───────────────────────────────────
function LessonFeed({ subtopicId, cardStyle, onClose, onProgress }) {
  const st = C.subtopics[subtopicId];
  const scroller = React.useRef(null);
  const [active, setActive] = React.useState(0);
  const [screenH, setScreenH] = React.useState(0);
  const [solved, setSolved] = React.useState({});

  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setScreenH(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onScroll(e) {
    const h = e.target.clientHeight || 1;
    const idx = Math.round(e.target.scrollTop / h);
    if (idx !== active) {
      setActive(idx);
      onProgress(subtopicId, Math.min(1, (idx + 1) / st.cards.length));
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--bg)", zIndex: 40 }}>
      {/* top chrome: story segments + title + close */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, padding: "var(--lesson-pad-top) 16px 10px", background: "linear-gradient(180deg, var(--bg) 35%, rgba(19,18,23,0.6) 80%, transparent)" }}>
        <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
          {st.cards.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2, borderRadius: 999, background: i <= active ? "var(--accent)" : "rgba(240,237,230,0.18)", transition: "background 0.3s ease" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{st.title}</span>
            <JP text={st.jp} style={{ fontSize: 12, color: "var(--ink-3)", whiteSpace: "nowrap" }} />
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 999, border: "1px solid var(--line)", background: "rgba(19,18,23,0.6)", color: "var(--ink-2)", cursor: "pointer", display: "grid", placeItems: "center" }} aria-label="Close lesson">
            <Icon name="close" size={16} />
          </button>
        </div>
      </div>

      {/* scroll-snap feed */}
      <div
        ref={scroller}
        className="noscroll feed-snap"
        onScroll={onScroll}
        style={{ position: "absolute", inset: 0, overflowY: "auto", "--screen-h": screenH ? screenH + "px" : "100%" }}
      >
        {st.cards.map((card, i) => (
          <div key={i} style={{ height: screenH ? screenH + "px" : "100%" }}>
            <LessonCardView card={card} cardStyle={cardStyle} onSolved={() => setSolved((s) => ({ ...s, [i]: true }))} />
          </div>
        ))}
        {/* completion coda */}
        <div style={{ height: screenH ? screenH + "px" : "100%" }}>
          <CompletionCard st={st} onClose={onClose} onProgress={onProgress} subtopicId={subtopicId} />
        </div>
      </div>

      {/* swipe hint, only on first card */}
      {active === 0 && (
        <div style={{ position: "absolute", bottom: 26, left: 0, right: 0, textAlign: "center", pointerEvents: "none", zIndex: 3 }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, color: "var(--ink-3)" }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, letterSpacing: "0.08em", fontWeight: 600 }}>Swipe up to begin</span>
            <span style={{ opacity: 0.7 }}><Icon name="arrow-up" size={16} /></span>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletionCard({ st, onClose, onProgress, subtopicId }) {
  return (
    <section style={{ height: "var(--screen-h,100%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "84px 30px" }}>
      <div>
        <div style={{ color: "var(--accent)", marginBottom: 16, display: "flex", justifyContent: "center" }}><Icon name="spark" size={30} /></div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)" }}>Subtopic complete</div>
        <h2 style={{ fontFamily: "var(--font-en)", fontWeight: 400, fontSize: 32, color: "var(--ink)", margin: "14px 0 10px", lineHeight: 1.15 }}>{st.title}</h2>
        <JP text={st.jp} style={{ fontSize: 18, color: "var(--ink-2)" }} />
        <p style={{ fontFamily: "var(--font-en)", fontSize: 17, color: "var(--ink-2)", margin: "20px 0 28px", lineHeight: 1.55, maxWidth: 300 }}>
          You've got the building blocks. They'll resurface in later modules. That's how they stick.
        </p>
        <button onClick={onClose} style={{ padding: "14px 30px", borderRadius: 999, border: "none", background: "var(--accent)", color: "var(--accent-ink)", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em", cursor: "pointer" }}>
            Back to library
        </button>
      </div>
    </section>
  );
}

Object.assign(window, { TodayScreen, LibraryScreen, YouScreen, LessonFeed, ScreenScroll });
