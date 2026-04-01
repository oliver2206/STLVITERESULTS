import { useState } from "react";

function LeafIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 28C16 28 6 22 6 13C6 8.02944 10.4772 4 16 4C21.5228 4 26 8.02944 26 13C26 22 16 28 16 28Z"
        fill="#1D9E75"
      />
      <path d="M16 6C16 6 20 10 20 16C20 20 18 24 16 28" stroke="#085041" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M16 14C14 12 10 12 8 14" stroke="#085041" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
      <path d="M16 18C18 16 22 16 24 17" stroke="#085041" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav>
      <div style={{ display: "flex", alignItems: "center", height: 60 }}>
        {/* Leaf Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LeafIcon size={34} />
          <span style={{ fontWeight: 600, color: "#0F6E56" }}>Leafy</span>
        </div>
        {/* ... rest of navbar */}
      </div>
    </nav>
  );
}
