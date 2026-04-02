import { useState, useCallback } from "react";

/* ─── constants ──────────────────────────────────── */
const TOTAL = 75;
const MAX_OPTIONS = [25, 30, 35, 40, 44, 48];
const COLS = [
  { letter: "B", range: "1–15",  color: "#4ade80", bg: "rgba(74,222,128,0.13)"  },
  { letter: "I", range: "16–30", color: "#60a5fa", bg: "rgba(96,165,250,0.13)"  },
  { letter: "N", range: "31–45", color: "#c084fc", bg: "rgba(192,132,252,0.13)" },
  { letter: "G", range: "46–60", color: "#fbbf24", bg: "rgba(251,191,36,0.13)"  },
  { letter: "O", range: "61–75", color: "#f87171", bg: "rgba(248,113,113,0.13)" },
];
const colOf = (n) => Math.floor((n - 1) / 15);

/* ─── styles ─────────────────────────────────────── */
const S = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--navy:#0d0f1e;--card:rgba(255,255,255,0.05);--border:rgba(255,255,255,0.10);--muted:rgba(255,255,255,0.45);}
body{font-family:'Nunito',sans-serif;}

/* NAVBAR */
.nb{position:fixed;top:0;left:0;right:0;height:60px;background:rgba(13,15,30,.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 18px;z-index:200;box-shadow:0 2px 20px rgba(0,0,0,.4);}
.nb-logo{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;transition:opacity .15s;}
.nb-logo:hover{opacity:.75;}
.nb-icon{width:38px;height:38px;border-radius:50%;background:#111;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,.5);flex-shrink:0;}
.nb-title{color:#fff;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;white-space:nowrap;}
.nb-badge{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);border-radius:20px;color:#fff;font-size:13px;font-weight:800;padding:5px 14px;white-space:nowrap;font-family:'Nunito',sans-serif;}
@media(max-width:360px){.nb-title{display:none;}}

/* PAGE */
.page{min-height:100vh;padding-top:60px;background:linear-gradient(145deg,#1a1f3c 0%,#0d0f1e 60%,#1a0f2e 100%);color:#fff;}
.wrap{max-width:920px;margin:0 auto;padding:14px 10px 40px;display:flex;flex-direction:column;gap:10px;}

/* LABEL BAR */
.lbar{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.3);border-radius:12px;padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.lhint{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:13px;font-weight:600;}
.ladd{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:6px 13px;cursor:pointer;transition:background .15s;font-family:'Nunito',sans-serif;}
.ladd:hover{background:rgba(255,255,255,.16);}

/* MAX PILLS */
.mbar{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:11px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.mlbl{color:var(--muted);font-size:13px;font-weight:700;white-space:nowrap;}
.mpills{display:flex;gap:7px;flex-wrap:wrap;}
.pill{width:42px;height:34px;border-radius:20px;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:var(--muted);font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;}
.pill:hover{background:rgba(255,255,255,.14);color:#fff;}
.pill.on{background:#4f46e5;border-color:#6366f1;color:#fff;box-shadow:0 0 12px rgba(99,102,241,.5);}

/* PROGRESS */
.prog{display:flex;align-items:center;gap:10px;}
.ptrack{flex:1;height:6px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;}
.pfill{height:100%;border-radius:99px;background:linear-gradient(90deg,#6366f1,#a78bfa);transition:width .4s ease;}
.ptxt{color:var(--muted);font-size:13px;font-weight:700;white-space:nowrap;}

/* LEGEND */
.leg{display:flex;gap:14px;flex-wrap:wrap;align-items:center;}
.li{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--muted);}
.ld{width:12px;height:12px;border-radius:50%;flex-shrink:0;}

/* HIGHLIGHT */
.hlrow{display:flex;gap:8px;}
.hlinput{flex:1;padding:10px 14px;border-radius:10px;border:1.5px solid var(--border);background:rgba(255,255,255,.07);color:#fff;font-size:14px;font-weight:600;font-family:'Nunito',sans-serif;outline:none;transition:border .15s;}
.hlinput::placeholder{color:var(--muted);}
.hlinput:focus{border-color:#6366f1;}
.hlbtn{padding:10px 20px;border-radius:10px;border:none;background:#4f46e5;color:#fff;font-size:14px;font-weight:800;cursor:pointer;transition:all .15s;font-family:'Nunito',sans-serif;}
.hlbtn:hover{background:#6366f1;transform:scale(1.03);}

/* COL HEADERS */
.cheads{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:2px;}
.ch{border-radius:8px;padding:6px 4px;text-align:center;}
.chl{font-family:'Bebas Neue',sans-serif;font-size:clamp(14px,3vw,22px);display:block;}
.chr{font-size:10px;opacity:.7;display:block;margin-top:1px;}

/* BALL GRID */
.bgrid{display:grid;grid-template-columns:repeat(15,1fr);gap:3px;}
.ball{aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:clamp(8px,1.3vw,13px);font-weight:800;cursor:pointer;transition:transform .12s,box-shadow .12s;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.07);color:rgba(255,255,255,.4);user-select:none;}
.ball:hover{transform:scale(1.13);z-index:2;}
.ball.cal{border-width:2px;}
.ball.hl{animation:glow 1.1s infinite;}
@keyframes glow{0%,100%{box-shadow:0 0 0 3px gold,0 0 14px 2px gold;}50%{box-shadow:0 0 0 5px gold,0 0 24px 5px gold;}}

/* ACTIONS */
.acts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.abtn{padding:13px 6px;border-radius:10px;border:1.5px solid var(--border);background:rgba(255,255,255,.05);font-size:clamp(11px,1.8vw,14px);font-weight:800;cursor:pointer;transition:all .15s;font-family:'Nunito',sans-serif;letter-spacing:.3px;}
.abtn.dr{color:#4ade80;border-color:rgba(74,222,128,.3);}
.abtn.dr:hover{background:rgba(74,222,128,.12);}
.abtn.nr{color:#fbbf24;border-color:rgba(251,191,36,.3);}
.abtn.nr:hover{background:rgba(251,191,36,.12);}
.abtn.rs{color:#f87171;border-color:rgba(248,113,113,.3);}
.abtn.rs:hover{background:rgba(248,113,113,.12);}

/* STATS */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.sc{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 6px;text-align:center;}
.sn{font-size:clamp(20px,4vw,30px);font-weight:900;color:#fff;line-height:1;}
.sl{font-size:11px;color:var(--muted);font-weight:700;margin-top:4px;letter-spacing:.4px;}

/* RESPONSIVE */
@media(max-width:600px){
  .stats{grid-template-columns:repeat(2,1fr);}
  .chr{display:none;}
}
@media(max-width:420px){
  .acts{grid-template-columns:1fr;}
  .hlrow{flex-direction:column;}
}
`;

/* ─── component ──────────────────────────────────── */
export default function Generate({ onBack }) {
  const [maxBalls, setMaxBalls]     = useState(48);
  const [called, setCalled]         = useState(new Set());
  const [prev, setPrev]             = useState(new Set());
  const [rounds, setRounds]         = useState(0);
  const [hlNum, setHlNum]           = useState("");
  const [inputVal, setInputVal]     = useState("");
  const [label, setLabel]           = useState("");
  const [editLbl, setEditLbl]       = useState(false);

  const drawn     = called.size;
  const remaining = maxBalls - drawn;

  const drawRandom = useCallback(() => {
    const pool = [];
    for (let i = 1; i <= maxBalls; i++) {
      if (!called.has(i) && !prev.has(i)) pool.push(i);
    }
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setCalled(s => new Set(s).add(pick));
  }, [called, prev, maxBalls]);

  const newRound = useCallback(() => {
    setPrev(s => new Set([...s, ...called]));
    setCalled(new Set());
    setRounds(r => r + 1);
  }, [called]);

  const reset = useCallback(() => {
    setCalled(new Set()); setPrev(new Set());
    setRounds(0); setHlNum(""); setInputVal("");
  }, []);

  const toggleBall = (n) => {
    if (prev.has(n)) return;
    setCalled(s => { const c = new Set(s); c.has(n) ? c.delete(n) : c.add(n); return c; });
  };

  const doHighlight = () => {
    const n = parseInt(inputVal, 10);
    if (n >= 1 && n <= 75) setHlNum(String(n));
    setInputVal("");
  };

  return (
    <>
      <style>{S}</style>

      {/* NAVBAR */}
      <nav className="nb">
        <div className="nb-logo" onClick={onBack} title="Back to Main Menu">
          <div className="nb-icon">🍀</div>
          <span className="nb-title">BINGO FORTUNE</span>
        </div>
        <div className="nb-badge">Round {rounds + 1}</div>
      </nav>

      {/* PAGE */}
      <div className="page">
        <div className="wrap">

          {/* LABEL */}
          <div className="lbar">
            {editLbl ? (
              <input
                autoFocus value={label}
                onChange={e => setLabel(e.target.value)}
                onBlur={() => setEditLbl(false)}
                onKeyDown={e => e.key === "Enter" && setEditLbl(false)}
                placeholder="Game name, event, or date…"
                style={{ flex:1,background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Nunito',sans-serif" }}
              />
            ) : (
              <div className="lhint">
                <span>📌</span>
                <span>{label || "No label set — add a game name, event, or date"}</span>
              </div>
            )}
            <button className="ladd" onClick={() => setEditLbl(true)}>
              {label ? "✏️ Edit" : "+ Add label"}
            </button>
          </div>

          {/* MAX BALLS */}
          <div className="mbar">
            <span className="mlbl">Max balls / round</span>
            <div className="mpills">
              {MAX_OPTIONS.map(n => (
                <button key={n} className={`pill${maxBalls===n?" on":""}`} onClick={() => setMaxBalls(n)}>{n}</button>
              ))}
            </div>
          </div>

          {/* PROGRESS */}
          <div className="prog">
            <div className="ptrack">
              <div className="pfill" style={{ width: `${(drawn/maxBalls)*100}%` }} />
            </div>
            <span className="ptxt">{drawn} / {maxBalls}</span>
          </div>

          {/* LEGEND */}
          <div className="leg">
            <div className="li"><div className="ld" style={{background:"#6366f1"}}/>Called this round</div>
            <div className="li"><div className="ld" style={{background:"rgba(99,102,241,.3)",border:"1px dashed #6366f1"}}/>Previous rounds</div>
            <div className="li"><div className="ld" style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)"}}/>Not called</div>
          </div>

          {/* HIGHLIGHT INPUT */}
          <div className="hlrow">
            <input className="hlinput" placeholder="Enter 1–75 and press Enter"
              value={inputVal} onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key==="Enter" && doHighlight()} />
            <button className="hlbtn" onClick={doHighlight}>Highlight</button>
          </div>

          {/* COLUMN HEADERS */}
          <div className="cheads">
            {COLS.map(col => (
              <div key={col.letter} className="ch" style={{ background:col.bg, border:`1px solid ${col.color}44`, color:col.color }}>
                <span className="chl">{col.letter}</span>
                <span className="chr">{col.range}</span>
              </div>
            ))}
          </div>

          {/* BALL GRID */}
          <div className="bgrid">
            {Array.from({length:TOTAL},(_,i)=>{
              const n  = i+1;
              const ci = colOf(n);
              const col = COLS[ci];
              const isCalled = called.has(n);
              const isPrev   = prev.has(n);
              const isHL     = String(n)===hlNum;

              let bg   = "rgba(255,255,255,0.07)";
              let tc   = "rgba(255,255,255,0.38)";
              let bc   = "rgba(255,255,255,0.10)";
              if (isCalled){ bg=`${col.color}20`; tc=col.color; bc=col.color; }
              else if(isPrev){ bg="rgba(99,102,241,0.08)"; tc="rgba(99,102,241,0.5)"; bc="rgba(99,102,241,0.3)"; }

              return (
                <div key={n}
                  className={`ball${isCalled?" cal":""}${isHL?" hl":""}`}
                  style={{ color:tc, background:bg, borderColor:bc, borderStyle:isPrev?"dashed":"solid" }}
                  onClick={()=>toggleBall(n)}
                  title={`Ball ${n}`}
                >{n}</div>
              );
            })}
          </div>

          {/* ACTIONS */}
          <div className="acts">
            <button className="abtn dr" onClick={drawRandom}>🎲 Draw random</button>
            <button className="abtn nr" onClick={newRound}>🔄 New round</button>
            <button className="abtn rs" onClick={reset}>🗑️ Reset</button>
          </div>

          {/* STATS */}
          <div className="stats">
            {[
              [drawn,    "Drawn"],
              [remaining,"Remaining"],
              [rounds,   "Rounds done"],
              [maxBalls, "Max / round"],
            ].map(([n,l])=>(
              <div key={l} className="sc">
                <div className="sn">{n}</div>
                <div className="sl">{l}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
