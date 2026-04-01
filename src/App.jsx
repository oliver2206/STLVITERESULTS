import { useEffect, useRef, useState } from "react";
import Generate from "./Generate";
import Pattern from "./Pattern";
import Checker from "./Checker";
import Analyzer from "./Analyzer";
import Gallery from "./Gallery";
import Navbar from "./Navbar";

const COLS = {
  B: { range: [1, 15],  color: "#5b9bd5", text: "#fff" },
  I: { range: [16, 30], color: "#e84040", text: "#fff" },
  N: { range: [31, 45], color: "#4caf50", text: "#fff" },
  G: { range: [46, 60], color: "#ff9800", text: "#111" },
  O: { range: [61, 75], color: "#f5f5f5", text: "#222" },
};
const COL_KEYS = ["B", "I", "N", "G", "O"];

function generateUniqueBalls(count, W, H) {
  // Build a shuffled pool of unique numbers 1–75
  const allNums = Array.from({ length: 75 }, (_, i) => i + 1);
  for (let i = allNums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allNums[i], allNums[j]] = [allNums[j], allNums[i]];
  }
  const picked = allNums.slice(0, count);

  const BALL_R = 30; // fixed radius for all balls

  return picked.map((num, i) => {
    // Determine column from number
    let col = "O";
    if (num <= 15)       col = "B";
    else if (num <= 30)  col = "I";
    else if (num <= 45)  col = "N";
    else if (num <= 60)  col = "G";

    const angle = (i / count) * Math.PI * 2;
    const dist = 100 + Math.random() * 140;

    return {
      col,
      num,
      color: COLS[col].color,
      textColor: COLS[col].text,
      x: W / 2 + Math.cos(angle) * dist,
      y: H / 2 + Math.sin(angle) * dist,
      r: BALL_R,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6,
      phase: Math.random() * Math.PI * 2,
      floatSpeed: 0.5 + Math.random() * 0.5,
      floatAmp: 4 + Math.random() * 4,
    };
  });
}

function resolveCollisions(balls) {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.r + b.r + 2;
      if (dist < minDist && dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (minDist - dist) / 2;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;
        const dot = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (dot > 0) {
          a.vx -= dot * nx * 0.95;
          a.vy -= dot * ny * 0.95;
          b.vx += dot * nx * 0.95;
          b.vy += dot * ny * 0.95;
        }
      }
    }
  }
}

const MENU_W = 310;
const MENU_H = 370;

function clampAwayFromCenter(b, W, H) {
  const cx = W / 2, cy = H / 2;
  const left   = cx - MENU_W / 2 - b.r;
  const right  = cx + MENU_W / 2 + b.r;
  const top    = cy - MENU_H / 2 - b.r;
  const bottom = cy + MENU_H / 2 + b.r;
  const inX = b.x > cx - MENU_W / 2 - b.r && b.x < cx + MENU_W / 2 + b.r;
  const inY = b.y > cy - MENU_H / 2 - b.r && b.y < cy + MENU_H / 2 + b.r;
  if (inX && inY) {
    const dL = Math.abs(b.x - left);
    const dR = Math.abs(b.x - right);
    const dT = Math.abs(b.y - top);
    const dB = Math.abs(b.y - bottom);
    const min = Math.min(dL, dR, dT, dB);
    if (min === dL) { b.x = left;   b.vx = -Math.abs(b.vx); }
    else if (min === dR) { b.x = right;  b.vx =  Math.abs(b.vx); }
    else if (min === dT) { b.y = top;    b.vy = -Math.abs(b.vy); }
    else                 { b.y = bottom; b.vy =  Math.abs(b.vy); }
  }
}

const BALL_COUNT = 26;

export default function App() {
  const [page, setPage] = useState(null);
  const canvasRef = useRef(null);
  const ballsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (page !== null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);

    ballsRef.current = generateUniqueBalls(BALL_COUNT, W, H);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const t = Date.now() / 1000;
      const balls = ballsRef.current;

      balls.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x - b.r < 0)  { b.x = b.r;     b.vx =  Math.abs(b.vx); }
        if (b.x + b.r > W)  { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
        if (b.y - b.r < 0)  { b.y = b.r;     b.vy =  Math.abs(b.vy); }
        if (b.y + b.r > H)  { b.y = H - b.r; b.vy = -Math.abs(b.vy); }
        clampAwayFromCenter(b, W, H);
      });

      resolveCollisions(balls);
      resolveCollisions(balls);

      balls.forEach((b) => {
        const floatY = Math.sin(t * b.floatSpeed + b.phase) * b.floatAmp;
        const cx = b.x;
        const cy = b.y + floatY;

        ctx.save();

        ctx.beginPath();
        ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy - b.r * 0.3, b.r * 0.45, b.r * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fill();

        ctx.fillStyle = b.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${Math.round(b.r * 0.38)}px Arial`;
        ctx.fillText(b.col, cx, cy - b.r * 0.22);
        ctx.font = `900 ${Math.round(b.r * 0.54)}px Arial Black, Arial`;
        ctx.fillText(b.num, cx, cy + b.r * 0.22);

        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [page]);

  const goHome = () => setPage(null);
  const goTo   = (p) => setPage(p);

  if (page === "Generate") return <><Navbar activePage="Generate" onNavigate={goTo} onHome={goHome} /><Generate onBack={goHome} /></>;
  if (page === "Pattern")  return <><Navbar activePage="Pattern"  onNavigate={goTo} onHome={goHome} /><Pattern  onBack={goHome} /></>;
  if (page === "Checker")  return <><Navbar activePage="Checker"  onNavigate={goTo} onHome={goHome} /><Checker  onBack={goHome} /></>;
  if (page === "Analyzer") return <><Navbar activePage="Analyzer" onNavigate={goTo} onHome={goHome} /><Analyzer onBack={goHome} /></>;
  if (page === "Gallery")  return <><Navbar activePage="Gallery"  onNavigate={goTo} onHome={goHome} /><Gallery  onBack={goHome} /></>;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #3a6fd8 0%, #6a4fd8 50%, #4a8fd8 100%)",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          🍀
        </div>

        <h1
          style={{
            color: "#fff",
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: 2,
            textShadow: "2px 2px 6px rgba(0,0,0,0.5)",
            textAlign: "center",
            fontFamily: "'Arial Black', Arial, sans-serif",
          }}
        >
          BINGO FORTUNE
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 300 }}>
          {[
            { name: "Generate", icon: "🎲", accent: "#4f9ef8" },
            { name: "Pattern",  icon: "🔲", accent: "#a855f7" },
            { name: "Checker",  icon: "✅", accent: "#22c55e" },
            { name: "Analyzer", icon: "📊", accent: "#f97316" },
            { name: "Gallery",  icon: "🖼️", accent: "#ec4899" },
          ].map(({ name, icon, accent }) => (
            <button
              key={name}
              onClick={() => setPage(name)}
              style={{
                background: "rgba(30,30,40,0.85)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "13px 20px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                cursor: "pointer",
                fontFamily: "'Arial Black', Arial, sans-serif",
                transition: "all 0.18s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.background = accent;
                btn.style.border = `2px solid ${accent}`;
                btn.style.transform = "scale(1.04) translateY(-2px)";
                btn.style.boxShadow = `0 8px 24px ${accent}66`;
                btn.style.letterSpacing = "4px";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.background = "rgba(30,30,40,0.85)";
                btn.style.border = "2px solid rgba(255,255,255,0.1)";
                btn.style.transform = "scale(1) translateY(0)";
                btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
                btn.style.letterSpacing = "3px";
              }}
              onMouseDown={(e) => {
                const btn = e.currentTarget;
                btn.style.transform = "scale(0.97) translateY(1px)";
                btn.style.boxShadow = `0 2px 8px ${accent}44`;
              }}
              onMouseUp={(e) => {
                const btn = e.currentTarget;
                btn.style.transform = "scale(1.04) translateY(-2px)";
                btn.style.boxShadow = `0 8px 24px ${accent}66`;
              }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              {name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
