import { useState, useEffect, useRef, useCallback } from "react";
import Generate from "./Generate";
import Pattern from "./Pattern";
import Checker from "./Checker";
import Analyzer from "./Analyzer";
import Gallery from "./Gallery";

/* ─── Ball color palette ─────────────────────────────────────── */
const BALL_COLORS = {
  B: { bg: "#4FC3F7", dark: "#01579B", glow: "#81D4FA" },
  I: { bg: "#EF5350", dark: "#7F0000", glow: "#FF8A80" },
  N: { bg: "#E0E0E0", dark: "#424242", glow: "#F5F5F5" },
  G: { bg: "#66BB6A", dark: "#1B5E20", glow: "#81C784" },
  O: { bg: "#FFA726", dark: "#7f2e00", glow: "#FFB74D" },
};

const LETTER_RANGES = {
  B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75],
};

function rnd(a, b) { return a + Math.random() * (b - a); }

function makeBall(id, W, H) {
  const letters = Object.keys(LETTER_RANGES);
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const [lo, hi] = LETTER_RANGES[letter];

  const radius = rnd(32, 52);
  let vx = rnd(-5, 5);
  let vy = rnd(-5, 5);
  
  // Ensure minimum speed for better bouncing
  const minSpeed = 2;
  if (Math.abs(vx) < minSpeed) vx = vx > 0 ? minSpeed : -minSpeed;
  if (Math.abs(vy) < minSpeed) vy = vy > 0 ? minSpeed : -minSpeed;

  return {
    id, letter,
    number: Math.floor(rnd(lo, hi + 1)),
    radius,
    x: rnd(radius, W - radius),
    y: rnd(radius, H - radius),
    vx, vy,
    spin: rnd(-2, 2),
    angle: rnd(0, 360),
    bounce: 0.92, // Bounce factor
  };
}

/* ─── Enhanced Physics hook with bouncing ─────────────────── */
function useBalls(count) {
  const dimRef = useRef({ W: window.innerWidth, H: window.innerHeight });
  const ballsRef = useRef([]);
  const rafRef = useRef(null);
  const [, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const { W, H } = dimRef.current;
    const initialBalls = Array.from({ length: count }, (_, i) => 
      makeBall(i, W, H)
    );
    ballsRef.current = initialBalls;
    setTick(t => t + 1);
  }, [count]);

  useEffect(() => {
    const onResize = () => {
      const newDim = { W: window.innerWidth, H: window.innerHeight };
      ballsRef.current = ballsRef.current.map(b => ({
        ...b,
        x: Math.min(Math.max(b.x, b.radius), newDim.W - b.radius),
        y: Math.min(Math.max(b.y, b.radius), newDim.H - b.radius),
      }));
      dimRef.current = newDim;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const loop = () => {
      if (isPaused) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const { W, H } = dimRef.current;
      let balls = [...ballsRef.current];

      // Update positions with bouncing physics
      balls = balls.map(b => {
        let { x, y, vx, vy, radius, spin, angle, bounce } = b;
        
        // Apply gravity for bouncing effect
        vy += 0.2;
        
        // Air resistance
        vx *= 0.998;
        vy *= 0.998;
        spin *= 0.995;
        
        x += vx;
        y += vy;
        
        // Enhanced bouncing with energy loss
        if (x - radius < 0) {
          x = radius;
          vx = Math.abs(vx) * bounce;
        }
        if (x + radius > W) {
          x = W - radius;
          vx = -Math.abs(vx) * bounce;
        }
        if (y - radius < 0) {
          y = radius;
          vy = Math.abs(vy) * bounce;
        }
        if (y + radius > H) {
          y = H - radius;
          vy = -Math.abs(vy) * bounce;
        }
        
        angle += spin;
        
        return { ...b, x, y, vx, vy, angle };
      });
      
      ballsRef.current = balls;
      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused]);

  return { balls: ballsRef.current, setIsPaused, isPaused };
}

/* ─── Enhanced Ball component without white panel ────────────── */
function Ball({ b, onClick }) {
  const { letter, number, radius, x, y, angle } = b;
  const { bg, dark, glow } = BALL_COLORS[letter];
  const d = radius * 2;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onClick?.(b)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        width: d,
        height: d,
        left: x - radius,
        top: y - radius,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, ${bg} 40%, ${dark} 100%)`,
        boxShadow: isHovered 
          ? `0 12px 32px rgba(0,0,0,0.6), inset 0 -5px 12px rgba(0,0,0,0.3), inset 0 4px 12px rgba(255,255,255,0.5), 0 0 25px ${glow}`
          : `0 8px 24px rgba(0,0,0,0.45), inset 0 -5px 10px rgba(0,0,0,0.25), inset 0 4px 8px rgba(255,255,255,0.45)`,
        transform: `rotate(${angle}deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        zIndex: isHovered ? 10 : 1,
      }}>
      {/* Number directly on ball without white panel */}
      <span style={{
        fontSize: radius * 0.7,
        fontWeight: 900,
        color: dark,
        textShadow: "0 2px 4px rgba(255,255,255,0.6)",
        fontFamily: "monospace",
        letterSpacing: "2px",
      }}>{number}</span>

      <span style={{
        position: "absolute",
        top: "12%",
        left: "12%",
        fontSize: radius * 0.35,
        fontWeight: 900,
        color: "#fff",
        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
        fontFamily: "monospace",
      }}>{letter}</span>
    </div>
  );
}

/* ─── Enhanced Menu Component with best hover effects ───────── */
function Menu({ items, onSelect }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      display: "flex",
      flexDirection: "column",
      gap: 15,
      width: 300,
      zIndex: 20,
    }}>
      {items.map((item, index) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{
            padding: "18px 28px",
            borderRadius: 50,
            border: "none",
            background: hoveredIndex === index 
              ? "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)"
              : "rgba(0, 0, 0, 0.75)",
            color: hoveredIndex === index ? "#000" : "#fff",
            fontWeight: "bold",
            fontSize: "1.2rem",
            cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            transform: hoveredIndex === index ? "translateX(15px) scale(1.05)" : "translateX(0) scale(1)",
            boxShadow: hoveredIndex === index 
              ? "0 15px 35px rgba(0,0,0,0.3), 0 0 20px rgba(255,107,107,0.5)"
              : "0 8px 20px rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
            letterSpacing: hoveredIndex === index ? "3px" : "1px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Shine effect on hover */}
          {hoveredIndex === index && (
            <div style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: "shine 0.8s ease-in-out",
            }} />
          )}
          {item}
        </button>
      ))}
      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ─── Floating particles background with bounce effect ───────── */
function FloatingParticles() {
  const particles = useRef([]);
  const rafRef = useRef(null);
  
  useEffect(() => {
    const count = 80;
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 4 + 1,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    
    const animate = () => {
      particles.current = particles.current.map(p => {
        let newX = p.x + p.vx;
        let newY = p.y + p.vy;
        
        // Bounce off walls
        if (newX < 0 || newX > window.innerWidth) p.vx *= -1;
        if (newY < 0 || newY > window.innerHeight) p.vy *= -1;
        
        return {
          ...p,
          x: Math.min(Math.max(newX, 0), window.innerWidth),
          y: Math.min(Math.max(newY, 0), window.innerHeight),
        };
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  
  return (
    <div style={{ position: "absolute", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none" }}>
      {particles.current.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.radius * 2,
            height: p.radius * 2,
            borderRadius: "50%",
            background: `rgba(255,255,255,${p.opacity})`,
            pointerEvents: "none",
            transition: "all 0.1s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ─── App ───────────────────────────────────────────────────── */
export default function BingoFortune() {
  const { balls, setIsPaused, isPaused } = useBalls(24);
  const [openPanel, setOpenPanel] = useState(null);
  const [selectedBall, setSelectedBall] = useState(null);
  
  const handleBallClick = useCallback((ball) => {
    setSelectedBall(ball);
    setTimeout(() => setSelectedBall(null), 1500);
  }, []);
  
  const handleMenuSelect = useCallback((item) => {
    setIsPaused(true);
    setOpenPanel(item);
  }, [setIsPaused]);
  
  const handlePanelClose = useCallback(() => {
    setIsPaused(false);
    setOpenPanel(null);
  }, [setIsPaused]);
  
  const ActivePanel = openPanel ? PANELS[openPanel] : null;
  
  if (ActivePanel) {
    return <ActivePanel onClose={handlePanelClose} />;
  }
  
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(148deg, #0a2f6c 0%, #1a4c8c 42%, #2a6cac 100%)",
      overflow: "hidden",
      position: "relative",
      cursor: "default",
    }}>
      {/* Animated background particles */}
      <FloatingParticles />
      
      {/* Balls with bouncing physics */}
      {balls.map(b => (
        <Ball key={b.id} b={b} onClick={handleBallClick} />
      ))}
      
      {/* Selection feedback with bounce animation */}
      {selectedBall && (
        <div style={{
          position: "fixed",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%) scale(1)",
          background: "linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))",
          color: "white",
          padding: "10px 20px",
          borderRadius: 50,
          fontSize: 16,
          fontWeight: "bold",
          zIndex: 100,
          pointerEvents: "none",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255,255,255,0.3)",
          animation: "bounceUp 0.5s ease-out",
        }}>
          🎯 BALL {selectedBall.letter}{selectedBall.number}
        </div>
      )}
      
      {/* Pause indicator */}
      {isPaused && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "6px 14px",
          borderRadius: 25,
          fontSize: 12,
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255,255,255,0.3)",
          animation: "pulse 1.5s infinite",
        }}>
          ⏸ PAUSED
        </div>
      )}
      
      {/* Main Menu */}
      <Menu items={MENU} onSelect={handleMenuSelect} />
      
      {/* Instructions hint with bounce */}
      <div style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        background: "rgba(0,0,0,0.5)",
        color: "rgba(255,255,255,0.8)",
        padding: "6px 14px",
        borderRadius: 25,
        fontSize: 11,
        pointerEvents: "none",
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}>
        ✨ Click balls • Gravity bounce
      </div>
      
      <style>{`
        @keyframes bounceUp {
          0% {
            transform: translateX(-50%) translateY(20px) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateX(-50%) translateY(-5px) scale(1.05);
          }
          100% {
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Menu items constant ─────────────────────────────────── */
const MENU = ["GENERATE", "PATTERN", "CHECKER", "ANALYZER", "GALLERY"];

const PANELS = {
  GENERATE: Generate,
  PATTERN: Pattern,
  CHECKER: Checker,
  ANALYZER: Analyzer,
  GALLERY: Gallery,
};
