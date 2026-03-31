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

function checkBingo(marked, card) {
  const grid = Array.from({ length: 5 }, (_, r) =>
    card.map(({ letter, numbers }, c) => {
      if (r === 2 && c === 2) return marked.has("FREE");
      return marked.has(`${letter}${numbers[r]}`);
    })
  );
  for (let r = 0; r < 5; r++)
    if (grid[r].every(Boolean)) return true;
  for (let c = 0; c < 5; c++)
    if (grid.every(row => row[c])) return true;
  if ([0,1,2,3,4].every(i => grid[i][i])) return true;
  if ([0,1,2,3,4].every(i => grid[i][4-i])) return true;
  return false;
}

export default function Checker({ onClose }) {
  const [card] = useState(generateCard());
  const [marked, setMarked] = useState(new Set(["FREE"]));
  const [calledInput, setCalledInput] = useState("");
  const [called, setCalled] = useState([]);
  const [bingo, setBingo] = useState(false);

  const callNumber = () => {
    const raw = calledInput.trim().toUpperCase();
    const match = raw.match(/^([BINGO])(\d+)$/);
    if (!match) return;
    const [, letter, numStr] = match;
    const num = parseInt(numStr);
    const [lo, hi] = LETTER_RANGES[letter] || [];
    if (!lo || num < lo || num > hi) return;
    const key = `${letter}${num}`;
    if (called.includes(key)) return;
    const newCalled = [...called, key];
    const newMarked = new Set(marked);
    card.forEach(({ letter: l, numbers }) => {
      numbers.forEach(n => {
        if (`${l}${n}` === key) newMarked.add(key);
      });
    });
    setCalled(newCalled);
    setMarked(newMarked);
    setCalledInput("");
    if (checkBingo(newMarked, card)) setBingo(true);
  };

  return (
    <>
      <style>{`
        @keyframes bingoPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .chk-cell {
          width: 48px; height: 48px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.92rem; font-weight: 900;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Fredoka One', cursive;
          user-select: none;
        }
        .chk-cell:hover { transform: scale(1.08); }
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, fontFamily: "'Fredoka One', cursive", letterSpacing: "0.12em" }}>
                ✅ CHECKER
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                Type e.g. B7 or G52 to call numbers
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.08)", border: "none",
              color: "#fff", width: 34, height: 34, borderRadius: "50%",
              cursor: "pointer", fontSize: "1rem",
            }}>✕</button>
          </div>

          {/* Bingo banner */}
          {bingo && (
            <div style={{
              marginBottom: 16, padding: "14px",
              borderRadius: 14,
              background: "linear-gradient(95deg, #f59e0b, #ef4444)",
              textAlign: "center",
              fontFamily: "'Fredoka One', cursive",
              fontSize: "1.6rem", color: "#fff",
              boxShadow: "0 0 30px rgba(245,158,11,0.6)",
              animation: "bingoPop 0.45s ease",
            }}>🎉 BINGO! 🎉</div>
          )}

          {/* Column headers */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
            {card.map(({ letter }) => (
              <div key={letter} style={{
                width: 48, height: 28, borderRadius: 7,
                background: `linear-gradient(135deg, ${BALL_COLORS[letter].dark}, ${BALL_COLORS[letter].bg})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: "0.9rem",
                fontFamily: "'Fredoka One', cursive",
              }}>{letter}</div>
            ))}
          </div>

          {/* Card grid */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 18 }}>
            {card.map(({ letter, numbers }, ci) => (
              <div key={letter} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {numbers.map((num, ri) => {
                  const isFree = ci === 2 && ri === 2;
                  const key = isFree ? "FREE" : `${letter}${num}`;
                  const on = marked.has(key);
                  return (
                    <div key={key} className="chk-cell" style={{
                      background: on
                        ? `linear-gradient(135deg, ${BALL_COLORS[letter].dark}, ${BALL_COLORS[letter].bg})`
                        : "rgba(255,255,255,0.07)",
                      color: on ? "#fff" : "rgba(255,255,255,0.7)",
                      border: on ? `2px solid ${BALL_COLORS[letter].bg}` : "2px solid rgba(255,255,255,0.1)",
                      boxShadow: on ? `0 0 12px ${BALL_COLORS[letter].bg}55` : "none",
                    }}>
                      {isFree ? "⭐" : num}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={calledInput}
              onChange={e => setCalledInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && callNumber()}
              placeholder="e.g. B7, G52..."
              style={{
                flex: 1, padding: "11px 14px",
                borderRadius: 10, border: "2px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.07)",
                color: "#fff", fontFamily: "'Fredoka One', cursive",
                fontSize: "1rem", outline: "none",
              }}
            />
            <button onClick={callNumber} style={{
              padding: "11px 18px", borderRadius: 10,
              background: "linear-gradient(95deg, #7c3aed, #2563eb)",
              border: "none", color: "#fff",
              fontFamily: "'Fredoka One', cursive", fontSize: "0.95rem",
              cursor: "pointer",
            }}>CALL</button>
          </div>

          {/* Called list */}
          {called.length > 0 && (
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {called.map(k => {
                const letter = k[0];
                const { bg } = BALL_COLORS[letter] || {};
                return (
                  <span key={k} style={{
                    padding: "4px 10px", borderRadius: 7,
                    background: bg ? `${bg}33` : "rgba(255,255,255,0.1)",
                    border: `1px solid ${bg || "rgba(255,255,255,0.2)"}44`,
                    color: "#fff", fontSize: "0.8rem",
                    fontFamily: "'Fredoka One', cursive",
                  }}>{k}</span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
