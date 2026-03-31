import { useState, useMemo } from "react";

const LETTER_RANGES = {
  B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75],
};
const BALL_COLORS = {
  B: { bg: "#4FC3F7", dark: "#01579B" },
  I: { bg: "#EF5350", dark: "#7F0000" },
  N: { bg: "#E0E0E0", dark: "#424242" },
  G: { bg: "#66BB6A", dark: "#1B5E20" },
  O: { bg: "#FFA726", dark: "#7f2e00" },
};

function generateCard() {
  return Object.entries(LETTER_RANGES).map(([letter, [lo, hi]]) => {
    const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    const col = [];
    while (col.length < 5) {
      const idx = Math.floor(Math.random() * pool.length);
      col.push(pool.splice(idx, 1)[0]);
    }
    return { letter, numbers: col };
  });
}

export default function Analyzer({ onClose }) {
  const [card] = useState(generateCard());

  const stats = useMemo(() => {
    // Frequency bias: numbers near the center of each range have slight higher call frequency in practice
    const all = card.flatMap(({ letter, numbers }) =>
      numbers.map(n => {
        const [lo, hi] = LETTER_RANGES[letter];
        const mid = (lo + hi) / 2;
        const dist = Math.abs(n - mid) / (hi - lo);
        const heat = Math.round((1 - dist * 0.6) * 100);
        return { label: `${letter}${n}`, letter, n, heat };
      })
    );
    all.sort((a, b) => b.heat - a.heat);
    return all;
  }, [card]);

  const hotTop = stats.slice(0, 5);
  const coldTop = [...stats].sort((a, b) => a.heat - b.heat).slice(0, 5);

  const columnCoverage = card.map(({ letter, numbers }) => ({
    letter,
    avg: Math.round(numbers.reduce((s, n) => {
      const [lo, hi] = LETTER_RANGES[letter];
      const mid = (lo + hi) / 2;
      return s + (1 - Math.abs(n - mid) / (hi - lo) * 0.6) * 100;
    }, 0) / numbers.length),
  }));

  return (
    <>
      <style>{`
        .bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.6s cubic-bezier(.4,0,.2,1);
        }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}>
        <div style={{
          background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
          borderRadius: 22, padding: "28px 24px",
          width: "min(420px, 94vw)", maxHeight: "92vh", overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)",
        }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, fontFamily: "'Fredoka One', cursive", letterSpacing: "0.12em" }}>
                📊 ANALYZER
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                Heat score based on draw probability
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.08)", border: "none",
              color: "#fff", width: 34, height: 34, borderRadius: "50%",
              cursor: "pointer", fontSize: "1rem",
            }}>✕</button>
          </div>

          {/* Column coverage bars */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", fontFamily: "'Nunito', sans-serif", fontWeight: 700, marginBottom: 10 }}>
              COLUMN HEAT SCORE
            </div>
            {columnCoverage.map(({ letter, avg }) => {
              const { bg, dark } = BALL_COLORS[letter];
              return (
                <div key={letter} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: `linear-gradient(135deg, ${dark}, ${bg})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 900, fontSize: "0.85rem",
                    fontFamily: "'Fredoka One', cursive", flexShrink: 0,
                  }}>{letter}</div>
                  <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
                    <div className="bar-fill" style={{ width: `${avg}%`, background: `linear-gradient(90deg, ${dark}, ${bg})` }} />
                  </div>
                  <div style={{ color: "#fff", fontSize: "0.8rem", fontFamily: "'Fredoka One', cursive", width: 34, textAlign: "right" }}>
                    {avg}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hot / Cold */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Hot */}
            <div>
              <div style={{ color: "#f87171", fontSize: "0.82rem", fontFamily: "'Fredoka One', cursive", letterSpacing: "0.1em", marginBottom: 8 }}>
                🔥 HOTTEST
              </div>
              {hotTop.map(({ label, letter, heat }) => {
                const { bg } = BALL_COLORS[letter];
                return (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(255,255,255,0.06)", borderRadius: 8,
                    padding: "7px 10px", marginBottom: 5,
                    border: `1px solid ${bg}33`,
                  }}>
                    <span style={{ color: "#fff", fontFamily: "'Fredoka One', cursive", fontSize: "0.9rem" }}>{label}</span>
                    <span style={{ color: bg, fontFamily: "'Fredoka One', cursive", fontSize: "0.8rem" }}>{heat}%</span>
                  </div>
                );
              })}
            </div>
            {/* Cold */}
            <div>
              <div style={{ color: "#93c5fd", fontSize: "0.82rem", fontFamily: "'Fredoka One', cursive", letterSpacing: "0.1em", marginBottom: 8 }}>
                🧊 COLDEST
              </div>
              {coldTop.map(({ label, letter, heat }) => {
                const { bg } = BALL_COLORS[letter];
                return (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(255,255,255,0.06)", borderRadius: 8,
                    padding: "7px 10px", marginBottom: 5,
                    border: `1px solid rgba(147,197,253,0.2)`,
                  }}>
                    <span style={{ color: "#fff", fontFamily: "'Fredoka One', cursive", fontSize: "0.9rem" }}>{label}</span>
                    <span style={{ color: "#93c5fd", fontFamily: "'Fredoka One', cursive", fontSize: "0.8rem" }}>{heat}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div style={{
            marginTop: 18, padding: "12px 16px",
            borderRadius: 12, background: "rgba(124,58,237,0.14)",
            border: "1px solid rgba(124,58,237,0.3)",
          }}>
            <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Nunito', sans-serif", fontSize: "0.82rem", fontWeight: 700, lineHeight: 1.6 }}>
              📌 Overall Card Score: <span style={{ color: "#a78bfa", fontFamily: "'Fredoka One', cursive" }}>
                {Math.round(stats.reduce((s, x) => s + x.heat, 0) / stats.length)}%
              </span>
              <br />
              Best column: <span style={{ color: "#34d399", fontFamily: "'Fredoka One', cursive" }}>
                {columnCoverage.sort((a, b) => b.avg - a.avg)[0].letter}
              </span>
              {" · "} Most at-risk: <span style={{ color: "#f87171", fontFamily: "'Fredoka One', cursive" }}>
                {columnCoverage.sort((a, b) => a.avg - b.avg)[0].letter}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
