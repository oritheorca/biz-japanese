/* ============================================================
   cards.jsx — Lesson card types for the immersive feed
   Card types: intro, concept, vocab, dialogue, quiz-mc,
   quiz-match, quiz-arrange. Visual treatment from `cardStyle`.
   ============================================================ */

// Size a Japanese phrase down as it gets longer so it always fits.
function jpSize(text) {
  const n = window.plainJP(text).replace(/[。、！？]/g, "").length;
  if (n <= 7) return 44;
  if (n <= 11) return 36;
  if (n <= 16) return 30;
  if (n <= 22) return 25;
  return 21;
}

function chrome(cardStyle) {
  if (cardStyle === "framed")
    return {
      wrap: {
        background: "var(--raised)",
        border: "1px solid var(--line)",
        borderRadius: "calc(var(--radius) + 6px)",
        padding: "calc(var(--density-pad) + 4px)",
        boxShadow: "0 20px 50px -28px rgba(0,0,0,0.7)",
      },
      rules: true,
      align: "left",
    };
  if (cardStyle === "minimal")
    return { wrap: {}, rules: false, align: "center" };
  // editorial (default)
  return { wrap: {}, rules: true, align: "left" };
}

function Kicker({ children, align = "left" }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-ui)", fontSize: 11.5, fontWeight: 700,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--accent)", textAlign: align,
        display: "flex", alignItems: "center", gap: 8,
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      <span style={{ width: 16, height: 1, background: "var(--accent)", opacity: 0.6 }} />
      {children}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.04em", color: "var(--ink-3)",
        border: "1px solid var(--line)", borderRadius: 999,
        padding: "4px 11px", whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

// Wrapper giving every card a full-screen, vertically-centered stage.
function CardStage({ children, animKey, top = false }) {
  return (
    <section
      style={{
        height: "var(--screen-h, 100%)", width: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: top ? "flex-start" : "center",
        padding: top ? "150px var(--density-pad) 96px" : "118px var(--density-pad) 96px",
        position: "relative",
        overflowY: top ? "auto" : "visible",
      }}
      className={top ? "noscroll" : ""}
    >
      <div key={animKey}>
        {children}
      </div>
    </section>
  );
}

// ── Intro card ──────────────────────────────────────────────
function IntroCard({ card, cardStyle }) {
  const c = chrome(cardStyle);
  return (
    <CardStage animKey={card.title}>
      <div style={{ ...c.wrap, textAlign: c.align }}>
        <Kicker align={c.align}>{card.kicker}</Kicker>
        <h1
          style={{
            fontFamily: "var(--font-en)", fontWeight: 400,
            fontSize: 40, lineHeight: 1.08, color: "var(--ink)",
            margin: "20px 0 18px", letterSpacing: "-0.01em", textWrap: "balance",
          }}
        >
          {card.title}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-en)", fontSize: 18.5, lineHeight: 1.65,
            color: "var(--ink-2)", margin: 0, textWrap: "pretty",
          }}
        >
          {card.body}
        </p>
        <div
          style={{
            marginTop: 26, paddingTop: 18,
            borderTop: c.rules ? "1px solid var(--line)" : "none",
            fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600,
            letterSpacing: "0.06em", color: "var(--ink-3)", textTransform: "uppercase",
          }}
        >
          {card.meta}
        </div>
      </div>
    </CardStage>
  );
}

// ── Concept card ────────────────────────────────────────────
function ConceptCard({ card, cardStyle }) {
  const c = chrome(cardStyle);
  return (
    <CardStage animKey={card.title}>
      <div style={{ ...c.wrap, textAlign: c.align }}>
        <Kicker align={c.align}>{card.kicker}</Kicker>
        <h2
          style={{
            fontFamily: "var(--font-en)", fontWeight: 400, fontSize: 29,
            lineHeight: 1.18, color: "var(--ink)", margin: "16px 0 22px",
            letterSpacing: "-0.01em", textWrap: "balance",
          }}
        >
          {card.title}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {card.points.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: 14, padding: "15px 0",
                borderTop: i === 0 || !c.rules ? "none" : "1px solid var(--line)",
                textAlign: "left",
              }}
            >
              <div style={{ flexShrink: 0, paddingTop: 3 }}>
                <span
                  style={{
                    fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.04em", color: "var(--accent)",
                    border: "1px solid var(--line-strong)", borderRadius: 7,
                    padding: "4px 9px", whiteSpace: "nowrap",
                  }}
                >
                  {p.k}
                </span>
              </div>
              <p
                style={{
                  margin: 0, fontFamily: "var(--font-en)", fontSize: 17,
                  lineHeight: 1.5, color: "var(--ink-2)",
                }}
              >
                {renderInlineJP(p.v)}
              </p>
            </div>
          ))}
        </div>
        {card.note && (
          <div
            style={{
              marginTop: 20, padding: "14px 16px", borderRadius: "var(--radius)",
              background: "rgba(232,161,58,0.07)",
              border: "1px solid rgba(232,161,58,0.2)",
              fontFamily: "var(--font-en)", fontSize: 15.5, lineHeight: 1.5,
              color: "var(--ink)", textAlign: "left",
            }}
          >
            {renderInlineJP(card.note)}
          </div>
        )}
      </div>
    </CardStage>
  );
}

// Render a string that may contain {漢字|reading} inline among English.
function renderInlineJP(str) {
  // Split on runs containing CJK or braces vs plain ascii.
  const segs = str.split(/(\{[^}]*\}|[\u3000-\u30ff\u4e00-\u9fff。、！？「」（）]+(?:\{[^}]*\}[\u3000-\u30ff\u4e00-\u9fff。、！？「」（）]*)*)/g);
  return segs.map((s, i) => {
    if (!s) return null;
    if (/[\u3000-\u9fff]|\{/.test(s)) return <JP key={i} text={s} style={{ color: "var(--ink)", fontWeight: 500 }} />;
    return <React.Fragment key={i}>{s}</React.Fragment>;
  });
}

// ── Vocab card ──────────────────────────────────────────────
function VocabCard({ card, cardStyle }) {
  const c = chrome(cardStyle);
  const size = jpSize(card.jp);
  return (
    <CardStage animKey={card.jp}>
      <div style={{ ...c.wrap }}>
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <Kicker>{card.kicker}</Kicker>
          {card.tag && <Tag>{card.tag}</Tag>}
        </div>

        <div style={{ textAlign: c.align === "center" ? "center" : "left" }}>
          <AutoFitJP text={card.jp} maxSize={size} minSize={22} lineHeight={2.0} />
          <div className="romaji" style={{ marginTop: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-en)", fontStyle: "italic", fontSize: 16,
                color: "var(--ink-3)", letterSpacing: "0.01em",
              }}
            >
              {card.romaji}
            </span>
          </div>

          <div style={{ marginTop: 18, display: "flex", justifyContent: c.align === "center" ? "center" : "flex-start" }}>
            <AudioButton text={card.jp} />
          </div>

          <p
            style={{
              fontFamily: "var(--font-en)", fontSize: 21, lineHeight: 1.35,
              color: "var(--ink)", margin: "24px 0 4px", fontWeight: 400,
              textWrap: "pretty",
            }}
          >
            {card.en}
          </p>
          {card.literal && (
            <p
              style={{
                fontFamily: "var(--font-en)", fontStyle: "italic", fontSize: 14.5,
                color: "var(--ink-3)", margin: "0 0 4px",
              }}
            >
              {card.literal}
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: 20, paddingTop: 18,
            borderTop: c.rules ? "1px solid var(--line)" : "1px solid transparent",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--ink-3)", marginBottom: 8,
            }}
          >
            When to use it
          </div>
          <p
            style={{
              fontFamily: "var(--font-en)", fontSize: 16, lineHeight: 1.6,
              color: "var(--ink-2)", margin: 0, textWrap: "pretty",
            }}
          >
            {renderInlineJP(card.usage)}
          </p>
        </div>
      </div>
    </CardStage>
  );
}

// ── Dialogue card (script format) ───────────────────────────
function DialogueCard({ card, cardStyle }) {
  const c = chrome(cardStyle);
  return (
    <CardStage animKey={card.title}>
      <div style={{ ...c.wrap }}>
        <Kicker>{card.kicker}</Kicker>
        <h2
          style={{
            fontFamily: "var(--font-en)", fontWeight: 400, fontSize: 25,
            lineHeight: 1.2, color: "var(--ink)", margin: "14px 0 20px",
            letterSpacing: "-0.01em",
          }}
        >
          {card.title}
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {card.lines.map((ln, i) => {
            if (ln.who === "open") {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex", gap: 10, alignItems: "baseline",
                    paddingBottom: 14, marginBottom: 6,
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--ink-3)",
                    }}
                  >
                    {ln.role}
                  </span>
                  <JP text={ln.jp} style={{ fontSize: 17, color: "var(--ink)", fontWeight: 500 }} />
                </div>
              );
            }
            return (
              <div key={i} style={{ padding: "11px 0", display: "flex", gap: 12 }}>
                <span
                  style={{
                    flexShrink: 0, marginTop: 5, width: 5, height: 5, borderRadius: 999,
                    background: "var(--accent)", opacity: 0.8,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, justifyContent: "space-between" }}>
                    <JP text={ln.jp} style={{ fontSize: 19, lineHeight: 1.9, color: "var(--ink)", fontWeight: 500 }} />
                    <button
                      onClick={() => window.Speech.speak(ln.jp)}
                      style={{
                        flexShrink: 0, marginTop: 6, width: 30, height: 30, borderRadius: 999,
                        border: "1px solid var(--line)", background: "transparent",
                        color: "var(--ink-3)", cursor: "pointer", display: "grid", placeItems: "center",
                      }}
                      aria-label="Play line"
                    >
                      <Icon name="sound" size={14} />
                    </button>
                  </div>
                  {ln.note && (
                    <div
                      style={{
                        fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--ink-3)",
                        marginTop: 2, letterSpacing: "0.01em",
                      }}
                    >
                      {ln.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {card.caption && (
          <p
            style={{
              marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)",
              fontFamily: "var(--font-en)", fontStyle: "italic", fontSize: 15.5,
              lineHeight: 1.55, color: "var(--ink-2)", textWrap: "pretty",
            }}
          >
            {card.caption}
          </p>
        )}
      </div>
    </CardStage>
  );
}

// ── Quiz: multiple choice ───────────────────────────────────
function QuizMC({ card, onSolved }) {
  const [picked, setPicked] = React.useState(null);
  const answered = picked !== null;
  return (
    <CardStage animKey={card.q}>
      <QuizHead kicker={card.kicker} q={card.q} />
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 6 }}>
        {card.options.map((o, i) => {
          const isPicked = picked === i;
          const reveal = answered && (o.correct || isPicked);
          const good = o.correct;
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => { setPicked(i); if (o.correct) onSolved && onSolved(); }}
              style={{
                textAlign: "left", padding: "16px 18px", borderRadius: "var(--radius)",
                cursor: answered ? "default" : "pointer",
                border: reveal ? `1px solid ${good ? "var(--accent)" : "rgba(220,110,90,0.6)"}` : "1px solid var(--line-strong)",
                background: reveal ? (good ? "rgba(232,161,58,0.1)" : "rgba(220,110,90,0.08)") : "rgba(240,237,230,0.02)",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                transition: "all 0.2s ease",
              }}
            >
              <JP text={o.jp} style={{ fontSize: 19, color: "var(--ink)", fontWeight: 500, lineHeight: 1.9 }} />
              {reveal && (
                <span style={{ flexShrink: 0, color: good ? "var(--accent)" : "rgb(220,110,90)" }}>
                  <Icon name={good ? "check" : "x-mark"} size={18} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Reveal show={answered}><Explain text={card.explain} /></Reveal>
    </CardStage>
  );
}

// ── Quiz: match pairs ───────────────────────────────────────
function QuizMatch({ card, onSolved }) {
  const [sel, setSel] = React.useState(null); // selected jp index
  const [matched, setMatched] = React.useState({}); // jpIndex -> true
  const [wrong, setWrong] = React.useState(null);
  const ens = React.useMemo(() => {
    const arr = card.pairs.map((p, i) => ({ en: p.en, jpIndex: i }));
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }, [card]);
  const done = Object.keys(matched).length === card.pairs.length;
  React.useEffect(() => { if (done) onSolved && onSolved(); }, [done]);

  function tapEn(jpIndex) {
    if (sel === null || matched[sel]) return;
    if (jpIndex === sel) { setMatched((m) => ({ ...m, [sel]: true })); setSel(null); }
    else { setWrong(jpIndex); setTimeout(() => setWrong(null), 450); }
  }

  return (
    <CardStage animKey={card.q}>
      <QuizHead kicker={card.kicker} q={card.q} />
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {card.pairs.map((p, i) => (
            <button
              key={i}
              disabled={matched[i]}
              onClick={() => setSel(i)}
              style={{
                padding: "14px 12px", borderRadius: 14, cursor: matched[i] ? "default" : "pointer",
                border: `1px solid ${matched[i] ? "var(--accent)" : sel === i ? "var(--ink-2)" : "var(--line-strong)"}`,
                background: matched[i] ? "rgba(232,161,58,0.12)" : sel === i ? "rgba(240,237,230,0.06)" : "rgba(240,237,230,0.02)",
                opacity: matched[i] ? 0.65 : 1, transition: "all 0.18s ease", textAlign: "center",
              }}
            >
              <JP text={p.jp} style={{ fontSize: 16, color: "var(--ink)", fontWeight: 500, lineHeight: 1.95 }} />
            </button>
          ))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {ens.map((e, i) => {
            const isMatched = matched[e.jpIndex];
            const isWrong = wrong === e.jpIndex;
            return (
              <button
                key={i}
                disabled={isMatched}
                onClick={() => tapEn(e.jpIndex)}
                style={{
                  padding: "14px 12px", borderRadius: 14, cursor: isMatched ? "default" : "pointer",
                  border: `1px solid ${isMatched ? "var(--accent)" : isWrong ? "rgb(220,110,90)" : "var(--line-strong)"}`,
                  background: isMatched ? "rgba(232,161,58,0.12)" : "rgba(240,237,230,0.02)",
                  opacity: isMatched ? 0.65 : 1, transition: "all 0.18s ease",
                  fontFamily: "var(--font-en)", fontSize: 15, color: "var(--ink-2)", lineHeight: 1.35,
                }}
              >
                {e.en}
              </button>
            );
          })}
        </div>
      </div>
      <Reveal show={done}><Explain text={card.explain} /></Reveal>
    </CardStage>
  );
}

// ── Quiz: arrange ───────────────────────────────────────────
function QuizArrange({ card, onSolved }) {
  const shuffled = React.useMemo(() => {
    const arr = card.target.map((t, i) => ({ t, i }));
    for (let k = arr.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [arr[k], arr[j]] = [arr[j], arr[k]]; }
    return arr;
  }, [card]);
  const [order, setOrder] = React.useState([]); // array of original indices
  const [checked, setChecked] = React.useState(false);
  const used = new Set(order);
  const correct = checked && order.every((v, idx) => v === idx) && order.length === card.target.length;

  function check() {
    setChecked(true);
    if (order.length === card.target.length && order.every((v, idx) => v === idx)) onSolved && onSolved();
  }

  return (
    <CardStage animKey={card.q}>
      <QuizHead kicker={card.kicker} q={card.q} />
      {/* answer line */}
      <div
        style={{
          minHeight: 60, marginTop: 10, marginBottom: 18, padding: "12px 14px",
          borderRadius: "var(--radius)", border: "1px dashed var(--line-strong)",
          background: "rgba(240,237,230,0.02)", display: "flex", flexWrap: "wrap", gap: 8,
          alignItems: "center",
        }}
      >
        {order.length === 0 && (
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)" }}>Tap the pieces in order…</span>
        )}
        {order.map((origIdx, pos) => (
          <button
            key={pos}
            onClick={() => !checked && setOrder((o) => o.filter((_, p) => p !== pos))}
            style={{
              padding: "8px 12px", borderRadius: 10, cursor: checked ? "default" : "pointer",
              border: "1px solid var(--accent)", background: "rgba(232,161,58,0.12)",
            }}
          >
            <JP text={card.target[origIdx]} style={{ fontSize: 17, color: "var(--ink)", fontWeight: 500, lineHeight: 1.8 }} />
          </button>
        ))}
      </div>
      {/* piece bank */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
        {shuffled.map(({ t, i }) => (
          <button
            key={i}
            disabled={used.has(i) || checked}
            onClick={() => setOrder((o) => [...o, i])}
            style={{
              padding: "10px 14px", borderRadius: 11,
              cursor: used.has(i) || checked ? "default" : "pointer",
              border: "1px solid var(--line-strong)",
              background: used.has(i) ? "transparent" : "rgba(240,237,230,0.03)",
              opacity: used.has(i) ? 0.3 : 1, transition: "opacity 0.15s ease",
            }}
          >
            <JP text={t} style={{ fontSize: 18, color: "var(--ink)", fontWeight: 500, lineHeight: 1.8 }} />
          </button>
        ))}
      </div>
      {/* check button */}
      {!checked && order.length === card.target.length && (
        <button
          onClick={check}
          style={{
            marginTop: 20, width: "100%", padding: "14px", borderRadius: "var(--radius)",
            border: "none", background: "var(--accent)", color: "var(--accent-ink)",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 15, letterSpacing: "0.03em",
            cursor: "pointer",
          }}
        >
          Check answer
        </button>
      )}
      {checked && !correct && (
        <button
          onClick={() => { setChecked(false); setOrder([]); }}
          style={{
            marginTop: 16, width: "100%", padding: "13px", borderRadius: "var(--radius)",
            border: "1px solid var(--line-strong)", background: "transparent", color: "var(--ink-2)",
            fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}
        >
          Not quite, try again
        </button>
      )}
      <Reveal show={checked && correct}>
        <div style={{ marginTop: 16 }}>
          <div className="romaji" style={{ fontFamily: "var(--font-en)", fontStyle: "italic", fontSize: 15, color: "var(--ink-3)", marginBottom: 4 }}>
            {card.romaji}
          </div>
          <div style={{ fontFamily: "var(--font-en)", fontSize: 17, color: "var(--ink)" }}>{card.en}</div>
        </div>
        <Explain text={card.explain} />
      </Reveal>
    </CardStage>
  );
}

// ── Quiz shared bits ────────────────────────────────────────
function QuizHead({ kicker, q }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <Kicker>{kicker}</Kicker>
      <p
        style={{
          fontFamily: "var(--font-en)", fontSize: 23, lineHeight: 1.3, color: "var(--ink)",
          margin: "14px 0 18px", textWrap: "pretty",
        }}
      >
        {q}
      </p>
    </div>
  );
}

function Explain({ text }) {
  return (
    <div
      style={{
        marginTop: 18, padding: "14px 16px", borderRadius: "var(--radius)",
        background: "rgba(240,237,230,0.04)", border: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700,
          letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)",
          marginBottom: 7,
        }}
      >
        Why
      </div>
      <p style={{ margin: 0, fontFamily: "var(--font-en)", fontSize: 15.5, lineHeight: 1.55, color: "var(--ink-2)", textWrap: "pretty" }}>
        {renderInlineJP(text)}
      </p>
    </div>
  );
}

// ── Full email worked example ───────────────────────────────
function EmailCard({ card, cardStyle }) {
  return (
    <CardStage animKey={card.title}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Kicker>{card.kicker}</Kicker>
        <Tag>Full email</Tag>
      </div>
      <h2
        style={{
          fontFamily: "var(--font-en)", fontWeight: 400, fontSize: 23,
          lineHeight: 1.2, color: "var(--ink)", margin: "0 0 16px",
          letterSpacing: "-0.01em", textWrap: "balance",
        }}
      >
        {card.title}
      </h2>

      <div
        style={{
          background: "var(--bg-2)", border: "1px solid var(--line)",
          borderRadius: "calc(var(--radius) + 4px)", overflow: "hidden",
        }}
      >
        {/* header */}
        <div style={{ padding: "13px 16px", display: "flex", flexDirection: "column", gap: 7, borderBottom: "1px solid var(--line)" }}>
          <EmailHeadRow label="To" jp={card.to} />
          <EmailHeadRow label="Sub" jp={card.subject} />
        </div>
        {/* body */}
        <div style={{ padding: "16px 16px 14px", position: "relative" }}>
          {card.body.map((ln, i) => {
            const obj = typeof ln === "string" ? { jp: ln } : ln;
            if (obj.jp === "") return <div key={i} style={{ height: 10 }} />;
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  padding: "3px 0",
                  margin: "1px 0",
                }}
              >
                {obj.hi && (
                  <span
                    style={{
                      position: "absolute", left: -16, top: 2, bottom: 2,
                      width: 3, borderRadius: 999, background: "var(--accent)",
                    }}
                  />
                )}
                <JP
                  text={obj.jp}
                  style={{
                    fontSize: 15.5, lineHeight: 1.95,
                    color: obj.hi ? "var(--ink)" : "var(--ink-2)",
                    fontWeight: obj.hi ? 500 : 400,
                  }}
                />
              </div>
            );
          })}
          {card.signature && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              {card.signature.map((s, i) => (
                <JP key={i} text={s} style={{ display: "block", fontSize: 13, lineHeight: 1.7, color: "var(--ink-3)" }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {card.caption && (
        <p
          style={{
            marginTop: 16, fontFamily: "var(--font-en)", fontStyle: "italic",
            fontSize: 15, lineHeight: 1.55, color: "var(--ink-2)", textWrap: "pretty",
          }}
        >
          {renderInlineJP(card.caption)}
        </p>
      )}
    </CardStage>
  );
}

function EmailHeadRow({ label, jp }) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "baseline" }}>
      <span
        style={{
          flexShrink: 0, width: 30, fontFamily: "var(--font-ui)", fontSize: 10,
          fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--ink-3)", paddingTop: 2,
        }}
      >
        {label}
      </span>
      <JP text={jp} style={{ fontSize: 14.5, color: "var(--ink)", fontWeight: 500, lineHeight: 1.6 }} />
    </div>
  );
}

// Smoothly reveals content by animating height 0 → measured, so the
// centered card slides up as the explanation fades in (no instant jump).
function Reveal({ show, children }) {
  const ref = React.useRef(null);
  const [h, setH] = React.useState(0);
  React.useLayoutEffect(() => {
    if (ref.current) setH(show ? ref.current.scrollHeight : 0);
  }, [show, children]);
  return (
    <div
      style={{
        overflow: "hidden", height: h, opacity: show ? 1 : 0,
        transition: "height 0.46s cubic-bezier(0.2,0.7,0.2,1), opacity 0.4s ease",
        transitionDelay: show ? "0s, 0.12s" : "0s, 0s",
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

// ── Dispatcher ──────────────────────────────────────────────
function LessonCardView({ card, cardStyle, onSolved }) {
  switch (card.type) {
    case "intro": return <IntroCard card={card} cardStyle={cardStyle} />;
    case "concept": return <ConceptCard card={card} cardStyle={cardStyle} />;
    case "vocab": return <VocabCard card={card} cardStyle={cardStyle} />;
    case "dialogue": return <DialogueCard card={card} cardStyle={cardStyle} />;
    case "email": return <EmailCard card={card} cardStyle={cardStyle} />;
    case "quiz-mc": return <QuizMC card={card} onSolved={onSolved} />;
    case "quiz-match": return <QuizMatch card={card} onSolved={onSolved} />;
    case "quiz-arrange": return <QuizArrange card={card} onSolved={onSolved} />;
    default: return null;
  }
}

Object.assign(window, {
  LessonCardView, IntroCard, ConceptCard, VocabCard, DialogueCard, EmailCard,
  QuizMC, QuizMatch, QuizArrange, renderInlineJP, jpSize,
});
