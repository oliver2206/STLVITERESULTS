import { useState } from "react";

const links = ["Home", "About", "Services", "Portfolio", "Contact"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Home");

  return (
    <nav style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "0 20px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#534AB7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>N</span>
          </div>
          <span style={{ fontWeight: 500, fontSize: 15 }}>Navbar</span>
        </div>

        {/* Desktop Links */}
        <ul style={{ display: "flex", gap: 4, listStyle: "none" }}>
          {links.map(link => (
            <li key={link}>
              <button
                onClick={() => setActive(link)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  background: active === link ? "#EEEDFE" : "transparent",
                  color: active === link ? "#534AB7" : "#555",
                }}
              >
                {link}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA + Hamburger */}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", cursor: "pointer" }}>
            Get Started
          </button>
          <button onClick={() => setOpen(!open)} style={{ width: 36, height: 36, border: "1px solid #eee", borderRadius: 8, background: "transparent", cursor: "pointer" }}>
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 8, zIndex: 100 }}>
          {links.map(link => (
            <button
              key={link}
              onClick={() => { setActive(link); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: active === link ? "#EEEDFE" : "transparent", color: active === link ? "#534AB7" : "#555", marginBottom: 2 }}
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
