import { useState, useEffect, useRef } from "react";
import Generate from "./Generate";
import Pattern  from "./Pattern";
import Checker  from "./Checker";
import Analyzer from "./Analyzer";
import Gallery  from "./Gallery";

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
      width: d,
      height: d,
      left: x - radius,
      top: y - radius,
      borderRadius: "50%",
      background: `radial-gradient(circle at 38% 32%, rgba(255,255,255,0.55) 0%, ${bg} 48%, ${dark} 100%)`,
      boxShadow: `0 8px 24px rgba(0,0,0,0.38),
                  inset 0 -5px 10px rgba(0,0,0,0.22),
                  inset 0  4px  8px rgba(255,255,255,0.38)`,
      transform: `rotate(${angle}deg)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        position: "absolute",
        width: "68%",
        height: "30%",
        background: "#fff",
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{
          fontSize: radius * 0.6,
          fontWeight: 900,
          color: dark,
        }}>{number}</span>
      </div>

      <span style={{
        position: "absolute",
        top: "11%",
        fontSize: radius * 0.34,
        fontWeight: 900,
        color: "#fff",
      }}>{letter}</span>
    </div>
  );
}

/* ─── Menu + Panels ─────────────────────────────────────────── */
const MENU = ["GENERATE", "PATTERN", "CHECKER", "ANALYZER", "GALLERY"];

const PANELS = {
  GENERATE: Generate,
  PATTERN: Pattern,
  CHECKER: Checker,
  ANALYZER: Analyzer,
  GALLERY: Gallery,
};

/* ─── App ───────────────────────────────────────────────────── */
export default function BingoFortune() {
  const balls = useBalls(32);
  const [openPanel, setOpenPanel] = useState(null);

  const ActivePanel = openPanel ? PANELS[openPanel] : null;

  // ✅ FULL PAGE SWITCH (NO MODAL)
  if (ActivePanel) {
    return <ActivePanel onClose={() => setOpenPanel(null)} />;
  }

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(148deg, #5520cc 0%, #1a6cf4 42%, #22a8e6 100%)",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Balls */}
      {balls.map(b => <Ball key={b.id} b={b} />)}

      {/* Center Menu */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: 260,
      }}>
        {MENU.map(item => (
          <button
            key={item}
            onClick={() => setOpenPanel(item)}
            style={{
              padding: 14,
              borderRadius: 10,
              border: "none",
              background: "#111",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
