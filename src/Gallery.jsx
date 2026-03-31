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

const THEMES = [
  { name: "Ocean",   from: "#0ea5e9", to: "#1d4ed8" },
  { name: "Sunset",  from: "#f97316", to: "#be185d" },
  { name: "Forest",  from: "#22c55e", to: "#065f46" },
  { name: "Galaxy",  from: "#8b5cf6", to: "#1e1b4b" },
  { name: "Fire",    from: "#ef4444", to: "#f59e0b" },
  { name: "Mint",    from: "#34d399", to: "#0284c7" },
];

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

function MiniCard({ card, theme, label }) {
  return (
    <div style={{
      borderRadius: 14,
      background: `linear-gradient(135deg, ${theme.from}22, ${theme.to}44)`,
      border: `1.5px solid ${theme.from}55`,
      padding: "12px 10px",
      boxShadow: `0 4px 20px ${theme.from}22`,
      transition: "transform 0.18s, box-shadow 0.18s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = `0 8px 28px ${theme.from}44`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 4px 20px ${theme.from}22`; }}
    >
      {/* mini header row */}
      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 5 }}>
        {card.map(({ letter }) => (
          <div key={letter} style={{
            width: 22, height: 16, borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: "0.5rem",
            fontFamily: "'Fredoka One', cursive",
          }}>{letter}</div>
        ))}
      </div>
      {/* mini grid */}
      <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
        {card.map(({ letter, numbers }, ci) => (
          <div key={letter} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {numbers.map((num, ri) => {
              const isFree = ci === 2 && ri === 2;
              return (
                <div key={`${letter}${num}`} style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: isFree
                    ? `linear-gradient(135deg, ${theme.from}, ${theme.to})`
                    : "rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: isFree ? "0.6rem" : "0.48rem",
                  fontFamily: "'Fredoka One', cursive",
                  border: `1px solid ${isFree ? theme.from + "66" : "rgba(255,255,255,0.1)"}`,
                }}>
                  {isFree ? "⭐" : num}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 8, textAlign: "center",
        color: theme.from, fontFamily: "'Fredoka One', cursive",
        fontSize: "0.68rem", letterSpacing: "0.1em",
      }}>{label}</div>
    </div>
  );
}

export default function Gallery({ onClose }) {
  const [savedCards] = useState(() =>
    THEMES.map((theme, i) => ({
      id: i,
      theme,
      card: generateCard(),
      label: `${theme.name} Card`,
    }))
  );
  const [favs, setFavs] = useState(new Set());

  const toggleFav = (id) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}>
        <div style={{
          background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
          borderRadius: 22, padding: "28px 24px",
          width: "min(460px, 94vw)", maxHeight: "92vh", overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)",
        }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 900, fontFamily: "'Fredoka One', cursive", letterSpacing: "0.12em" }}>
                🖼️ GALLERY
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
                Tap ❤️ to save your favourites
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.08)", border: "none",
              color: "#fff", width: 34, height: 34, borderRadius: "50%",
              cursor: "pointer", fontSize: "1rem",
            }}>✕</button>
          </div>

          {/* Cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {savedCards.map(({ id, theme, card, label }) => (
              <div key={id} style={{ position: "relative" }}>
                <MiniCard card={card} theme={theme} label={label} />
                <button
                  onClick={() => toggleFav(id)}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.45)", border: "none",
                    borderRadius: "50%", width: 26, height: 26,
                    cursor: "pointer", fontSize: "0.85rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {favs.has(id) ? "❤️" : "🤍"}
                </button>
              </div>
            ))}
          </div>

          {/* Favourites count */}
          {favs.size > 0 && (
            <div style={{
              marginTop: 16, padding: "10px 16px",
              borderRadius: 10, background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", fontFamily: "'Nunito', sans-serif",
              fontSize: "0.82rem", fontWeight: 700, textAlign: "center",
            }}>
              ❤️ {favs.size} card{favs.size > 1 ? "s" : ""} saved to favourites
            </div>
          )}
        </div>
      </div>
    </>
  );
}
