import { useState } from "react";

const MAX_OPTIONS = [25, 30, 35, 40, 44, 48];

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

  /* ── LABEL MODAL ── */
  .cn-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:999; }
  .cn-modal { background:white; border-radius:16px; padding:24px; width:300px; color:#222; }
  .cn-modal h3 { margin:0 0 12px; font-size:16px; }
  .cn-modal input { width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:13px; margin-bottom:12px; font-family:inherit; }
  .cn-modal-btns { display:flex; gap:8px; justify-content:flex-end; }
  .cn-modal-cancel { padding:8px 16px; border-radius:8px; border:1px solid #ccc; background:white; cursor:pointer; font-family:inherit; }
  .cn-modal-save   { padding:8px 16px; border-radius:8px; background:#534AB7; color:white; border:none; cursor:pointer; font-family:inherit; }

  /* ══════════════════════════════════════════
     INLINE BINGO CARDS SECTION (below stats)
  ══════════════════════════════════════════ */

  .cards-section { margin-bottom: 24px; }

  .cards-section-header {
    display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;
  }
  .cards-section-title {
    font-size:16px; font-weight:900; color:#fff; letter-spacing:1px;
  }
  .cards-add-btn {
    padding:8px 18px; border-radius:99px; background:rgba(255,255,255,0.15);
    border:1.5px solid rgba(255,255,255,0.4); color:#fff; font-size:13px;
    font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s;
    backdrop-filter:blur(8px);
  }
  .cards-add-btn:hover { background:rgba(255,255,255,0.25); }

  /* new-card name input row (inline) */
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
  .cards-new-cancel {
    padding:9px 14px; border-radius:9px; background:rgba(255,255,255,0.1);
    color:#fff; border:1.5px solid rgba(255,255,255,0.3); font-size:13px;
    cursor:pointer; font-family:inherit;
  }

  /* individual card */
  .bc-inline-card {
    background:rgba(255,255,255,0.97); border-radius:16px;
    padding:16px; margin-bottom:14px; color:#222;
    box-shadow:0 4px 20px rgba(0,0,0,0.15);
  }
  .bc-inline-card-header {
    display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;
  }
  .bc-inline-card-name { font-size:15px; font-weight:900; }
  .bc-inline-card-right { display:flex; align-items:center; gap:8px; }
  .bc-pill      { font-size:11px; padding:3px 10px; border-radius:99px; font-weight:700; }
  .bc-pill-hits { background:#eee; color:#555; }
  .bc-pill-bingo{ background:#FFD700; color:#3a3080; }
  .bc-del-btn {
    width:28px; height:28px; border-radius:50%; border:none; background:#f5f5f5;
    color:#aaa; font-size:16px; cursor:pointer; display:flex; align-items:center;
    justify-content:center; transition:all 0.15s;
  }
  .bc-del-btn:hover { background:#ffe0e0; color:#e53935; }

  /* tabs */
  .bc-inline-tabs { display:flex; gap:6px; margin-bottom:12px; }
  .bc-inline-tab {
    flex:1; padding:7px; border-radius:8px; border:1.5px solid #e0e0e0;
    font-size:11px; font-weight:700; cursor:pointer; font-family:inherit;
    background:white; color:#aaa; transition:all 0.15s;
  }
  .bc-inline-tab.active { border-color:#534AB7; background:#f0eeff; color:#534AB7; }

  /* col headers */
  .bc-col-headers { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; margin-bottom:4px; }
  .bc-col-hdr { text-align:center; padding:6px 2px; border-radius:7px; font-weight:900; font-size:16px; font-family:'Bebas Neue',sans-serif; }

  /* input grid */
  .bc-input-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; }
  .bc-cell-input {
    aspect-ratio:1; border-radius:7px; border:1.5px solid #e0e0e0;
    text-align:center; font-size:13px; font-weight:700;
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
    aspect-ratio:1; border-radius:7px;
    background:linear-gradient(135deg,#534AB7,#3a3080);
    display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:900; color:white; letter-spacing:0.5px;
  }
  .bc-hint { font-size:10px; color:#bbb; text-align:center; margin-top:6px; font-style:italic; }
  .bc-err-msg { font-size:11px; color:#e53935; margin-top:5px; font-style:italic; }

  /* play grid */
  .bc-play-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; }
  .bc-play-cell { aspect-ratio:1; border-radius:7px; border:1.5px solid #e0e0e0; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#ccc; background:#fafafa; transition:all 0.2s; }
  .bc-play-cell.empty-val  { color:#ddd; font-size:18px; }
  .bc-play-cell.hit        { background:#3a3080; color:white; border-color:#3a3080; box-shadow:0 2px 6px rgba(58,48,128,0.3); transform:scale(1.04); }
  .bc-play-cell.bingo-ln   { background:#FFD700; color:#3a3080; border-color:#e6b800; box-shadow:0 2px 10px rgba(255,215,0,0.45); }
  .bc-play-cell.free-cell  { background:linear-gradient(135deg,#534AB7,#3a3080); color:white; border-color:#3a3080; font-size:9px; font-weight:900; letter-spacing:0.5px; }

  .bc-summary { margin-top:10px; padding:8px 12px; background:#f5f5f5; border-radius:9px; display:flex; justify-content:space-between; align-items:center; }
  .bc-summary-lbl { font-size:11px; color:#999; font-weight:700; }
  .bc-summary-val { font-size:18px; font-weight:900; color:#534AB7; }

  .bc-bingo-banner {
    margin-top:10px; padding:10px; border-radius:10px; text-align:center;
    font-size:18px; font-weight:900; letter-spacing:2px; color:#3a3080;
    font-family:'Bebas Neue',sans-serif;
    background:linear-gradient(135deg,#FFD700,#FFA500);
    box-shadow:0 3px 12px rgba(255,165,0,0.4);
    animation:bc-pulse 0.9s ease-in-out infinite alternate;
  }
  @keyframes bc-pulse { from{transform:scale(1)} to{transform:scale(1.02)} }

  .bc-card-footer { display:flex; justify-content:flex-end; margin-top:8px; }
  .bc-clear-btn {
    font-size:11px; padding:5px 14px; border-radius:8px;
    border:1.5px solid #e0e0e0; background:white; color:#aaa;
    cursor:pointer; font-family:inherit; transition:all 0.15s;
  }
  .bc-clear-btn:hover { border-color:#e53935; color:#e53935; background:#fff5f5; }
`;

/* ── single inline card component ── */
function InlineBingoCard({ card, idx, allCalled, onUpdate, onDelete }) {
  const [tab, setTab]       = useState("edit");
  const [errors, setErrors] = useState({});
  const colColors           = Object.values(LETTER_COLORS);

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

  const errCount = Object.keys(errors).length;
  const hits     = hitCount();

  return (
    <div className="bc-inline-card">
      {/* header */}
      <div className="bc-inline-card-header">
        <span className="bc-inline-card-name">🃏 {card.name}</span>
        <div className="bc-inline-card-right">
          {hasBingo && <span className="bc-pill bc-pill-bingo">BINGO!</span>}
          <span className="bc-pill bc-pill-hits">{hits}/25</span>
          <button className="bc-del-btn" onClick={()=>onDelete(idx)} title="Delete card">×</button>
        </div>
      </div>

      {/* tabs */}
      <div className="bc-inline-tabs">
        <button className={`bc-inline-tab${tab==="edit"?" active":""}`} onClick={()=>setTab("edit")}>✏️ Enter numbers</button>
        <button className={`bc-inline-tab${tab==="play"?" active":""}`} onClick={()=>setTab("play")}>🎯 Check card</button>
      </div>

      {/* col headers */}
      <div className="bc-col-headers">
        {COLS.map((l,ci)=>(
          <div key={l} className="bc-col-hdr" style={{background:colColors[ci].bg, color:colColors[ci].color}}>{l}</div>
        ))}
      </div>

      {/* EDIT */}
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
        <div className="bc-hint">B:1–15 · I:16–30 · N:31–45 · G:46–60 · O:61–75 &nbsp;|&nbsp; 🟢 valid · 🔴 error</div>
        {errCount>0 && <div className="bc-err-msg">⚠️ {errCount} invalid cell{errCount>1?"s":""}</div>}
        <div className="bc-card-footer">
          <button className="bc-clear-btn" onClick={handleClear}>🗑 Clear</button>
        </div>
      </>)}

      {/* PLAY */}
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
              if (isEmpty)           cls+=" empty-val";
              else if (inLine&&isHit) cls+=" bingo-ln";
              else if (isHit)        cls+=" hit";
              return <div key={`${col}-${row}`} className={cls}>{isEmpty?"·":num}</div>;
            })
          )}
        </div>
        <div className="bc-summary">
          <span className="bc-summary-lbl">Numbers matched</span>
          <span className="bc-summary-val">{hits} / 25</span>
        </div>
        {hasBingo && (
          <div className="bc-bingo-banner">🎉 BINGO! {lines.length} line{lines.length>1?"s":""}!</div>
        )}
      </>)}
    </div>
  );
}

/* ── MAIN ── */
export default function Generate({ onBack }) {
  const [maxBalls,setMaxBalls]               = useState(48);
  const [calledThisRound,setCalledThisRound] = useState(new Set());
  const [calledPrev,setCalledPrev]           = useState(new Set());
  const [roundsDone,setRoundsDone]           = useState(0);
  const [roundNum,setRoundNum]               = useState(1);
  const [inputVal,setInputVal]               = useState("");
  const [label,setLabel]                     = useState("");
  const [showModal,setShowModal]             = useState(false);
  const [labelDraft,setLabelDraft]           = useState("");
  const [bingoCards,setBingoCards]           = useState([]);
  const [showNewRow,setShowNewRow]           = useState(false);
  const [newCardName,setNewCardName]         = useState("");

  const allCalled   = new Set([...calledThisRound,...calledPrev]);
  const totalDrawn  = calledThisRound.size+calledPrev.size;
  const remaining   = 75-totalDrawn;
  const progressPct = Math.min(100,(calledThisRound.size/maxBalls)*100);

  function getBallState(n){ return calledThisRound.has(n)?"called":calledPrev.has(n)?"prev":""; }
  function toggleBall(n){
    if (calledPrev.has(n)) return;
    setCalledThisRound(p=>{const s=new Set(p);s.has(n)?s.delete(n):s.add(n);return s;});
  }
  function highlightNumber(){
    const v=parseInt(inputVal);
    if (isNaN(v)||v<1||v>75) return;
    if (!calledThisRound.has(v)&&!calledPrev.has(v)) setCalledThisRound(p=>new Set([...p,v]));
    setInputVal("");
  }
  function drawRandom(){
    if (calledThisRound.size>=maxBalls) return;
    const pool=[];
    for (let i=1;i<=75;i++) if (!calledThisRound.has(i)&&!calledPrev.has(i)) pool.push(i);
    if (!pool.length) return;
    setCalledThisRound(p=>new Set([...p,pool[Math.floor(Math.random()*pool.length)]]));
  }
  function newRound(){
    setCalledPrev(p=>new Set([...p,...calledThisRound]));
    setCalledThisRound(new Set());
    setRoundsDone(r=>r+1); setRoundNum(r=>r+1);
  }
  function resetAll(){ setCalledThisRound(new Set());setCalledPrev(new Set());setRoundsDone(0);setRoundNum(1); }
  function saveLabel(){ setLabel(labelDraft);setShowModal(false); }

  function createCard(){
    const name = newCardName.trim() || `Card ${bingoCards.length+1}`;
    setBingoCards(p=>[...p,{name,grid:emptyGrid()}]);
    setNewCardName("");
    setShowNewRow(false);
  }
  function updateCard(idx,grid){ setBingoCards(p=>p.map((c,i)=>i===idx?{...c,grid}:c)); }
  function deleteCard(idx)     { setBingoCards(p=>p.filter((_,i)=>i!==idx)); }

  const bingoCnt = bingoCards.filter(c=>checkBingo(c.grid,allCalled).length>0).length;

  return (
    <>
      <style>{styles}</style>
      <div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"linear-gradient(135deg,#3a6fd8 0%,#6a4fd8 50%,#4a8fd8 100%)",overflow:"hidden"}}>

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="nav-logo" onClick={onBack}>
            <div className="logo-circle">🍀</div>
            <span className="logo-title">BINGO FORTUNE</span>
          </div>
          {bingoCnt>0 && (
            <span style={{background:"#FFD700",borderRadius:"99px",padding:"6px 16px",color:"#3a3080",fontWeight:900,fontSize:13,fontFamily:"inherit"}}>
              🎉 {bingoCnt} BINGO{bingoCnt>1?"S":""}!
            </span>
          )}
        </nav>

        <div className="page-wrapper">

          {/* TOP CARD */}
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

          {/* BOARD */}
          <div className="cn-card">
            <div className="cn-letter-headers">
              {Object.entries(LETTER_COLORS).map(([l,info])=>(
                <div key={l} className="cn-letter-cell" style={{background:info.bg,color:info.color}}>
                  {l}<div className="cn-letter-sub">{info.range}</div>
                </div>
              ))}
            </div>
            <div className="cn-ball-grid">
              {Array.from({length:75},(_,i)=>i+1).map(n=>(
                <div key={n} className={`cn-ball${getBallState(n)?" "+getBallState(n):""}`}
                  onClick={()=>toggleBall(n)} title={`${getBingoLetter(n)}-${n}`}>{n}</div>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="cn-actions">
            <button className="cn-action-btn draw" onClick={drawRandom}>Draw random</button>
            <button className="cn-action-btn new"  onClick={newRound}>New round</button>
            <button className="cn-action-btn rst"  onClick={resetAll}>Reset</button>
          </div>

          {/* STATS */}
          <div className="cn-stats">
            {[["Drawn",totalDrawn],["Remaining",remaining],["Rounds done",roundsDone],["Max / round",maxBalls]].map(([l,v])=>(
              <div key={l} className="cn-stat-card">
                <div className="cn-stat-num">{v}</div>
                <div className="cn-stat-label">{l}</div>
              </div>
            ))}
          </div>

          {/* ══ BINGO CARDS SECTION — below stats ══ */}
          <div className="cards-section">
            <div className="cards-section-header">
              <span className="cards-section-title">
                🃏 Bingo Cards {bingoCards.length>0 && `(${bingoCards.length})`}
              </span>
              <button className="cards-add-btn" onClick={()=>{ setShowNewRow(r=>!r); setNewCardName(""); }}>
                {showNewRow ? "✕ Cancel" : "+ Add card"}
              </button>
            </div>

            {/* Inline new-card row */}
            {showNewRow && (
              <div className="cards-new-row">
                <input
                  className="cards-new-input"
                  placeholder="Player name (e.g. Maria, Table 3)"
                  value={newCardName}
                  onChange={e=>setNewCardName(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&createCard()}
                  autoFocus
                />
                <button className="cards-new-create" onClick={createCard}>Create</button>
              </div>
            )}

            {/* Rendered cards */}
            {bingoCards.length===0 && !showNewRow && (
              <div style={{textAlign:"center",color:"rgba(255,255,255,0.45)",fontSize:13,padding:"20px 0",fontStyle:"italic"}}>
                No cards yet — press "+ Add card" to create one
              </div>
            )}

            {bingoCards.map((card,i)=>(
              <InlineBingoCard
                key={i}
                idx={i}
                card={card}
                allCalled={allCalled}
                onUpdate={updateCard}
                onDelete={deleteCard}
              />
            ))}
          </div>

        </div>
      </div>

      {/* LABEL MODAL */}
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
