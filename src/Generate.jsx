import { useState } from "react";

const NAV_ITEMS = [
  { name: "Generate", icon: "🎲", accent: "#4f9ef8" },
  { name: "Pattern",  icon: "🔲", accent: "#a855f7" },
  { name: "Checker",  icon: "✅", accent: "#22c55e" },
  { name: "Analyzer", icon: "📊", accent: "#f97316" },
  { name: "Gallery",  icon: "🖼️", accent: "#ec4899" },
];

export default function Navbar({ activePage, onNavigate, onHome }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          padding: 0 28px;
          height: 64px;
          background: rgba(20, 20, 35, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 24px rgba(0,0,0,0.35);
          gap: 24px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.18s ease;
          user-select: none;

        }
        .navbar-brand:hover {
          transform: scale(1.05);
        }

        .navbar-logo-ring {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #0d0d1a;
          border: 2px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          transition: border-color 0.18s, box-shadow 0.18s;
          flex-shrink: 0;
        }
        .navbar-brand:hover .navbar-logo-ring {
          border-color: #4caf50;
          box-shadow: 0 0 14px rgba(76,175,80,0.6);
        }

        .navbar-brand:active {
          transform: scale(0.97);
        }

        .navbar-title {
          font-family: 'Arial Black', Arial, sans-serif;
          font-size: 16px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 2px;
          white-space: nowrap;
          line-height: 1.2;
          transition: color 0.18s;
        }
        .navbar-brand:hover .navbar-title {
          color: #4caf50;
        }

        .navbar-home-hint {
          font-size: 9px;
          color: rgba(255,255,255,0.28);
          letter-spacing: 1.5px;
          font-family: Arial, sans-serif;
          font-weight: 400;
          margin-top: 2px;
          transition: color 0.18s;
        }
        .navbar-brand:hover .navbar-home-hint {
          color: rgba(76,175,80,0.7);
        }

        .navbar-divider {
          width: 1px;
          height: 32px;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          font-family: 'Arial Black', Arial, sans-serif;
          cursor: pointer;
          border: 1.5px solid transparent;
          background: transparent;
          color: rgba(255,255,255,0.5);
          transition: all 0.18s ease;
          white-space: nowrap;
          position: relative;
        }
        .nav-btn:active {
          transform: scale(0.96) translateY(1px) !important;
        }

        .nav-btn-icon {
          font-size: 15px;
          line-height: 1;
        }

        .nav-active-bar {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          height: 2.5px;
          border-radius: 2px;
          width: 55%;
        }

        .navbar-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .navbar-badge {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          font-family: Arial, sans-serif;
          background: rgba(76,175,80,0.15);
          color: #4caf50;
          border: 1px solid rgba(76,175,80,0.3);
          white-space: nowrap;
        }
      `}</style>

      <nav className="navbar">


        {/* ── LOGO — clicking goes back to Home ── */}
        <div
          className="navbar-brand"
          onClick={onHome}
          title="Go back to Home"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onHome()}
        >
          <div className="navbar-logo-ring">🍀</div>
          <div>
            <div className="navbar-title">BINGO FORTUNE</div>
            <div className="navbar-home-hint">↩ TAP TO GO HOME</div>
          </div>
        </div>

        <div className="navbar-divider" />

        {/* ── NAV LINKS ── */}
        <div className="navbar-nav">
          {NAV_ITEMS.map(({ name, icon, accent }) => {
            const isActive  = activePage === name;
            const isHovered = hoveredItem === name;
            return (
              <button
                key={name}
                className="nav-btn"
                onClick={() => onNavigate(name)}
                onMouseEnter={() => setHoveredItem(name)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  color:
                    isActive || isHovered
                      ? "#fff"
                      : "rgba(255,255,255,0.5)",
                  background:
                    isActive
                      ? `${accent}25`
                      : isHovered
                      ? `${accent}15`
                      : "transparent",
                  borderColor:
                    isActive
                      ? `${accent}60`
                      : isHovered
                      ? `${accent}35`
                      : "transparent",
                  boxShadow:
                    isActive
                      ? `0 4px 16px ${accent}35`
                      : isHovered
                      ? `0 2px 8px ${accent}20`
                      : "none",
                  transform:
                    isHovered && !isActive
                      ? "translateY(-1px)"
                      : "none",
                }}
              >
                <span className="nav-btn-icon">{icon}</span>
                {name.toUpperCase()}
                {isActive && (
                  <span
                    className="nav-active-bar"
                    style={{ background: accent }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── RIGHT BADGE ── */}
        <div className="navbar-right">
          <div className="navbar-badge">🎱 75 BALL</div>

        </div>

      </nav>
    </>
  );
}
