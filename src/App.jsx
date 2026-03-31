import { useState } from "react";
import Generate from "./Generate";
import Pattern from "./Pattern";
import Checker from "./Checker";
import Analyzer from "./Analyzer";
import Gallery from "./Gallery";

const balls = [
  { letter: "B", num: 4, color: "#5DADE2" },
  { letter: "I", num: 27, color: "#FF6B6B" },
  { letter: "N", num: 42, color: "#D5D8DC" },
  { letter: "G", num: 46, color: "#58D68D" },
  { letter: "O", num: 65, color: "#F5C469" },
  { letter: "G", num: 50, color: "#58D68D" },
  { letter: "I", num: 19, color: "#FF6B6B" },
  { letter: "N", num: 45, color: "#D5D8DC" },
  { letter: "O", num: 61, color: "#F5C469" },
  { letter: "B", num: 12, color: "#5DADE2" },
];

export default function App() {
  const [page, setPage] = useState("menu");

  if (page === "generate") return <Generate goBack={() => setPage("menu")} />;
  if (page === "pattern") return <Pattern goBack={() => setPage("menu")} />;
  if (page === "checker") return <Checker goBack={() => setPage("menu")} />;
  if (page === "analyzer") return <Analyzer goBack={() => setPage("menu")} />;
  if (page === "gallery") return <Gallery goBack={() => setPage("menu")} />;

  return (
    <div style={styles.container}>
      {/* Floating Balls */}
      {balls.map((ball, i) => (
        <div
          key={i}
          style={{
            ...styles.ball,
            background: ball.color,
            top: Math.random() * 90 + "%",
            left: Math.random() * 90 + "%",
          }}
        >
          <span style={{ fontSize: "12px" }}>{ball.letter}</span>
          <strong>{ball.num}</strong>
        </div>
      ))}

      {/* Center Content */}
      <div style={styles.menu}>
        <h1 style={styles.title}>BINGO FORTUNE</h1>

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

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    position: "relative",
    background: "linear-gradient(135deg, #4c00ff, #00aaff)",
    fontFamily: "Arial, sans-serif",
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
  },

  title: {
    color: "white",
    letterSpacing: "3px",
    marginBottom: "20px",
    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
  },

  button: {
    width: "220px",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#333",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    transition: "0.3s",
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
};
