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

function makeBall(id, W, H, isSpecial = false) {
  const letters = Object.keys(LETTER_RANGES);
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const [lo, hi] = LETTER_RANGES[letter];

  const radius = isSpecial ? rnd(35, 55) : rnd(28, 48);
  let vx = rnd(-4, 4);
  let vy = rnd(-4, 4);
  
  // Ensure minimum speed
  const minSpeed = 1.5;
  if (Math.abs(vx) < minSpeed) vx = vx > 0 ? minSpeed : -minSpeed;
  if (Math.abs(vy) < minSpeed) vy = vy > 0 ? minSpeed : -minSpeed;

  return {
    id, letter,
    number: Math.floor(rnd(lo, hi + 1)),
    radius,
    x: rnd(radius, W - radius),
    y: rnd(radius, H - radius),
    vx, vy,
    spin: rnd(-3, 3),
    angle: rnd(0, 360),
    mass: radius * 0.8,
    trail: [{ x: 0, y: 0 }],
  };
}

/* ─── Enhanced Physics hook with collisions ─────────────────── */
function useBalls(count) {
  const dimRef = useRef({ W: window.innerWidth, H: window.innerHeight });
  const ballsRef = useRef([]);
  const rafRef = useRef(null);
  const [, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const { W, H } = dimRef.current;
    const initialBalls = Array.from({ length: count }, (_, i) => 
      makeBall(i, W, H, i === 0) // First ball slightly larger
    );
    ballsRef.current = initialBalls;
    setTick(t => t + 1);
  }, [count]);

  useEffect(() => {
    const onResize = () => {
      const newDim = { W: window.innerWidth, H: window.innerHeight };
      // Reposition balls when window resizes
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

  // Collision detection and resolution
  const handleCollisions = useCallback((balls, W, H) => {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const b1 = balls[i];
        const b2 = balls[j];
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distance = Math.hypot(dx, dy);
        const minDist = b1.radius + b2.radius;

        if (distance < minDist) {
          // Collision detected
          const angle = Math.atan2(dy, dx);
          const overlap = minDist - distance;
          const correctionX = Math.cos(angle) * overlap / 2;
          const correctionY = Math.sin(angle) * overlap / 2;
          
          // Position correction
          b1.x -= correctionX;
          b1.y -= correctionY;
          b2.x += correctionX;
          b2.y += correctionY;
          
          // Velocity exchange (elastic collision)
          const normalX = dx / distance;
          const normalY = dy / distance;
          const relativeVX = b2.vx - b1.vx;
          const relativeVY = b2.vy - b1.vy;
          const speedAlong = relativeVX * normalX + relativeVY * normalY;
          
          if (speedAlong < 0) {
            const restitution = 0.85;
            const impulse = (1 + restitution) * speedAlong / (1/b1.mass + 1/b2.mass);
            b1.vx += impulse * normalX / b1.mass;
            b1.vy += impulse * normalY / b1.mass;
            b2.vx -= impulse * normalX / b2.mass;
            b2.vy -= impulse * normalY / b2.mass;
          }
          
          // Add spin on collision
          b1.spin += (Math.random() - 0.5) * 2;
          b2.spin += (Math.random() - 0.5) * 2;
        }
      }
    }
    return balls;
  }, []);

  useEffect(() => {
    const loop = () => {
      if (isPaused) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const { W, H } = dimRef.current;
      let balls = [...ballsRef.current];

      // Update positions and handle wall collisions
      balls = balls.map(b => {
        let { x, y, vx, vy, radius, spin, angle, mass } = b;
        
        // Apply gravity (optional)
        // vy += 0.05;
        
        // Air resistance
        vx *= 0.998;
        vy *= 0.998;
        spin *= 0.998;
        
        x += vx;
        y += vy;
        
        // Wall collisions with bounce damping
        if (x - radius < 0) {
          x = radius;
          vx = Math.abs(vx) * 0.95;
        }
        if (x + radius > W) {
          x = W - radius;
          vx = -Math.abs(vx) * 0.95;
        }
        if (y - radius < 0) {
          y = radius;
          vy = Math.abs(vy) * 0.95;
        }
        if (y + radius > H) {
          y = H - radius;
          vy = -Math.abs(vy) * 0.95;
        }
        
        angle += spin;
        
        return { ...b, x, y, vx, vy, angle, mass };
      });
      
      // Handle ball-to-ball collisions
      balls = handleCollisions(balls, W, H);
      
      ballsRef.current = balls;
      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPaused, handleCollisions]);

  return { balls: ballsRef.current, setIsPaused, isPaused };
}

/* ─── Enhanced Ball component with hover effect ────────────── */
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
        background: `radial-gradient(circle at 38% 32%, rgba(255,255,255,0.65) 0%, ${bg} 48%, ${dark} 100%)`,
        boxShadow: isHovered 
          ? `0 12px 32px rgba(0,0,0,0.5), inset 0 -5px 10px rgba(0,0,0,0.22), inset 0 4px 8px rgba(255,255,255,0.48), 0 0 20px ${glow}`
          : `0 8px 24px rgba(0,0,0,0.38), inset 0 -5px 10px rgba(0,0,0,0.22), inset 0 4px 8px rgba(255,255,255,0.38)`,
        transform: `rotate(${angle}deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        zIndex: isHovered ? 10 : 1,
      }}>
      <div style={{
        position: "absolute",
        width: "68%",
        height: "30%",
        background: "rgba(255,255,255,0.95)",
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <span style={{
          fontSize: radius * 0.6,
          fontWeight: 900,
          color: dark,
          textShadow: "0 1px 0 rgba(255,255,255,0.5)",
        }}>{number}</span>
      </div>

      <span style={{
        position: "absolute",
        top: "11%",
        fontSize: radius * 0.34,
        fontWeight: 900,
        color: "#fff",
        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
      }}>{letter}</span>
    </div>
  );
}

/* ─── Menu Component with animations ───────────────────────── */
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
      gap: 12,
      width: 280,
      zIndex: 20,
    }}>
      {items.map((item, index) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{
            padding: "16px 24px",
            borderRadius: 12,
            border: "none",
            background: hoveredIndex === index 
              ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
              : "#111",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1.1rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: hoveredIndex === index ? "scale(1.02)" : "scale(1)",
            boxShadow: hoveredIndex === index 
              ? "0 8px 20px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.2)",
            backdropFilter: "blur(10px)",
            letterSpacing: "1px",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

/* ─── Floating particles background ───────────────────────── */
function FloatingParticles() {
  const particles = useRef([]);
  const rafRef = useRef(null);
  
  useEffect(() => {
    const count = 50;
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));
    
    const animate = () => {
      particles.current = particles.current.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
      }));
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
            background: "rgba(255,255,255,0.3)",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

/* ─── App ───────────────────────────────────────────────────── */
export default function BingoFortune() {
  const { balls, setIsPaused, isPaused } = useBalls(28);
  const [openPanel, setOpenPanel] = useState(null);
  const [selectedBall, setSelectedBall] = useState(null);
  
  const handleBallClick = useCallback((ball) => {
    setSelectedBall(ball);
    setTimeout(() => setSelectedBall(null), 2000);
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
      background: "linear-gradient(148deg, #5520cc 0%, #1a6cf4 42%, #22a8e6 100%)",
      overflow: "hidden",
      position: "relative",
      cursor: "default",
    }}>
      {/* Animated background particles */}
      <FloatingParticles />
      
      {/* Balls with collision physics */}
      {balls.map(b => (
        <Ball key={b.id} b={b} onClick={handleBallClick} />
      ))}
      
      {/* Selection feedback */}
      {selectedBall && (
        <div style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: 14,
          zIndex: 100,
          pointerEvents: "none",
          backdropFilter: "blur(10px)",
        }}>
          Selected {selectedBall.letter}{selectedBall.number}
        </div>
      )}
      
      {/* Pause indicator */}
      {isPaused && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 12,
          backdropFilter: "blur(5px)",
        }}>
          ⏸ Menu Open
        </div>
      )}
      
      {/* Main Menu */}
      <Menu items={MENU} onSelect={handleMenuSelect} />
      
      {/* Instructions hint */}
      <div style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        background: "rgba(0,0,0,0.4)",
        color: "rgba(255,255,255,0.7)",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 11,
        pointerEvents: "none",
      }}>
        Click balls • Interactive physics
      </div>
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
