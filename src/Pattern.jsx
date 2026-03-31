import { useState } from "react";

const PATTERNS = {
  "LINE H": { label: "Horizontal Line", cells: (r, c) => r === 2 },
  "LINE V": { label: "Vertical Line",   cells: (r, c) => c === 2 },
  "DIAG ↘": { label: "Diagonal ↘",     cells: (r, c) => r === c },
  "DIAG ↗": { label: "Diagonal ↗",     cells: (r, c) => r + c === 4 },
  "BLACKOUT": { label: "Blackout",      cells: () => true },
  "L-SHAPE": { label: "L-Shape",        cells: (r, c) => c === 0 || r === 4 },
  "T-SHAPE": { label: "T-Shape",        cells: (r, c) => r === 0 || c === 2 },
  "X-SHAPE": { label: "X-Shape",        cells: (r, c) => r === c || r + c === 4 },
  "FRAME":   { label: "Frame",          cells: (r, c) => r === 0 || r === 4 || c === 0 || c === 4 },
  "4 CORNERS":{ label: "4 Corners",     cells: (r, c) => (r === 0 || r === 4) && (c === 0 || c === 4) },
};

export default function Pattern({ onClose }) {
  const [selected, setSelected] = useState("LINE H");

  const pattern = PATTERNS[selected];

  return (
    <>
      <style>{`
        .pat-key {
          padding: 9px 14px;
          border-radius: 9px;
          font-family: 'Fredoka One', cursive;
          font-size: 0.82rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.15s;
          user-select: none;
          color: #fff;
        }
        .pat-key:hover { transform: scale(1.05); }
        .pat-cell {
          width: 46px; height: 46px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          transition: all 0.2s;
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
          borderRadius: 22,
          padding: "28px 24px",
          width: "min(420px, 94vw)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)",
        }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, fontFamily: "'Fredoka One', cursive", letterSpacing: "0.12em" }}>
                🔲 PATTERN
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                Select a winning pattern
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.08)", border: "none",
              color: "#fff", width: 34, height: 34, borderRadius: "50%",
              cursor: "pointer", fontSize: "1rem",
            }}>✕</button>
          </div>

          {/* Pattern picker */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {Object.keys(PATTERNS).map(key => {
              const on = selected === key;
              return (
                <button key={key} className="pat-key"
                  onClick={() => setSelected(key)}
                  style={{
                    background: on ? "linear-gradient(95deg, #7c3aed, #2563eb)" : "rgba(255,255,255,0.07)",
                    border: on ? "2px solid #7c3aed" : "2px solid rgba(255,255,255,0.1)",
                    boxShadow: on ? "0 0 14px rgba(124,58,237,0.4)" : "none",
                  }}>{key}</button>
              );
            })}
          </div>

          {/* Preview grid */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", fontFamily: "'Nunito', sans-serif", fontWeight: 700, marginBottom: 4 }}>
              {pattern.label} Preview
            </div>
            {Array.from({ length: 5 }, (_, r) => (
              <div key={r} style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: 5 }, (_, c) => {
                  const isFree = r === 2 && c === 2;
                  const lit = isFree || pattern.cells(r, c);
                  return (
                    <div key={c} className="pat-cell" style={{
                      background: lit
                        ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                        : "rgba(255,255,255,0.06)",
                      border: lit ? "2px solid #7c3aed88" : "2px solid rgba(255,255,255,0.08)",
                      boxShadow: lit ? "0 0 12px rgba(124,58,237,0.45)" : "none",
                      fontSize: isFree ? "1.1rem" : "0",
                    }}>
                      {isFree ? "⭐" : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
