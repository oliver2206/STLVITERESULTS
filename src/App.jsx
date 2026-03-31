import { useState, useEffect, useRef } from "react";

/* ─── Ball color palette ─────────────────────────────────────── */
const BALL_COLORS = {
  B: { bg: "#4FC3F7", dark: "#01579B" },
  I: { bg: "#EF5350", dark: "#7F0000" },
  N: { bg: "#E0E0E0", dark: "#424242" },
  G: { bg: "#66BB6A", dark: "#1B5E20" },
  O: { bg: "#FFA726", dark: "#7f2e00" },
};

const LETTER_RANGES = {
  B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75],
};

function rnd(a, b) { return a + Math.random() * (b - a); }

function makeBall(id, W, H) {
  const letters = Object.keys(LETTER_RANGES);
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const [lo, hi] = LETTER_RANGES[letter];
  const radius = rnd(30, 52);
  let vx = rnd(-3, 3); if (Math.abs(vx) < 0.8) vx = 1.2;
  let vy = rnd(-3, 3); if (Math.abs(vy) < 0.8) vy = 1.2;
  return {
    id, letter,
    number: Math.floor(rnd(lo, hi + 1)),
    radius,
    x: rnd(radius, W - radius),
    y: rnd(radius, H - radius),
    vx, vy,
    spin: rnd(-2, 2),
    angle: rnd(0, 360),
  };
}

/* ─── Physics hook ───────────────────────────────────────────── */
function useBalls(count) {
  const dimRef   = useRef({ W: window.innerWidth, H: window.innerHeight });
  const ballsRef = useRef([]);
  const rafRef   = useRef(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const { W, H } = dimRef.current;
    ballsRef.current = Array.from({ length: count }, (_, i) => makeBall(i, W, H));
    setTick(t => t + 1);
  }, [count]);

  useEffect(() => {
    const onResize = () => {
      dimRef.current = { W: window.innerWidth, H: window.innerHeight };
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const loop = () => {
      const { W, H } = dimRef.current;
      ballsRef.current = ballsRef.current.map(b => {
        let { x, y, vx, vy, radius, spin, angle } = b;
        x += vx; y += vy;
        if (x - radius < 0)  { x = radius;    vx =  Math.abs(vx); }
        if (x + radius > W)  { x = W - radius; vx = -Math.abs(vx); }
        if (y - radius < 0)  { y = radius;    vy =  Math.abs(vy); }
        if (y + radius > H)  { y = H - radius; vy = -Math.abs(vy); }
        angle += spin;
        return { ...b, x, y, vx, vy, angle };
      });
      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return ballsRef.current;
}

/* ─── Single ball ────────────────────────────────────────────── */
function Ball({ b }) {
  const { letter, number, radius, x, y, angle } = b;
  const { bg, dark } = BALL_COLORS[letter];
  const d = radius * 2;

  return (
    <div style={{
      position: "absolute",
      width: d, height: d,
      left: x - radius, top: y - radius,
      borderRadius: "50%",
      background: `radial-gradient(circle at 38% 32%, rgba(255,255,255,0.55) 0%, ${bg} 48%, ${dark} 100%)`,
      boxShadow: `0 8px 24px rgba(0,0,0,0.38),
                  inset 0 -5px 10px rgba(0,0,0,0.22),
                  inset 0  4px  8px rgba(255,255,255,0.38)`,
      transform: `rotate(${angle}deg)`,
      willChange: "transform",
      display: "flex", alignItems: "center", justifyContent: "center",
      userSelect: "none",
    }}>
      {/* white band */}
      <div style={{
        position: "absolute",
        width: "68%", height: "30%",
        background: "rgba(255,255,255,0.93)",
        borderRadius: 5,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
      }}>
        <span style={{
          fontSize: radius * 0.60,
          fontWeight: 900,
          color: dark,
          fontFamily: "'Fredoka One', cursive",
          lineHeight: 1,
          letterSpacing: "-0.5px",
        }}>{number}</span>
      </div>
      {/* letter */}
      <span style={{
        position: "absolute", top: "11%",
        fontSize: radius * 0.34,
        fontWeight: 900,
        color: "rgba(255,255,255,0.95)",
        fontFamily: "'Fredoka One', cursive",
        textShadow: `0 1px 4px ${dark}`,
      }}>{letter}</span>
    </div>
  );
}

/* ─── Menu data ──────────────────────────────────────────────── */
const MENU = ["GENERATE", "PATTERN", "CHECKER", "ANALYZER", "GALLERY"];
const DESCRIPTIONS = {
  GENERATE: "🎲 Generate a fresh Bingo card with random numbers across all columns!",
  PATTERN:  "🔲 Choose a winning pattern: Line, Diagonal, Blackout, L-Shape & more!",
  CHECKER:  "✅ Mark your called numbers and auto-check if you've hit Bingo!",
  ANALYZER: "📊 Analyze your card's probability and hot/cold number statistics.",
  GALLERY:  "🖼️ Browse and save your favourite Bingo card designs and patterns.",
};

/* ─── App ────────────────────────────────────────────────────── */
export default function BingoFortune() {
  const balls = useBalls(32);
  const [active, setActive] = useState(null);
  const [glow, setGlow]     = useState(false);

  const cloverClick = () => {
    setGlow(true);
    setTimeout(() => setGlow(false), 700);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap');

        html, body {
          margin: 0; padding: 0;
          width: 100%; height: 100%;
          overflow: hidden;
        }

        #root {
          width: 100vw; height: 100vh;
          overflow: hidden;
        }

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cloverPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* ── Full-screen blue stage ── */}
      <div style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        background: "linear-gradient(148deg, #5520cc 0%, #1a6cf4 42%, #22a8e6 100%)",
        overflow: "hidden",
        fontFamily: "'Fredoka One', cursive",
      }}>

        {/* Soft radial shimmer */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 55% at 50% 36%, rgba(255,255,255,0.10) 0%, transparent 68%)",
        }}/>

        {/* ── Bouncing balls ── */}
        {balls.map(b => <Ball key={b.id} b={b} />)}

        {/* ── Centre HUD ── */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex", flexDirection: "column", alignItems: "center",
          zIndex: 20,
          width: "min(350px, 86vw)",
        }}>

          {/* Clover button */}
          <div onClick={cloverClick} style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#0e0e0e",
            border: "3px solid #1c1c1c",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 34, cursor: "pointer",
            marginBottom: 8,
            boxShadow: glow
              ? "0 0 0 12px rgba(90,210,100,0.38), 0 0 55px rgba(70,200,80,0.55), 0 4px 22px rgba(0,0,0,0.5)"
              : "0 4px 28px rgba(0,0,0,0.55)",
            transition: "box-shadow 0.25s",
            animation: glow ? "cloverPop 0.4s ease" : "none",
            userSelect: "none",
          }}>🍀</div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(1.85rem, 5.5vw, 3.2rem)",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.18em",
            textShadow: "0 3px 20px rgba(0,0,0,0.45), 0 2px 0 rgba(0,0,0,0.3)",
            marginBottom: 20,
            textAlign: "center",
          }}>BINGO FORTUNE</h1>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            {MENU.map(item => {
              const on = active === item;
              return (
                <button key={item}
                  onClick={() => setActive(on ? null : item)}
                  style={{
                    width: "100%", padding: "14px 0",
                    borderRadius: 12,
                    border: on ? "2px solid rgba(90,215,105,0.65)" : "2px solid rgba(255,255,255,0.07)",
                    background: on
                      ? "linear-gradient(95deg, #33a845 0%, #1878d0 100%)"
                      : "rgba(12,12,22,0.78)",
                    color: "#fff",
                    fontSize: "1.08rem", fontWeight: 800,
                    fontFamily: "'Fredoka One', cursive",
                    letterSpacing: "0.22em",
                    cursor: "pointer",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow: on
                      ? "0 0 22px rgba(55,190,75,0.32), 0 6px 18px rgba(0,0,0,0.35)"
                      : "0 4px 18px rgba(0,0,0,0.32)",
                    transition: "all 0.18s cubic-bezier(.3,1.5,.5,1)",
                    transform: on ? "scale(1.04)" : "scale(1)",
                  }}
                  onMouseEnter={e => {
                    if (!on) {
                      e.currentTarget.style.background = "rgba(40,40,60,0.92)";
                      e.currentTarget.style.transform  = "scale(1.025)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!on) {
                      e.currentTarget.style.background = "rgba(12,12,22,0.78)";
                      e.currentTarget.style.transform  = "scale(1)";
                    }
                  }}
                >{item}</button>
              );
            })}
          </div>

          {/* Description */}
          {active && (
            <div style={{
              marginTop: 13, width: "100%",
              padding: "15px 20px", borderRadius: 13,
              background: "rgba(6,6,16,0.86)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.92)",
              fontSize: "0.95rem",
              fontFamily: "'Nunito', sans-serif", fontWeight: 700,
              lineHeight: 1.65, textAlign: "center",
              boxShadow: "0 8px 36px rgba(0,0,0,0.45)",
              animation: "fadeUp 0.22s ease",
            }}>
              {DESCRIPTIONS[active]}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
