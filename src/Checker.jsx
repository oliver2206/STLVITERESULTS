import { useState } from "react";

const MAX_OPTIONS = [25, 30, 35, 40, 44, 48, 75];

const LETTER_COLORS = {
  B: { bg: "#e8f8f0", color: "#1D9E75", range: "1–15" },
  I: { bg: "#e6f4fb", color: "#185FA5", range: "16–30" },
  N: { bg: "#eeecfd", color: "#534AB7", range: "31–45" },
  G: { bg: "#faeeda", color: "#BA7517", range: "46–60" },
  O: { bg: "#fcebeb", color: "#A32D2D", range: "61–75" },
};

const COL_RANGES = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };
const COLS = ["B","I","N","G","O"];

function getBingoLetter(n) {
  if (n <= 15) return "B";
  if (n <= 30) return "I";
  if (n <= 45) return "N";
  if (n <= 60) return "G";
  return "O";
}

function emptyGrid() {
  const g = Array.from({ length: 5 }, () => Array(5).fill(""));
  g[2][2] = null;
  return g;
}

function checkBingo(grid, allCalled) {
  const hit = (col, row) => {
    const v = grid[col][row];
    if (v === null) return true;
    const n = parseInt(v);
    return !isNaN(n) && allCalled.has(n);
  };
  const lines = [];
  for (let r = 0; r < 5; r++)
    if ([0,1,2,3,4].every(c => hit(c, r))) lines.push({ type:"row", idx:r });
  for (let c = 0; c < 5; c++)
    if ([0,1,2,3,4].every(r => hit(c, r))) lines.push({ type:"col", idx:c });
  if ([0,1,2,3,4].every(i => hit(i, i)))   lines.push({ type:"diag", idx:0 });
  if ([0,1,2,3,4].every(i => hit(i, 4-i))) lines.push({ type:"diag", idx:1 });
  return lines;
}

function isCellInLine(lines, col, row) {
  return lines.some(l => {
    if (l.type==="row")  return row===l.idx;
    if (l.type==="col")  return col===l.idx;
    if (l.type==="diag" && l.idx===0) return col===row;
    if (l.type==="diag" && l.idx===1) return col===4-row;
    return false;
  });
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  .navbar {
    position: fixed; top:0; left:0; right:0; height:64px;
    background: rgba(20,20,35,0.75);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 24px; z-index:100; box-shadow:0 2px 16px rgba(0,0,0,0.3);
  }
  .nav-logo { display:flex; align-items:center; gap:12px; cursor:pointer; user-select:none; transition:opacity 0.15s; }
  .nav-logo:hover { opacity:0.8; }
  .logo-circle {
    width:42px; height:42px; border-radius:50%; background:#111;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; box-shadow:0 2px 8px rgba(0,0,0,0.4);
  }
  .logo-title {
    color:#fff; font-size:18px; font-weight:900; letter-spacing:2px;
    font-family:'Bebas Neue',sans-serif; white-space:nowrap;
  }
  @media(max-width:360px){ .logo-title { display:none; } }

  .page-wrapper {
    position:absolute; top:64px; left:0; right:0; bottom:0;
    overflow-y:auto; color:#fff;
    font-family:'Montserrat',sans-serif; padding:24px 16px;
  }
  .cn-card { background:rgba(255,255,255,0.95); border-radius:16px; padding:20px; margin-bottom:16px; color:#222; }
  .cn-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .cn-title { margin:0; font-size:20px; font-weight:900; letter-spacing:1px; }
  .cn-round-badge { font-size:12px; padding:4px 14px; border-radius:99px; border:1px solid #ccc; color:#666; background:white; }

  .cn-label-bar { background:#f0eeff; border-radius:10px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .cn-label-text { font-size:12px; color:#7c6fd8; font-style:italic; }
  .cn-add-label-btn { font-size:12px; padding:5px 12px; border-radius:8px; border:1px solid #b0a8f0; background:white; color:#534AB7; cursor:pointer; }

  .cn-max-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
  .cn-max-label { font-size:12px; color:#666; }
  .cn-max-btn { padding:5px 14px; border-radius:99px; border:1px solid #bbb; background:white; color:#333; cursor:pointer; font-size:12px; font-family:inherit; }
  .cn-max-btn.active { background:#534AB7; color:white; border-color:#534AB7; }

  .cn-progress-bar-track { height:6px; background:#eee; border-radius:3px; overflow:hidden; margin-bottom:4px; }
  .cn-progress-bar-fill  { height:100%; background:#534AB7; border-radius:3px; transition:width 0.3s; }
  .cn-progress-label     { text-align:right; font-size:11px; color:#888; margin-bottom:12px; }

  .cn-legend { display:flex; gap:18px; flex-wrap:wrap; margin-bottom:14px; }
  .cn-legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#666; }
  .cn-legend-dot  { width:14px; height:14px; border-radius:3px; flex-shrink:0; }

  .cn-input-row { display:flex; gap:8px; }
  .cn-input { flex:1; padding:10px 14px; border-radius:10px; border:1px solid #ccc; font-size:13px; outline:none; font-family:inherit; }
  .cn-highlight-btn { padding:10px 20px; border-radius:10px; background:#534AB7; color:white; border:none; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; white-space:nowrap; }

  .cn-letter-headers { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; margin-bottom:10px; }
  .cn-letter-cell    { text-align:center; padding:8px 4px; border-radius:10px; font-weight:900; font-size:15px; }
  .cn-letter-sub     { font-size:10px; font-weight:400; margin-top:2px; }

  .cn-ball-grid { display:grid; grid-template-columns:repeat(15,1fr); gap:4px; }
  .cn-ball { aspect-ratio:1; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; cursor:pointer; transition:all 0.2s; border:1px solid #ddd; background:white; color:#aaa; font-weight:600; }
  .cn-ball.called { background:#3a3080; color:white; border-color:#3a3080; }
  .cn-ball.prev   { background:#d4d0f5; color:#534AB7; border-color:#a09ae0; }
  .cn-ball.locked { opacity:0.35; cursor:not-allowed; }
  .cn-limit-banner { background:#fff3cd; border:1px solid #ffc107; border-radius:10px; padding:8px 14px; margin-bottom:12px; font-size:12px; color:#856404; font-weight:700; text-align:center; }

  .cn-actions { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:16px; }
  .cn-action-btn { padding:12px; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; background:white; transition:all 0.15s; }
  .cn-action-btn:hover { opacity:0.85; transform:translateY(-1px); }
  .cn-action-btn.draw { border:2px solid #1D9E75; color:#1D9E75; }
  .cn-action-btn.new  { border:2px solid #BA7517; color:#BA7517; }
  .cn-action-btn.rst  { border:2px solid #A32D2D; color:#A32D2D; }

  .cn-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
  .cn-stat-card  { background:#f5f5f5; border-radius:12px; padding:14px 8px; text-align:center; }
  .cn-stat-num   { font-size:24px; font-weight:900; color:#222; }
  .cn-stat-label { font-size:11px; color:#888; margin-top:4px; }

  .cn-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:999; }
  .cn-modal { background:white; border-radius:16px; padding:24px; width:300px; color:#222; }
  .cn-modal h3 { margin:0 0 12px; font-size:16px; }
  .cn-modal input { width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:13px; margin-bottom:12px; font-family:inherit; }
  .cn-modal-btns { display:flex; gap:8px; justify-content:flex-end; }
  .cn-modal-cancel { padding:8px 16px; border-radius:8px; border:1px solid #ccc; background:white; cursor:pointer; font-family:inherit; }
  .cn-modal-save   { padding:8px 16px; border-radius:8px; background:#534AB7; color:white; border:none; cursor:pointer; font-family:inherit; }

  .cards-section { margin-bottom: 24px; }
  .cards-section-header {
    display:flex; justify-content:space-between; align-items:center;
    margin-bottom:12px; flex-wrap:wrap; gap:8px;
  }
  .cards-section-title { font-size:16px; font-weight:900; color:#fff; letter-spacing:1px; }
  .cards-section-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

  .cards-per-row-label { font-size:12px; color:rgba(255,255,255,0.7); font-weight:600; }
  .cards-per-row-btns  { display:flex; gap:4px; }
  .cpr-btn {
    width:30px; height:30px; border-radius:7px;
    border:1.5px solid rgba(255,255,255,0.3);
    background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.7);
    font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s;
  }
  .cpr-btn:hover { background:rgba(255,255,255,0.2); color:#fff; }
  .cpr-btn.active { background:#fff; color:#534AB7; border-color:#fff; }

  .cards-add-btn {
    padding:8px 18px; border-radius:99px; background:rgba(255,255,255,0.15);
    border:1.5px solid rgba(255,255,255,0.4); color:#fff; font-size:13px;
    font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s;
    backdrop-filter:blur(8px);
  }
  .cards-add-btn:hover { background:rgba(255,255,255,0.25); }
  .cards-play-all-btn {
    background:rgba(29,158,117,0.2);
    border-color:rgba(29,158,117,0.6);
    color:#4fffbd;
  }
  .cards-play-all-btn:hover { background:rgba(29,158,117,0.35); }
  .cards-play-all-btn.active {
    background:rgba(29,158,117,0.85);
    color:#fff;
    border-color:#1D9E75;
  }
  .cards-play-all-btn.active:hover { background:#1D9E75; }
    border-color:rgba(255,215,0,0.6);
    color:#FFD700;
  }
  .cards-add-btn-random:hover { background:rgba(255,215,0,0.35); }

  .bulk-random-row {
    display:flex; align-items:center; gap:6px;
    background:rgba(255,215,0,0.1);
    border:1.5px solid rgba(255,215,0,0.4);
    border-radius:99px; padding:4px 6px 4px 12px;
  }
  .bulk-random-label { font-size:15px; line-height:1; }
  .bulk-count-input {
    width:68px; padding:4px 6px; border-radius:8px;
    border:1.5px solid rgba(255,215,0,0.5);
    background:rgba(255,255,255,0.15); color:#FFD700;
    font-size:13px; font-weight:900; font-family:inherit;
    text-align:center; outline:none;
    -moz-appearance:textfield;
  }
  .bulk-count-input::-webkit-outer-spin-button,
  .bulk-count-input::-webkit-inner-spin-button { -webkit-appearance:none; }
  .bulk-count-input:focus { border-color:#FFD700; background:rgba(255,255,255,0.22); }
  .bulk-random-row .cards-add-btn-random {
    border-radius:99px; padding:5px 14px; font-size:12px;
    border:none; background:rgba(255,215,0,0.85); color:#3a3080;
  }
  .bulk-random-row .cards-add-btn-random:hover { background:#FFD700; }

  .cards-new-row {
    display:flex; gap:8px; margin-bottom:14px;
    background:rgba(255,255,255,0.12); border-radius:12px; padding:10px;
    backdrop-filter:blur(8px);
  }
  .cards-new-input {
    flex:1; padding:9px 14px; border-radius:9px; border:1.5px solid rgba(255,255,255,0.3);
    background:rgba(255,255,255,0.15); color:#fff; font-size:13px;
    font-family:inherit; outline:none;
  }
  .cards-new-input::placeholder { color:rgba(255,255,255,0.5); }
  .cards-new-input:focus { border-color:#fff; }
  .cards-new-create {
    padding:9px 18px; border-radius:9px; background:#fff; color:#534AB7;
    border:none; font-size:13px; font-weight:900; cursor:pointer; font-family:inherit;
    white-space:nowrap; transition:all 0.15s;
  }
  .cards-new-create:hover { background:#f0eeff; }
  .cards-new-random {
    background:linear-gradient(135deg,#FFD700,#FFA500);
    color:#3a3080;
  }
  .cards-new-random:hover { background:linear-gradient(135deg,#ffe033,#ffb733); }

  .cards-grid { display: grid; gap: 10px; align-items: start; }
  .cards-grid.cpr-1 { grid-template-columns: 1fr; }
  .cards-grid.cpr-2 { grid-template-columns: repeat(2, 1fr); }
  .cards-grid.cpr-3 { grid-template-columns: repeat(3, 1fr); }
  .cards-grid.cpr-4 { grid-template-columns: repeat(4, 1fr); }
  .cards-grid.cpr-5 { grid-template-columns: repeat(5, 1fr); }

  @media (max-width: 900px) {
    .cards-grid.cpr-5 { grid-template-columns: repeat(3, 1fr); }
    .cards-grid.cpr-4 { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 620px) {
    .cards-grid.cpr-5,
    .cards-grid.cpr-4,
    .cards-grid.cpr-3 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 400px) {
    .cards-grid.cpr-5,
    .cards-grid.cpr-4,
    .cards-grid.cpr-3,
    .cards-grid.cpr-2 { grid-template-columns: 1fr; }
  }

  .bc-inline-card {
    background:rgba(255,255,255,0.97); border-radius:14px;
    padding:12px; color:#222;
    box-shadow:0 4px 20px rgba(0,0,0,0.15);
    min-width: 0;
  }
  .cards-grid.cpr-3 .bc-inline-card,
  .cards-grid.cpr-4 .bc-inline-card,
  .cards-grid.cpr-5 .bc-inline-card { padding: 9px; border-radius: 11px; }

  .bc-inline-card-header {
    display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;
    flex-wrap: wrap; gap: 4px;
  }
  .bc-inline-card-name {
    font-size:13px; font-weight:900;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  .cards-grid.cpr-4 .bc-inline-card-name,
  .cards-grid.cpr-5 .bc-inline-card-name { font-size: 11px; }

  .bc-inline-card-right { display:flex; align-items:center; gap:5px; flex-shrink:0; }
  .bc-pill      { font-size:10px; padding:2px 8px; border-radius:99px; font-weight:700; white-space:nowrap; }
  .bc-pill-hits { background:#eee; color:#555; }
  .bc-pill-bingo{ background:#FFD700; color:#3a3080; }
  .bc-del-btn {
    width:24px; height:24px; border-radius:50%; border:none; background:#f5f5f5;
    color:#aaa; font-size:14px; cursor:pointer; display:flex; align-items:center;
    justify-content:center; transition:all 0.15s; flex-shrink:0;
  }
  .bc-del-btn:hover { background:#ffe0e0; color:#e53935; }

  .bc-inline-tabs { display:flex; gap:4px; margin-bottom:8px; }
  .bc-inline-tab {
    flex:1; padding:5px 2px; border-radius:7px; border:1.5px solid #e0e0e0;
    font-size:10px; font-weight:700; cursor:pointer; font-family:inherit;
    background:white; color:#aaa; transition:all 0.15s; text-align:center;
  }
  .bc-inline-tab.active { border-color:#534AB7; background:#f0eeff; color:#534AB7; }

  .bc-col-headers { display:grid; grid-template-columns:repeat(5,1fr); gap:3px; margin-bottom:3px; }
  .bc-col-hdr {
    text-align:center; padding:5px 2px; border-radius:6px;
    font-weight:900; font-size:14px; font-family:'Bebas Neue',sans-serif;
  }
  .cards-grid.cpr-4 .bc-col-hdr,
  .cards-grid.cpr-5 .bc-col-hdr { font-size: 11px; padding: 4px 1px; }

  .bc-input-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:3px; }
  .bc-cell-input {
    aspect-ratio:1; border-radius:6px; border:1.5px solid #e0e0e0;
    text-align:center; font-size:11px; font-weight:700;
    font-family:'Montserrat',sans-serif; outline:none;
    background:#fafafa; color:#222; width:100%; padding:0;
    transition:border-color 0.15s, background 0.15s;
    -moz-appearance:textfield;
  }
  .bc-cell-input::-webkit-outer-spin-button,
  .bc-cell-input::-webkit-inner-spin-button { -webkit-appearance:none; }
  .bc-cell-input:focus { border-color:#534AB7; background:#f3f0ff; }
  .bc-cell-input.err { border-color:#e53935 !important; background:#fff5f5; }
  .bc-cell-input.ok  { border-color:#1D9E75 !important; background:#f0faf5; }
  .bc-cell-free {
    aspect-ratio:1; border-radius:6px;
    background:linear-gradient(135deg,#534AB7,#3a3080);
    display:flex; align-items:center; justify-content:center;
    font-size:8px; font-weight:900; color:white; letter-spacing:0.5px;
  }
  .bc-hint { font-size:9px; color:#bbb; text-align:center; margin-top:5px; font-style:italic; }
  .bc-err-msg { font-size:10px; color:#e53935; margin-top:4px; font-style:italic; }

  .bc-play-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:3px; }
  .bc-play-cell {
    aspect-ratio:1; border-radius:6px; border:1.5px solid #e0e0e0;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; color:#ccc; background:#fafafa; transition:all 0.2s;
  }
  .bc-play-cell.empty-val  { color:#ddd; font-size:16px; }
  .bc-play-cell.hit        { background:#3a3080; color:white; border-color:#3a3080; box-shadow:0 2px 6px rgba(58,48,128,0.3); transform:scale(1.04); }
  .bc-play-cell.bingo-ln   { background:#FFD700; color:#3a3080; border-color:#e6b800; box-shadow:0 2px 10px rgba(255,215,0,0.45); }
  .bc-play-cell.free-cell  { background:linear-gradient(135deg,#534AB7,#3a3080); color:white; border-color:#3a3080; font-size:8px; font-weight:900; letter-spacing:0.5px; }

  .bc-summary { margin-top:8px; padding:6px 10px; background:#f5f5f5; border-radius:8px; display:flex; justify-content:space-between; align-items:center; }
  .bc-summary-lbl { font-size:10px; color:#999; font-weight:700; }
  .bc-summary-val { font-size:16px; font-weight:900; color:#534AB7; }

  .bc-bingo-banner {
    margin-top:8px; padding:8px; border-radius:9px; text-align:center;
    font-size:15px; font-weight:900; letter-spacing:2px; color:#3a3080;
    font-family:'Bebas Neue',sans-serif;
    background:linear-gradient(135deg,#FFD700,#FFA500);
    box-shadow:0 3px 12px rgba(255,165,0,0.4);
    animation:bc-pulse 0.9s ease-in-out infinite alternate;
  }
  @keyframes bc-pulse { from{transform:scale(1)} to{transform:scale(1.02)} }

  /* ── CARD FOOTER ── */
  .bc-card-footer { display:flex; justify-content:flex-end; gap:6px; margin-top:6px; }
  .bc-clear-btn {
    font-size:10px; padding:4px 12px; border-radius:7px;
    border:1.5px solid #e0e0e0; background:white; color:#aaa;
    cursor:pointer; font-family:inherit; transition:all 0.15s;
  }
  .bc-clear-btn:hover { border-color:#e53935; color:#e53935; background:#fff5f5; }

  /* ── RANDOM GENERATE BUTTON ── */
  .bc-random-btn {
    font-size:10px; padding:4px 12px; border-radius:7px;
    border:1.5px solid #a09ae0; background:#f0eeff; color:#534AB7;
    cursor:pointer; font-family:inherit; font-weight:700;
    transition:all 0.18s; display:flex; align-items:center; gap:4px;
  }
  .bc-random-btn:hover {
    background:#534AB7; color:white; border-color:#534AB7;
    transform:translateY(-1px); box-shadow:0 3px 10px rgba(83,74,183,0.3);
  }
  .bc-random-btn:active { transform:translateY(0); }
  .bc-random-btn.spinning .bc-dice-icon { display:inline-block; animation:bc-spin 0.4s ease-out; }
  @keyframes bc-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .bingo-count-badge {
    background:#FFD700; border-radius:99px; padding:6px 16px;
    color:#3a3080; font-weight:900; font-size:13px; font-family:inherit;
  }

  /* ── FREQUENCY TRACKER ── */
  .freq-card { background:rgba(255,255,255,0.95); border-radius:16px; padding:0; margin-bottom:16px; color:#222; overflow:hidden; }
  .freq-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; cursor:pointer; user-select:none; }
  .freq-header:hover { background:rgba(0,0,0,0.02); }
  .freq-title { margin:0; font-size:18px; font-weight:900; letter-spacing:1px; }
  .freq-title-row { display:flex; align-items:center; gap:10px; }
  .freq-summary-pills { display:flex; gap:5px; flex-wrap:wrap; }
  .freq-summary-pill { font-size:10px; font-weight:700; padding:2px 8px; border-radius:99px; }
  .freq-chevron { font-size:18px; color:#999; transition:transform 0.25s; line-height:1; }
  .freq-chevron.open { transform:rotate(180deg); }
  .freq-body { padding:0 20px 20px; border-top:1px solid #f0f0f0; }
  .freq-body.collapsed { display:none; }
  .freq-filter-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
  .freq-filter-btn { padding:5px 14px; border-radius:99px; border:1px solid #bbb; background:white; color:#333; cursor:pointer; font-size:12px; font-family:inherit; transition:all 0.15s; }
  .freq-filter-btn.active { background:#534AB7; color:white; border-color:#534AB7; }
  .freq-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(52px,1fr)); gap:8px; }
  .freq-ball { border-radius:12px; padding:6px 4px; text-align:center; border:1.5px solid #e0e0e0; background:#fafafa; }
  .freq-ball-num { font-size:13px; font-weight:900; color:#222; }
  .freq-ball-cnt { font-size:10px; font-weight:700; margin-top:2px; border-radius:99px; padding:1px 6px; display:inline-block; }
  .freq-ball-cnt.x1 { background:#e8f8f0; color:#1D9E75; }
  .freq-ball-cnt.x2 { background:#e6f4fb; color:#185FA5; }
  .freq-ball-cnt.x3 { background:#eeecfd; color:#534AB7; }
  .freq-ball-cnt.x4 { background:#faeeda; color:#BA7517; }
  .freq-ball-cnt.x5p{ background:#fcebeb; color:#A32D2D; }
  .freq-empty { text-align:center; color:#bbb; font-size:13px; padding:20px 0; font-style:italic; }
  .freq-legend { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
  .freq-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; color:#666; }
  .freq-legend-dot { width:12px; height:12px; border-radius:99px; flex-shrink:0; }
`;

/* ── FREQUENCY TRACKER COMPONENT ── */
function FrequencyTracker({ freqMap }) {
  const [freqFilter, setFreqFilter] = useState("all");
  const [open, setOpen] = useState(true);
  const cntClass = c => c>=5?"x5p":c===4?"x4":c===3?"x3":c===2?"x2":"x1";
  const cntLabel = c => c>=5?`${c}x`:c===4?"4x":c===3?"3x":c===2?"2x":"1x";
  const entries = Object.entries(freqMap)
    .map(([n,c]) => [parseInt(n),c])
    .filter(([,c]) => freqFilter==="all" || (freqFilter==="5"?c>=5:c===parseInt(freqFilter)))
    .sort((a,b) => b[1]-a[1] || a[0]-b[0]);
  const legendItems = [[1,"#1D9E75","#e8f8f0"],[2,"#185FA5","#e6f4fb"],[3,"#534AB7","#eeecfd"],[4,"#BA7517","#faeeda"],[5,"#A32D2D","#fcebeb"]];
  return (
    <div className="freq-card">
      <div className="freq-header" onClick={()=>setOpen(o=>!o)}>
        <div className="freq-title-row">
          <h2 className="freq-title">📊 Number Frequency</h2>
          {!open && (
            <div className="freq-summary-pills">
              {legendItems.map(([x,col,bg])=>{
                const cnt = Object.values(freqMap).filter(c=>x===5?c>=5:c===x).length;
                if (!cnt) return null;
                return <span key={x} className="freq-summary-pill" style={{background:bg,color:col}}>{x===5?"5x+":x+"x"} ×{cnt}</span>;
              })}
            </div>
          )}
        </div>
        <span className={`freq-chevron${open?" open":""}`}>⌄</span>
      </div>
      <div className={`freq-body${open?"":" collapsed"}`}>
        <div className="freq-legend" style={{marginTop:14}}>
          {legendItems.map(([x,col,bg])=>{
            const cnt = Object.values(freqMap).filter(c=>x===5?c>=5:c===x).length;
            if (!cnt) return null;
            return (
              <div key={x} className="freq-legend-item">
                <div className="freq-legend-dot" style={{background:bg,border:`1.5px solid ${col}`}}/>
                <span style={{color:col,fontWeight:700}}>{x===5?"5x+":x+"x"}</span>
                <span> — {cnt} number{cnt!==1?"s":""}</span>
              </div>
            );
          })}
        </div>
        <div className="freq-filter-row">
          {[["all","All"],["1","1x"],["2","2x"],["3","3x"],["4","4x"],["5","5x+"]].map(([v,l])=>(
            <button key={v} className={`freq-filter-btn${freqFilter===v?" active":""}`} onClick={()=>setFreqFilter(v)}>{l}</button>
          ))}
        </div>
        {entries.length===0
          ? <div className="freq-empty">No numbers match this filter</div>
          : <div className="freq-grid">
              {entries.map(([n,c])=>(
                <div key={n} className="freq-ball">
                  <div className="freq-ball-num">{n}</div>
                  <div className={`freq-ball-cnt ${cntClass(c)}`}>{cntLabel(c)}</div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

/* ── single inline card component ── */
function InlineBingoCard({ card, idx, allCalled, onUpdate, onDelete, cardsPerRow, forceTab }) {
  const [localTab, setLocalTab] = useState("edit");
  const tab     = forceTab || localTab;
  const setTab  = (t) => { setLocalTab(t); };
  const [errors, setErrors]     = useState({});
  const [spinning, setSpinning] = useState(false);
  const colColors               = Object.values(LETTER_COLORS);

  const lines    = checkBingo(card.grid, allCalled);
  const hasBingo = lines.length > 0;

  function hitCount() {
    let n = 0;
    for (let c=0;c<5;c++) for (let r=0;r<5;r++) {
      const v = card.grid[c][r];
      if (v===null){n++;continue;}
      const num=parseInt(v);
      if (!isNaN(num) && allCalled.has(num)) n++;
    }
    return n;
  }

  function handleCellChange(col, row, raw) {
    const next = card.grid.map(c=>[...c]);
    next[col][row] = raw;
    const key = `${col}-${row}`;
    const num = parseInt(raw);
    const [min,max] = COL_RANGES[COLS[col]];
    const newErr = {...errors};
    if (raw==="") {
      delete newErr[key];
    } else if (isNaN(num)||num<min||num>max) {
      newErr[key]=true;
    } else {
      let dup=false;
      outer: for (let c=0;c<5;c++) for (let r=0;r<5;r++) {
        if (c===col&&r===row) continue;
        if (c===2&&r===2)    continue;
        if (parseInt(next[c][r])===num){dup=true;break outer;}
      }
      if (dup) newErr[key]=true; else delete newErr[key];
    }
    setErrors(newErr);
    onUpdate(idx, next);
  }

  function handleClear() {
    const blank = emptyGrid();
    setErrors({});
    onUpdate(idx, blank);
  }

  // ── NEW: random fill ──
  function handleRandom() {
    const next = emptyGrid();
    for (let col = 0; col < 5; col++) {
      const [min, max] = COL_RANGES[COLS[col]];
      // Build pool for this column
      const pool = [];
      for (let n = min; n <= max; n++) pool.push(n);
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      // Fill 5 rows — skip FREE cell (col=2, row=2)
      let picked = 0;
      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) continue; // FREE
        next[col][row] = String(pool[picked++]);
      }
    }
    setErrors({});
    // Trigger spin animation
    setSpinning(true);
    setTimeout(() => setSpinning(false), 450);
    onUpdate(idx, next);
  }

  const errCount = Object.keys(errors).length;
  const hits     = hitCount();
  const isCompact = cardsPerRow >= 3;

  return (
    <div className="bc-inline-card">
      <div className="bc-inline-card-header">
        <span className="bc-inline-card-name">🃏 {card.name}</span>
        <div className="bc-inline-card-right">
          {hasBingo && <span className="bc-pill bc-pill-bingo">BINGO!</span>}
          <span className="bc-pill bc-pill-hits">{hits}/25</span>
          <button className="bc-del-btn" onClick={()=>onDelete(idx)} title="Delete">×</button>
        </div>
      </div>

      <div className="bc-inline-tabs">
        <button className={`bc-inline-tab${tab==="edit"?" active":""}`} onClick={()=>setTab("edit")}>
          {isCompact ? "✏️ Edit" : "✏️ Enter numbers"}
        </button>
        <button className={`bc-inline-tab${tab==="play"?" active":""}`} onClick={()=>setTab("play")}>
          {isCompact ? "🎯 Play" : "🎯 Check card"}
        </button>
      </div>

      <div className="bc-col-headers">
        {COLS.map((l,ci)=>(
          <div key={l} className="bc-col-hdr" style={{background:colColors[ci].bg, color:colColors[ci].color}}>{l}</div>
        ))}
      </div>

      {tab==="edit" && (<>
        <div className="bc-input-grid">
          {Array.from({length:5},(_,row)=>
            Array.from({length:5},(_,col)=>{
              if (col===2&&row===2) return <div key={`${col}-${row}`} className="bc-cell-free">FREE</div>;
              const key=`${col}-${row}`;
              const val=card.grid[col][row];
              const hasErr=!!errors[key];
              const num=parseInt(val);
              const isOk=val!==""&&!hasErr&&!isNaN(num);
              const [min,max]=COL_RANGES[COLS[col]];
              return (
                <input key={key} type="number"
                  className={`bc-cell-input${hasErr?" err":isOk?" ok":""}`}
                  placeholder="—" min={min} max={max} value={val}
                  onChange={e=>handleCellChange(col,row,e.target.value)}
                />
              );
            })
          )}
        </div>
        {!isCompact && <div className="bc-hint">B:1–15 · I:16–30 · N:31–45 · G:46–60 · O:61–75</div>}
        {errCount>0 && <div className="bc-err-msg">⚠️ {errCount} invalid cell{errCount>1?"s":""}</div>}
        <div className="bc-card-footer">
          {/* ── RANDOM GENERATE BUTTON ── */}
          <button
            className={`bc-random-btn${spinning?" spinning":""}`}
            onClick={handleRandom}
            title="Fill card with random valid numbers"
          >
            <span className="bc-dice-icon">🎲</span>
            {isCompact ? "Random" : "Random fill"}
          </button>
          <button className="bc-clear-btn" onClick={handleClear}>🗑 Clear</button>
        </div>
      </>)}

      {tab==="play" && (<>
        <div className="bc-play-grid">
          {Array.from({length:5},(_,row)=>
            Array.from({length:5},(_,col)=>{
              if (col===2&&row===2) return <div key={`${col}-${row}`} className="bc-play-cell free-cell">FREE</div>;
              const val=card.grid[col][row];
              const num=parseInt(val);
              const isEmpty=val===""||isNaN(num);
              const isHit=!isEmpty&&allCalled.has(num);
              const inLine=isCellInLine(lines,col,row);
              let cls="bc-play-cell";
              if (isEmpty)            cls+=" empty-val";
              else if (inLine&&isHit) cls+=" bingo-ln";
              else if (isHit)         cls+=" hit";
              return <div key={`${col}-${row}`} className={cls}>{isEmpty?"·":num}</div>;
            })
          )}
        </div>
        <div className="bc-summary">
          <span className="bc-summary-lbl">Matched</span>
          <span className="bc-summary-val">{hits}/25</span>
        </div>
        {hasBingo && (
          <div className="bc-bingo-banner">🎉 BINGO{lines.length>1?` x${lines.length}`:""}!</div>
        )}
      </>)}
    </div>
  );
}

/* ── MAIN ── */
export default function Generate({ onBack }) {
  const [maxBalls,setMaxBalls]               = useState(48);
  const [calledThisRound,setCalledThisRound] = useState(new Set());
  const [prevNumbers,setPrevNumbers]         = useState(new Set());
  const [freqMap,setFreqMap]                 = useState({});
  const [roundsDone,setRoundsDone]           = useState(0);
  const [roundNum,setRoundNum]               = useState(1);
  const [inputVal,setInputVal]               = useState("");
  const [label,setLabel]                     = useState("");
  const [showModal,setShowModal]             = useState(false);
  const [labelDraft,setLabelDraft]           = useState("");
  const [bingoCards,setBingoCards]           = useState([]);
  const [showNewRow,setShowNewRow]           = useState(false);
  const [newCardName,setNewCardName]         = useState("");
  const [cardsPerRow,setCardsPerRow]         = useState(4);
  const [bulkCount,setBulkCount]             = useState(10);
  const [globalTab,setGlobalTab]             = useState(null); // null=individual, "play"=all play, "edit"=all edit

  const calledNumbers  = calledThisRound;
  const totalDrawn     = calledThisRound.size;
  const remaining      = 75 - totalDrawn;
  const progressPct    = Math.min(100, (calledThisRound.size / maxBalls) * 100);
  const limitReached   = calledThisRound.size >= maxBalls;

  function getBallState(n) {
    if (calledThisRound.has(n)) return "called";
    if (prevNumbers.has(n))     return "prev";
    return "";
  }

  function toggleBall(n) {
    const alreadyCalled = calledThisRound.has(n);
    if (!alreadyCalled && calledThisRound.size >= maxBalls) return;
    setCalledThisRound(p => { const s = new Set(p); alreadyCalled ? s.delete(n) : s.add(n); return s; });
    setFreqMap(f => { const m = {...f}; if (alreadyCalled) { m[n] = Math.max(0, (m[n]||0) - 1); if (m[n]===0) delete m[n]; } else { m[n] = (m[n]||0) + 1; } return m; });
  }

  function highlightNumber() {
    const v = parseInt(inputVal);
    if (isNaN(v) || v < 1 || v > 75) { setInputVal(""); return; }
    if (!calledThisRound.has(v) && calledThisRound.size >= maxBalls) { setInputVal(""); return; }
    if (!calledThisRound.has(v)) {
      setCalledThisRound(p => new Set([...p, v]));
      setFreqMap(f => ({ ...f, [v]: (f[v]||0) + 1 }));
    }
    setInputVal("");
  }

  function drawRandom() {
    if (calledThisRound.size >= maxBalls) return;
    const pool = [];
    for (let i=1; i<=75; i++) if (!calledThisRound.has(i)) pool.push(i);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCalledThisRound(p => new Set([...p, pick]));
    setFreqMap(f => ({ ...f, [pick]: (f[pick]||0) + 1 }));
  }

  function newRound() {
    setPrevNumbers(new Set(calledThisRound));
    setCalledThisRound(new Set());
    setRoundsDone(r => r + 1);
    setRoundNum(r => r + 1);
  }

  function resetAll() {
    setCalledThisRound(new Set());
    setPrevNumbers(new Set());
    setFreqMap({});
    setRoundsDone(0);
    setRoundNum(1);
  }

  function saveLabel() { setLabel(labelDraft); setShowModal(false); }

  function generateRandomGrid() {
    const next = emptyGrid();
    for (let col = 0; col < 5; col++) {
      const [min, max] = COL_RANGES[COLS[col]];
      const pool = [];
      for (let n = min; n <= max; n++) pool.push(n);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      let picked = 0;
      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) continue;
        next[col][row] = String(pool[picked++]);
      }
    }
    return next;
  }

  function createCard() {
    const name = newCardName.trim() || `Card ${bingoCards.length + 1}`;
    setBingoCards(p => [...p, { name, grid: emptyGrid() }]);
    setNewCardName("");
    setShowNewRow(false);
  }

  function createRandomCard() {
    const name = newCardName.trim() || `Card ${bingoCards.length + 1}`;
    setBingoCards(p => [...p, { name, grid: generateRandomGrid() }]);
    setNewCardName("");
    setShowNewRow(false);
  }

  function createBulkRandomCards(count) {
    setBingoCards(p => {
      const extras = Array.from({ length: count }, (_, i) => ({
        name: `Card ${p.length + i + 1}`,
        grid: generateRandomGrid(),
      }));
      return [...p, ...extras];
    });
    setShowNewRow(false);
  }
  function updateCard(idx, grid) { setBingoCards(p => p.map((c,i) => i===idx ? {...c, grid} : c)); }
  function deleteCard(idx)       { setBingoCards(p => p.filter((_,i) => i!==idx)); }

  const bingoCnt = bingoCards.filter(c => checkBingo(c.grid, calledNumbers).length > 0).length;

  return (
    <>
      <style>{styles}</style>
      <div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"linear-gradient(135deg,#3a6fd8 0%,#6a4fd8 50%,#4a8fd8 100%)",overflow:"hidden"}}>

        <nav className="navbar">
          <div className="nav-logo" onClick={onBack}>
            <div className="logo-circle">🍀</div>
            <span className="logo-title">BINGO FORTUNE</span>
          </div>
          {bingoCnt > 0 && (
            <span className="bingo-count-badge">
              🎉 {bingoCnt} BINGO{bingoCnt>1?"S":""}!
            </span>
          )}
        </nav>

        <div className="page-wrapper">

          <div className="cn-card">
            <div className="cn-header">
              <h2 className="cn-title">Called numbers</h2>
              <span className="cn-round-badge">Round {roundNum}</span>
            </div>
            <div className="cn-label-bar">
              <span className="cn-label-text">{label||"No label set — add a game name, event, or date"}</span>
              <button className="cn-add-label-btn" onClick={()=>{setLabelDraft(label);setShowModal(true);}}>+ Add label</button>
            </div>
            <div className="cn-max-row">
              <span className="cn-max-label">Max balls / round</span>
              {MAX_OPTIONS.map(n=>(
                <button key={n} className={`cn-max-btn${maxBalls===n?" active":""}`} onClick={()=>setMaxBalls(n)}>{n}</button>
              ))}
            </div>
            <div className="cn-progress-bar-track"><div className="cn-progress-bar-fill" style={{width:`${progressPct}%`}}/></div>
            <div className="cn-progress-label">{calledThisRound.size} / {maxBalls}</div>
            <div className="cn-legend">
              <div className="cn-legend-item"><div className="cn-legend-dot" style={{background:"#3a3080"}}/>Called this round</div>
              <div className="cn-legend-item"><div className="cn-legend-dot" style={{background:"#d4d0f5",border:"1px solid #a09ae0"}}/>Previous rounds</div>
              <div className="cn-legend-item"><div className="cn-legend-dot" style={{background:"white",border:"1px solid #ccc"}}/>Not called</div>
            </div>
            <div className="cn-input-row">
              <input className="cn-input" type="number" min={1} max={75} placeholder="Enter 1-75 and press Enter"
                value={inputVal} onChange={e=>setInputVal(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&highlightNumber()}/>
              <button className="cn-highlight-btn" onClick={highlightNumber}>Highlight</button>
            </div>
          </div>

          <div className="cn-card">
            <div className="cn-letter-headers">
              {Object.entries(LETTER_COLORS).map(([l,info])=>(
                <div key={l} className="cn-letter-cell" style={{background:info.bg,color:info.color}}>
                  {l}<div className="cn-letter-sub">{info.range}</div>
                </div>
              ))}
            </div>
            {limitReached && (
              <div className="cn-limit-banner">🔒 Round limit reached ({maxBalls} balls) — start a new round to continue drawing</div>
            )}
            <div className="cn-ball-grid">
              {Array.from({length:75},(_,i)=>i+1).map(n=>(
                <div key={n} className={`cn-ball${getBallState(n)?" "+getBallState(n):""}${!calledThisRound.has(n) && limitReached ? " locked" : ""}`}
                  onClick={()=>toggleBall(n)} title={`${getBingoLetter(n)}-${n}`}>{n}</div>
              ))}
            </div>
          </div>

          <div className="cn-actions">
            <button className="cn-action-btn draw" onClick={drawRandom}>Draw random</button>
            <button className="cn-action-btn new"  onClick={newRound}>New round</button>
            <button className="cn-action-btn rst"  onClick={resetAll}>Reset</button>
          </div>

          <div className="cn-stats">
            {[["Drawn",totalDrawn],["Remaining",remaining],["Rounds done",roundsDone],["Max / round",maxBalls]].map(([l,v])=>(
              <div key={l} className="cn-stat-card">
                <div className="cn-stat-num">{v}</div>
                <div className="cn-stat-label">{l}</div>
              </div>
            ))}
          </div>

          {Object.keys(freqMap).length > 0 && <FrequencyTracker freqMap={freqMap} />}

          <div className="cards-section">
            <div className="cards-section-header">
              <span className="cards-section-title">
                🃏 Bingo Cards {bingoCards.length>0 && `(${bingoCards.length})`}
              </span>
              <div className="cards-section-right">
                <span className="cards-per-row-label">Per row:</span>
                <div className="cards-per-row-btns">
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} className={`cpr-btn${cardsPerRow===n?" active":""}`}
                      onClick={()=>setCardsPerRow(n)} title={`${n} card${n>1?"s":""} per row`}>{n}</button>
                  ))}
                </div>
                <div className="bulk-random-row">
                  <span className="bulk-random-label">🎲</span>
                  <input
                    className="bulk-count-input"
                    type="number" min={1} max={10000}
                    value={bulkCount}
                    onChange={e => setBulkCount(Math.max(1, Math.min(10000, parseInt(e.target.value)||1)))}
                  />
                  <button className="cards-add-btn cards-add-btn-random" onClick={()=>createBulkRandomCards(bulkCount)}>
                    Generate
                  </button>
                </div>
                <button className="cards-add-btn" onClick={()=>{ setShowNewRow(r=>!r); setNewCardName(""); }}>
                  {showNewRow ? "✕ Cancel" : "+ Add card"}
                </button>
                {bingoCards.length > 0 && (
                  <button
                    className={`cards-add-btn cards-play-all-btn${globalTab==="play" ? " active" : ""}`}
                    onClick={()=>setGlobalTab(t => t==="play" ? "edit" : "play")}
                  >
                    {globalTab==="play" ? "✏️ Edit All" : "▶ Play All"}
                  </button>
                )}
              </div>
            </div>

            {showNewRow && (
              <div className="cards-new-row">
                <input className="cards-new-input"
                  placeholder="Player name (e.g. Maria, Table 3)"
                  value={newCardName}
                  onChange={e=>setNewCardName(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&createCard()}
                  autoFocus
                />
                <button className="cards-new-create cards-new-random" onClick={createRandomCard} title="Create with random numbers">🎲 Random</button>
                <button className="cards-new-create" onClick={createCard}>Create blank</button>
              </div>
            )}

            {bingoCards.length===0 && !showNewRow && (
              <div style={{textAlign:"center",color:"rgba(255,255,255,0.45)",fontSize:13,padding:"20px 0",fontStyle:"italic"}}>
                No cards yet — press "+ Add card" or "🎲 ×10 Random" to get started
              </div>
            )}

            {bingoCards.length > 0 && (
              <div className={`cards-grid cpr-${cardsPerRow}`}>
                {bingoCards.map((card,i)=>(
                  <InlineBingoCard
                    key={i} idx={i} card={card}
                    allCalled={calledNumbers}
                    onUpdate={updateCard}
                    onDelete={deleteCard}
                    cardsPerRow={cardsPerRow}
                    forceTab={globalTab}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {showModal && (
        <div className="cn-modal-overlay">
          <div className="cn-modal">
            <h3>Add label</h3>
            <input placeholder="Game name, event, or date" value={labelDraft} onChange={e=>setLabelDraft(e.target.value)}/>
            <div className="cn-modal-btns">
              <button className="cn-modal-cancel" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="cn-modal-save"   onClick={saveLabel}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
