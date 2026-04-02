import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@700;900&display=swap');
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: rgba(20, 20, 35, 0.75);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    z-index: 100;
    box-shadow: 0 2px 16px rgba(0,0,0,0.3);
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    transition: opacity 0.15s ease;
  }
  .nav-logo:hover { opacity: 0.8; }
  .logo-circle {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    flex-shrink: 0;
  }
  .logo-title {
    color: #fff;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 2px;
    font-family: 'Bebas Neue', 'Arial Black', Arial, sans-serif;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.4);
    white-space: nowrap;
  }
  @media (max-width: 360px) {
    .logo-title { display: none; }
  }
  .page-wrapper {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-family: 'Bebas Neue', 'Arial Black', Arial, sans-serif;
    text-align: center;
    padding: 24px;
    box-sizing: border-box;
  }
  .placeholder-title {
    font-size: clamp(18px, 5vw, 32px);
    font-weight: 900;
    opacity: 0.4;
    letter-spacing: 3px;
  }
`;

export default function Generate({ goBack }) {
  const [state, setState] = useState(null);

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          background:
            "linear-gradient(135deg, #3a6fd8 0%, #6a4fd8 50%, #4a8fd8 100%)",
          overflow: "hidden",
        }}
      >
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-logo" onClick={goBack} title="Back to Main Menu">
            <div className="logo-circle">🍀</div>
            <span className="logo-title">BINGO FORTUNE</span>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="page-wrapper">
          <h1 className="placeholder-title">YOUR GENERATE CONTENT HERE</h1>
        </div>
      </div>
    </>
  );
}
