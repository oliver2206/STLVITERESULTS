import { useState } from "react";

export default function Generate({ onBack }) {
  const [state, setState] = useState(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #3a6fd8 0%, #6a4fd8 50%, #4a8fd8 100%)",
        overflow: "hidden",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: "rgba(20, 20, 35, 0.75)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          zIndex: 100,
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
        }}
      >
        {/* LEFT — Leaf logo + title (clicks back) */}
        <div
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            userSelect: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          title="Back to Main Menu"
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              transition: "transform 0.15s ease",
            }}
          >
            🍀
          </div>
          <span
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 2,
              fontFamily: "'Arial Black', Arial, sans-serif",
              textShadow: "1px 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            BINGO FORTUNE
          </span>
        </div>

        {/* CENTER — Page title */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 20 }}>🎲</span>
          <span
            style={{
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 3,
              fontFamily: "'Arial Black', Arial, sans-serif",
              opacity: 0.9,
            }}
          >
            GENERATE
          </span>
        </div>

        {/* RIGHT — Back button */}
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 2,
            padding: "7px 16px",
            cursor: "pointer",
            fontFamily: "'Arial Black', Arial, sans-serif",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.18)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ← MENU
        </button>
      </nav>

      {/* PAGE CONTENT — pushed below navbar */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "'Arial Black', Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 900, opacity: 0.4, letterSpacing: 3 }}>
          YOUR GENERATE CONTENT HERE
        </h1>
      </div>
    </div>
  );
}
