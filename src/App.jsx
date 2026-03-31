import { useState, useEffect, useRef } from "react";
import Generate from "./Generate";
import Pattern from "./Pattern";
import Checker from "./Checker";
import Analyzer from "./Analyzer";
import Gallery from "./Gallery";

/* ─── Colors ───────────────── */
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

/* ─── Ball generator ───────────────── */
function makeBall(id, W, H) {
  const letters = Object.keys(LETTER_RANGES);
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const [lo, hi] = LETTER_RANGES[letter];

  const radius = rnd(30, 52);
  let vx = rnd(-3, 3); if (Math.abs(vx) < 0.8) vx = 1.2;
  let vy = rnd(-3, 3); if (Math.abs(vy) < 0.8) vy = 1.2;

  return {
    id,
    letter,
    number: Math.floor(rnd(lo, hi + 1)),
    radius,
    x: rnd(radius, W - radius),
    y: rnd(radius, H - radius),
    vx,
    vy,
    spin: rnd(-2, 2),
    angle: rnd(0, 360),
  };
}

/* ─── Physics ───────────────── */
function useBalls(count) {
  const dimRef = useRef({ W: window.innerWidth, H: window.innerHeight });
  const ballsRef = useRef([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const { W, H } = dimRef.current;
    ballsRef.current = Array.from({ length: count }, (_, i) =>
      makeBall(i, W, H)
    );
    setTick(t => t + 1);
  }, [count]);

  useEffect(() => {
    const loop = () => {
      const { W, H } = dimRef.current;

      ballsRef.current = ballsRef.current.map(b => {
        let { x, y, vx, vy, radius, angle, spin } = b;

        x += vx;
        y += vy;

        if (x - radius < 0) vx = Math.abs(vx);
        if (x + radius > W) vx = -Math.abs(vx);
        if (y - radius < 0) vy = Math.abs(vy);
        if (y + radius > H) vy = -Math.abs(vy);

        angle += spin;

        return { ...b, x, y, vx, vy, angle };
      });

      setTick(t => t + 1);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }, []);

  return ballsRef.current;
}

/* ─── Ball UI ───────────────── */
function Ball({ b }) {
  const { letter, number, radius, x, y, angle } = b;
  const { bg, dark } = BALL_COLORS[letter];

  return (
    <div
      style={{
        position: "absolute",
        width: radius * 2,
        height: radius * 2,
        left: x - radius,
        top: y - radius,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, #fff, ${bg}, ${dark})`,
        transform: `rotate(${angle}deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <strong style={{ color: "#fff" }}>{letter}{number}</strong>
    </div>
  );
}

/* ─── Menu ───────────────── */
const MENU = ["GENERATE", "PATTERN", "CHECKER", "ANALYZER", "GALLERY"];

const PANELS = {
  GENERATE: Generate,
  PATTERN: Pattern,
  CHECKER: Checker,
  ANALYZER: Analyzer,
  GALLERY: Gallery,
};

/* ─── App ───────────────── */
export default function BingoFortune() {
  const balls = useBalls(32);
  const [openPanel, setOpenPanel] = useState(null);

  const ActivePanel = openPanel ? PANELS[openPanel] : null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(148deg, #5520cc 0%, #1a6cf4 42%, #22a8e6 100%)",
      }}
    >
      {/* Balls */}
      {balls.map(b => (
        <Ball key={b.id} b={b} />
      ))}

      {/* CENTER UI */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          zIndex: 10,
        }}
      >
        {!openPanel && (
          <>
            <h1 style={{ color: "#fff", textAlign: "center" }}>
              BINGO FORTUNE
            </h1>

            {MENU.map(item => (
              <button
                key={item}
                onClick={() => setOpenPanel(item)}
                style={{
                  width: "100%",
                  padding: 12,
                  marginTop: 10,
                  borderRadius: 10,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            ))}
          </>
        )}

        {/* PANEL INSIDE UI */}
        {openPanel && (
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              padding: 16,
              borderRadius: 12,
              color: "#fff",
            }}
          >
            <button
              onClick={() => setOpenPanel(null)}
              style={{
                marginBottom: 10,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>

            <ActivePanel />
          </div>
        )}
      </div>
    </div>
  );
}
