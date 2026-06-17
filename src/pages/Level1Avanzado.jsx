/**
 * Nivel 1 del módulo AVANZADO: ejercicios complejos de análisis de circuitos.
 * Evalúa la respuesta del estudiante contra una serie de casos predefinidos.
 */
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { awardLevelXP } from "@/lib/progress";

const EXERCISES = [
  {
    titleKey: "level1Avanzado.ex1.title",
    descKey: "level1Avanzado.ex1.desc",
    type: "series",
    initialResistors: [
      { id: "R1", val: 100, label: "R1", type: "series" },
      { id: "R2", val: 150, label: "R2", type: "series" },
      { id: "R3", val: 220, label: "R3", type: "series" },
      { id: "R4", val: 330, label: "R4", type: "series" },
    ],
  },
  {
    titleKey: "level1Avanzado.ex2.title",
    descKey: "level1Avanzado.ex2.desc",
    type: "parallel",
    initialResistors: [
      { id: "R1", val: 100, label: "R1", type: "parallel", group: 0 },
      { id: "R2", val: 200, label: "R2", type: "parallel", group: 0 },
      { id: "R3", val: 300, label: "R3", type: "parallel", group: 1 },
      { id: "R4", val: 150, label: "R4", type: "parallel", group: 1 },
    ],
  },
  {
    titleKey: "level1Avanzado.ex3.title",
    descKey: "level1Avanzado.ex3.desc",
    type: "mixed",
    initialResistors: [
      { id: "R1", val: 100, label: "R1", type: "series" },
      { id: "R2", val: 200, label: "R2", type: "parallel" },
      { id: "R3", val: 200, label: "R3", type: "parallel" },
      { id: "R4", val: 150, label: "R4", type: "series" },
    ],
  },
];

// Platform palette (matches Level1Medio theming)
const C = {
  bg: "hsl(222, 47%, 11%)",
  bg2: "hsl(217, 33%, 17%)",
  bg3: "hsl(217, 33%, 20%)",
  border: "hsl(217, 33%, 28%)",
  text: "hsl(210, 40%, 96%)",
  muted: "hsl(215, 20%, 70%)",
  mutedDim: "hsl(215, 20%, 55%)",
  accent: "#a78bfa", // advanced module color
  accentDim: "rgba(167,139,250,0.12)",
  accentBorder: "rgba(167,139,250,0.45)",
  accentText: "hsl(252, 95%, 80%)",
  series: "#22d3ee",
  seriesDim: "rgba(34,211,238,0.15)",
  seriesBorder: "rgba(34,211,238,0.45)",
  parallel: "#a78bfa",
  parallelDim: "rgba(167,139,250,0.15)",
  parallelBorder: "rgba(167,139,250,0.45)",
};

function fmt(v) { return Math.round(v * 100) / 100; }

function calcReduction(resistors, ids, rType) {
  const vals = ids.map(id => resistors.find(r => r.id === id)?.val).filter(v => v != null);
  if (vals.length < 2) return null;
  if (rType === "series") return vals.reduce((a, b) => a + b, 0);
  if (rType === "parallel") return 1 / vals.reduce((a, b) => a + 1 / b, 0);
  return null;
}

function ResistorBox({ r, selected, onClick, color, colorDim, colorBorder }) {
  const sel = selected.includes(r.id);
  return (
    <div onClick={() => !r.reduced && onClick(r.id)} style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      width: 80, padding: "6px 8px", borderRadius: 8,
      background: sel ? colorDim : C.bg2,
      border: `${sel ? 1.5 : 1}px solid ${sel ? colorBorder : C.border}`,
      cursor: r.reduced ? "not-allowed" : "pointer",
      opacity: r.reduced ? 0.4 : 1,
      transition: "all .15s",
    }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: sel ? color : C.muted }}>{r.label}</span>
      <span style={{ fontSize: 12, fontFamily: "monospace", color: sel ? color : C.text }}>{fmt(r.val)}Ω</span>
    </div>
  );
}

function ReferenceModal({ onClose, t }) {
  return (
    <div style={{ padding: "1.5rem 0", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: C.text }}>{t("level1Avanzado.quickRef")}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.muted }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: C.muted, marginBottom: "1rem" }}>
          <div style={{ background: C.seriesDim, border: `1px solid ${C.seriesBorder}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontWeight: 500, color: C.series, marginBottom: 4 }}>{t("level1Avanzado.seriesRes")}</div>
            <div style={{ color: C.series, fontFamily: "monospace" }}>R_T = R1 + R2 + ... + Rn</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{t("level1Avanzado.seriesDesc")}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{t("level1Avanzado.seriesEx")}</div>
          </div>
          <div style={{ background: C.parallelDim, border: `1px solid ${C.parallelBorder}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontWeight: 500, color: C.parallel, marginBottom: 4 }}>{t("level1Avanzado.parallelRes")}</div>
            <div style={{ color: C.parallel, fontFamily: "monospace" }}>R_T = (R1 × R2) / (R1 + R2)</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{t("level1Avanzado.parallelDesc")}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{t("level1Avanzado.parallelEx")}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "7px 18px", borderRadius: 8, border: `1px solid ${C.accentBorder}`, background: C.accentDim, fontSize: 12, cursor: "pointer", color: C.accentText, fontWeight: 500 }}>
            {t("level1Avanzado.understood")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Level1Avanzado() {
  const { t } = useTranslation();
  const [screen, setScreen] = useState("intro");
  const [qIdx, setQIdx] = useState(0);
  const [resistors, setResistors] = useState([]);
  const [selected, setSelected] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState({ type: "info", text: "" });
  const [completed, setCompleted] = useState([false, false, false]);

  useEffect(() => {
    if (screen === "game") loadExercise(qIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, screen]);

  function loadExercise(idx) {
    const ex = EXERCISES[idx];
    setResistors(ex.initialResistors.map(r => ({ ...r, reduced: false })));
    setSelected([]); setHistory([]); setInputVal("");
    setMsg({ type: "info", text: t("level1Avanzado.msgSelectTwo") });
  }

  function toggleSelect(id) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      const next = [...prev, id];
      if (next.length > 2) return [prev[1], id];
      return next;
    });
  }

  function detectType(ids) {
    const nodes = resistors.filter(r => ids.includes(r.id));
    if (nodes.length < 2) return null;
    const types = new Set(nodes.map(n => n.type));
    return types.size === 1 ? [...types][0] : null;
  }

  function reduce() {
    if (selected.length < 2) { setMsg({ type: "warn", text: t("level1Avanzado.msgPickTwoFirst") }); return; }
    const type = detectType(selected);
    if (!type) { setMsg({ type: "err", text: t("level1Avanzado.msgDifferentTypes") }); return; }
    const correct = calcReduction(resistors, selected, type);
    const entered = parseFloat(inputVal);
    if (isNaN(entered)) { setMsg({ type: "warn", text: t("level1Avanzado.msgEnterValue") }); return; }
    if (Math.abs(entered - correct) > 0.1) {
      const vals = selected.map(id => fmt(resistors.find(r => r.id === id)?.val));
      const formula = type === "series"
        ? `${vals.join(" + ")} = ${fmt(correct)} Ω`
        : `(${vals.join("×")})/(${vals.join("+")}) = ${fmt(correct)} Ω`;
      setMsg({ type: "err", text: t("level1Avanzado.msgWrong", { kind: type === "series" ? t("level1Avanzado.series") : t("level1Avanzado.parallel"), formula, got: fmt(entered) }) });
      return;
    }
    const names = selected.map(id => resistors.find(r => r.id === id)?.label).join(" + ");
    const newResistors = resistors.map(r => selected.includes(r.id) ? { ...r, reduced: true } : r);
    const active = newResistors.filter(r => !r.reduced);
    const newR = { id: "Rx" + Date.now(), val: correct, label: `Req(${names})`, type: active.length > 0 ? active[0].type : type, reduced: false };
    const finalList = [...newResistors, newR];
    setResistors(finalList);
    setHistory(h => [...h, { names, type, result: fmt(correct) }]);
    setSelected([]); setInputVal("");
    const stillActive = finalList.filter(r => !r.reduced);
    if (stillActive.length === 1) {
      setMsg({ type: "ok", text: t("level1Avanzado.msgDone", { val: fmt(stillActive[0].val) }) });
      const nc = [...completed]; nc[qIdx] = true; setCompleted(nc);
      if (qIdx < 2) setTimeout(() => setQIdx(q => q + 1), 2000);
    } else {
      setMsg({ type: "ok", text: t("level1Avanzado.msgKeepGoing", { names, val: fmt(correct) }) });
    }
  }

  function giveHint() {
    const active = resistors.filter(r => !r.reduced);
    for (let i = 0; i < active.length - 1; i++) {
      if (active[i].type === active[i + 1].type) {
        const ids = [active[i].id, active[i + 1].id];
        const c = calcReduction(active, ids, active[i].type);
        setMsg({
          type: "info",
          text: t("level1Avanzado.hintPair", {
            a: active[i].label, av: fmt(active[i].val),
            b: active[i + 1].label, bv: fmt(active[i + 1].val),
            kind: active[i].type === "series" ? t("level1Avanzado.series") : t("level1Avanzado.parallel"),
            val: fmt(c),
          }),
        });
        return;
      }
    }
    setMsg({ type: "info", text: t("level1Avanzado.hintGeneric") });
  }

  const activeResistors = resistors.filter(r => !r.reduced);

  const msgStyles = {
    info: { bg: C.bg2, border: C.border, color: C.muted, icon: "ℹ️" },
    ok:   { bg: "hsl(142, 70%, 14%)", border: "hsl(142, 71%, 45%)", color: "hsl(142, 71%, 70%)", icon: "✅" },
    err:  { bg: "hsl(0, 60%, 18%)",   border: "hsl(0, 84%, 60%)",   color: "hsl(0, 90%, 80%)",   icon: "❌" },
    warn: { bg: "hsl(38, 60%, 18%)",  border: "hsl(38, 92%, 50%)",  color: "hsl(38, 95%, 75%)",  icon: "⚠️" },
  };
  const ms = msgStyles[msg.type];

  if (screen === "book") return <ReferenceModal onClose={() => setScreen("game")} t={t} />;

  if (screen === "intro") return (
    <div style={{ padding: "1.5rem 0", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span style={{ fontSize: 17, fontWeight: 500, color: C.text }}>{t("level1Avanzado.introTitle")}</span>
        </div>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 12 }}>
          {t("level1Avanzado.introDesc")}
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: C.seriesDim, color: C.series, border: `1px solid ${C.seriesBorder}`, fontWeight: 500 }}>{t("level1Avanzado.chipSeries")}</span>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: C.parallelDim, color: C.parallel, border: `1px solid ${C.parallelBorder}`, fontWeight: 500 }}>{t("level1Avanzado.chipParallel")}</span>
        </div>
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: "1rem" }}>
          <strong style={{ fontWeight: 500, color: C.text }}>{t("level1Avanzado.howToPlay")}</strong><br />
          {t("level1Avanzado.how1")}<br />
          {t("level1Avanzado.how2")}<br />
          {t("level1Avanzado.how3")}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => setScreen("book")} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg2, fontSize: 12, cursor: "pointer", color: C.muted }}>
            📖 {t("level1Avanzado.reference")}
          </button>
          <button onClick={() => setScreen("game")} style={{ padding: "7px 18px", borderRadius: 8, border: `1px solid ${C.accentBorder}`, background: C.accentDim, fontSize: 12, cursor: "pointer", color: C.accentText, fontWeight: 500 }}>
            ▶ {t("level1Avanzado.start")}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "1.5rem 0", maxWidth: 640, margin: "0 auto", fontFamily: "sans-serif", color: C.text }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t("level1Avanzado.headerTitle")}</span>
          <span style={{ fontSize: 12, color: C.muted, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, padding: "3px 10px" }}>{t("level1Avanzado.headerSubtitle")}</span>
        </div>
        <button onClick={() => setScreen("book")} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg2, cursor: "pointer", color: C.muted }}>
          📖 {t("level1Avanzado.reference")}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
        <span style={{ fontSize: 11, color: C.mutedDim, whiteSpace: "nowrap" }}>{t("level1Avanzado.progress")}</span>
        <div style={{ flex: 1, height: 5, background: C.bg3, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(completed.filter(Boolean).length / 3) * 100}%`, background: C.accent, borderRadius: 99, transition: "width .5s" }} />
        </div>
        <span style={{ fontSize: 11, color: C.mutedDim }}>{completed.filter(Boolean).length} / 3</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: "1.2rem", flexWrap: "wrap" }}>
        {EXERCISES.map((ex, i) => (
          <div key={i} style={{
            fontSize: 11, padding: "3px 11px", borderRadius: 99,
            background: completed[i] ? "hsl(142, 70%, 14%)" : i === qIdx ? C.accentDim : C.bg2,
            border: `1px solid ${completed[i] ? "hsl(142, 71%, 45%)" : i === qIdx ? C.accentBorder : C.border}`,
            color: completed[i] ? "hsl(142, 71%, 70%)" : i === qIdx ? C.accentText : C.muted,
            fontWeight: i === qIdx ? 500 : 400
          }}>
            {t(ex.titleKey)}
          </div>
        ))}
      </div>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{t(EXERCISES[qIdx].titleKey)}</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: "1rem", lineHeight: 1.5 }}>{t(EXERCISES[qIdx].descKey)}</div>

        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "1rem", marginBottom: ".75rem", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minHeight: 60 }}>
            {activeResistors.map((r, i) => (
              <React.Fragment key={r.id}>
                <ResistorBox
                  r={r}
                  selected={selected}
                  onClick={toggleSelect}
                  color={r.type === "series" ? C.series : C.parallel}
                  colorDim={r.type === "series" ? C.seriesDim : C.parallelDim}
                  colorBorder={r.type === "series" ? C.seriesBorder : C.parallelBorder}
                />
                {i < activeResistors.length - 1 && (
                  <span style={{ fontSize: 16, color: C.mutedDim }}>—</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: ".75rem" }}>
          <span style={{ fontSize: 13, color: C.muted }}>
            {selected.length === 0
              ? t("level1Avanzado.selectedNone")
              : selected.map(id => { const r = resistors.find(x => x.id === id); return r ? `${r.label}(${fmt(r.val)}Ω)` : id; }).join(" + ")}
          </span>
          <span style={{ fontSize: 13, color: C.muted }}>=</span>
          <input
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="? Ω"
            min="0"
            style={{ width: 110, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, textAlign: "center", padding: "0 8px", fontFamily: "monospace", background: C.bg2, color: C.text }}
          />
          <span style={{ fontSize: 13, color: C.muted }}>Ω</span>
          <button onClick={reduce} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.accentBorder}`, background: C.accentDim, fontSize: 12, cursor: "pointer", color: C.accentText, fontWeight: 500 }}>
            ✓ {t("level1Avanzado.reduce")}
          </button>
        </div>

        <div style={{ minHeight: 38, borderRadius: 8, border: `1px solid ${ms.border}`, background: ms.bg, padding: "8px 14px", fontSize: 12, color: ms.color, display: "flex", alignItems: "center", gap: 7 }}>
          {ms.icon} {msg.text}
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: ".75rem" }}>{t("level1Avanzado.reductionsDone")}</div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 0",
              borderBottom: i < history.length - 1 ? `1px solid ${C.border}` : "none",
              fontSize: 12, color: C.muted
            }}>
              <span style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 99, fontWeight: 500,
                background: h.type === "series" ? C.seriesDim : C.parallelDim,
                color: h.type === "series" ? C.series : C.parallel,
                border: `1px solid ${h.type === "series" ? C.seriesBorder : C.parallelBorder}`,
              }}>
                {h.type === "series" ? t("level1Avanzado.series") : t("level1Avanzado.parallel")}
              </span>
              <span>{h.names}</span>
              <span>→</span>
              <span style={{ fontWeight: 500, color: C.text, fontFamily: "monospace" }}>{h.result} Ω</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={() => loadExercise(qIdx)} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg2, fontSize: 12, cursor: "pointer", color: C.muted }}>
          🔄 {t("level1Avanzado.restart")}
        </button>
        <button onClick={giveHint} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg2, fontSize: 12, cursor: "pointer", color: C.muted }}>
          💡 {t("level1Avanzado.hint")}
        </button>
      </div>
    </div>
  );
}
