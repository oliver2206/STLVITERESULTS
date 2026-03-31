import { useEffect, useState } from "react";
import Generate from "./Generate";
import Pattern from "./Pattern";
import Checker from "./Checker";
import Analyzer from "./Analyzer";
import Gallery from "./Gallery";

// 🎱 CREATE BALLS
const createBalls = () => {
  const colors = {
    B: "#5DADE2",
    I: "#FF6B6B",
    N: "#D5D8DC",
    G: "#58D68D",
    O: "#F5C469",
  };

  const letters = ["B", "I", "N", "G", "O"];

  return Array.from({ length: 20 }).map(() => {
    const letter = letters[Math.floor(Math.random() * 5)];

    const ranges = {
      B: [1, 15],
      I: [16, 30],
      N: [31, 45],
      G: [46, 60],
      O: [61, 75],
    };

    const [min, max] = ranges[letter];

    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      dx: (Math.random() - 0.5) * 3,
      dy: (Math.random() - 0.5) * 3,
      letter,
      num: Math.floor(Math.random() * (max - min + 1)) + min,
      color: colors[letter],
    };
  });
};

export default function App() {
  const [page, setPage] = useState("menu");
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    setBalls(createBalls());
  }, []);

  // 🎯 BOUNCING ANIMATION
  useEffect(() => {
    let animation;

    const update = () => {
      setBalls((prev) =>
        prev.map((b) => {
          let { x, y, dx, dy } = b;
          const size = 60;

          x += dx;
          y += dy;

          if (x <= 0 || x >= window.innerWidth - size) dx *= -1;
          if (y <= 0 || y >= window.innerHeight - size) dy *= -1;

          return { ...b, x, y, dx, dy };
        })
      );

      animation = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animation);
  }, []);

  // ROUTES
  if (page === "generate") return <Generate goBack={() => setPage("menu")} />;
  if (page === "pattern") return <Pattern goBack={() => setPage("menu")} />;
  if (page === "checker") return <Checker goBack={() => setPage("menu")} />;
  if (page === "analyzer") return <Analyzer goBack={() => setPage("menu")} />;
  if (page === "gallery") return <Gallery goBack={() => setPage("menu")} />;

  return (
    <div style={styles.container}>
      {/* 🎱 BOUNCING BALLS */}
      {balls.map((b, i) => (
        <div
          key={i}
          style={{
            ...styles.ball,
            background: b.color,
            transform: `translate(${b.x}px, ${b.y}px)`,
          }}
        >
          <span style={{ fontSize: "12px" }}>{b.letter}</span>
          <strong>{b.num}</strong>
        </div>
      ))}

      {/* 🎯 MENU */}
      <div style={styles.menu}>
        
        {/* 🍀 TITLE + LEAF (FIXED POSITION) */}
        <div style={styles.titleWrapper}>
          <div style={styles.lucky}>🍀</div>
          <h1 style={styles.title}>BINGO FORTUNE</h1>
        </div>

        <button style={styles.button} onClick={() => setPage("generate")}>
          GENERATE
        </button>
        <button style={styles.button} onClick={() => setPage("pattern")}>
          PATTERN
        </button>
        <button style={styles.button} onClick={() => setPage("checker")}>
          CHECKER
        </button>
        <button style={styles.button} onClick={() => setPage("analyzer")}>
          ANALYZER
        </button>
        <button style={styles.button} onClick={() => setPage("gallery")}>
          GALLERY
        </button>
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  container: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    background: "linear-gradient(135deg, #4c00ff, #00aaff)",
  },

  ball: {
    position: "absolute",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    boxShadow: "0 5px 15px rgba(0,0,0,0.4)",
  },

  menu: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
    zIndex: 5,
  },

  // 🍀 + TITLE WRAPPER
  titleWrapper: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  // 🍀 NOW PERFECTLY ABOVE TEXT
  lucky: {
    position: "absolute",
    top: "-40px",
    fontSize: "35px",
    background: "black",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "pulse 1.5s infinite ease-in-out",
  },

  // ✨ GOLD TITLE
  title: {
    fontSize: "60px",
    fontWeight: "bold",
    letterSpacing: "5px",
    marginBottom: "20px",

    background: "linear-gradient(90deg, #FFD700, #FFF5B7, #FFD700)",
    backgroundSize: "200% auto",
    animation: "goldShine 3s linear infinite",

    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",

    textShadow: `
      0 2px 5px rgba(0,0,0,0.5),
      0 5px 15px rgba(255,215,0,0.6),
      0 0 25px rgba(255,215,0,0.8)
    `,
  },

  button: {
    width: "220px",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#333",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
};
