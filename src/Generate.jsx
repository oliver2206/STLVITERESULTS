import { useState } from "react";

export default function Generate({ onBack }) {
  const [state, setState] = useState(null); // your Generate page state here

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
      {/* 🍀 Leaf button — clicks back to App.jsx main menu */}
      <div
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          cursor: "pointer",
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Back to Main Menu"
      >
        🍀
      </div>

      {/* Your Generate page content goes here */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#fff",
          textAlign: "center",
          fontFamily: "'Arial Black', Arial, sans-serif",
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
          🎲 GENERATE
        </h1>
        {/* Add your Generate logic/UI here */}
      </div>
    </div>
  );
}
