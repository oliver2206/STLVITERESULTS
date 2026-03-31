import { useState } from "react";

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

export default function Generate({ onClose }) {
  const [card, setCard] = useState(generateCard());
  const [marked, setMarked] = useState(new Set(["FREE"]));
  const [flash, setFlash] = useState(false);

  const reroll = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
    setCard(generateCard());
    setMarked(new Set(["FREE"]));
  };

  const toggle = (key) => {
    setMarked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <>
      <style>{`
        @keyframes cardFlash {
          0%   { opacity: 0; transform: scale(0.93); }
          100% { opacity: 1; transform: scale(1); }
        }
        .gen-cell {
          width: 52px; height: 52px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 900;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Fredoka One', cursive;
          user-select: none;
          border: 2px solid transparent;
        }
        .gen-cell:hover { transform: scale(1.08); }
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
          animation: flash ? "cardFlash 0.35s ease" : "none",
        }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, fontFamily: "'Fredoka One', cursive", letterSpacing: "0.12em" }}>
                🎲 GENERATE
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                Click cells to mark · Tap reroll for a fresh card
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.08)", border: "none",
              color: "#fff", width: 34, height: 34, borderRadius: "50%",
              cursor: "pointer", fontSize: "1rem",
            }}>✕</button>
          </div>

          {/* Column headers */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
            {card.map(({ letter }) => (
              <div key={letter} style={{
                width: 52, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${BALL_COLORS[letter].dark}, ${BALL_COLORS[letter].bg})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: "1.05rem",
                fontFamily: "'Fredoka One', cursive",
              }}>{letter}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {card.map(({ letter, numbers }, ci) => (
              <div key={letter} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {numbers.map((num, ri) => {
                  const isFree = ci === 2 && ri === 2;
                  const key = isFree ? "FREE" : `${letter}${num}`;
                  const on = marked.has(key);
                  return (
                    <div key={key} className="gen-cell"
                      onClick={() => toggle(key)}
                      style={{
                        background: on
                          ? `linear-gradient(135deg, ${BALL_COLORS[letter].dark}, ${BALL_COLORS[letter].bg})`
                          : "rgba(255,255,255,0.07)",
                        color: on ? "#fff" : "rgba(255,255,255,0.8)",
                        border: on ? `2px solid ${BALL_COLORS[letter].bg}` : "2px solid rgba(255,255,255,0.1)",
                        boxShadow: on ? `0 0 14px ${BALL_COLORS[letter].bg}55` : "none",
                      }}>
                      {isFree ? "⭐" : num}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Reroll */}
          <button onClick={reroll} style={{
            marginTop: 20, width: "100%",
            padding: "13px 0",
            borderRadius: 12,
            background: "linear-gradient(95deg, #7c3aed, #2563eb)",
            border: "none", color: "#fff",
            fontSize: "1rem", fontWeight: 900,
            fontFamily: "'Fredoka One', cursive", letterSpacing: "0.18em",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
            transition: "transform 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >🎲 REROLL CARD</button>
        </div>
      </div>
    </>
  );
}
