import { useState, useCallback } from "react";

const MAX_OPTIONS = [25, 30, 35, 40, 44, 48];
const COLS = [
  { letter: "B", range: "1–15",  color: "#4ade80", bg: "rgba(74,222,128,0.13)"  },
  { letter: "I", range: "16–30", color: "#60a5fa", bg: "rgba(96,165,250,0.13)"  },
  { letter: "N", range: "31–45", color: "#c084fc", bg: "rgba(192,132,252,0.13)" },
  { letter: "G", range: "46–60", color: "#fbbf24", bg: "rgba(251,191,36,0.13)"  },
  { letter: "O", range: "61–75", color: "#f87171", bg: "rgba(248,113,113,0.13)" },
];

const S = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@500;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Nunito',sans-serif;background:#0d0f1e;}

/* ── NAVBAR ── */
.nb{
  position:fixed;top:0;left:0;right:0;height:60px;
  background:rgba(13,15,30,.92);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid rgba(255,255,255,.1);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 20px;z-index:200;
  box-shadow:0 2px 20px rgba(0,0,0,.5);
}
.nb-logo{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;transition:opacity .15s;}
.nb-logo:hover{opacity:.75;}
.nb-icon{width:38px;height:38px;border-radius:50%;background:#111;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,.5);flex-shrink:0;}
.nb-title{color:#fff;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;white-space:nowrap;}
.nb-badge{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;color:#fff;font-size:13px;font-weight:800;padding:5px 16px;font-family:'Nunito',sans-serif;white-space:nowrap;}
@media(max-width:380px){.nb-title{display:none;}}

/* ── PAGE ── */
.page{min-height:100vh;padding-top:60px;background:#0d0f1e;color:#fff;}
.wrap{max-width:960px;margin:0 auto;padding:14px 12px 40px;display:flex;flex-direction:column;gap:10px;}

/* ── LABEL BAR ── */
.lbar{
  background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.28);
  border-radius:10px;padding:11px 16px;
  display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
}
.lhint{display:flex;align-items:center;gap:8px;color:rgba(255,255,255,.5);font-size:13px;font-weight:600;}
.ladd{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:8px;color:#fff;font-size:12px;font-weight:700;padding:6px 14px;cursor:pointer;transition:background .15s;font-family:'Nunito',sans-serif;white-space:nowrap;}
.ladd:hover{background:rgba(255,255,255,.15);}

/* ── MAX PILLS ── */
.mbar{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:10px;padding:11px 16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.mlbl{color:rgba(255,255,255,.45);font-size:13px;font-weight:700;white-space:nowrap;}
.mpills{display:flex;gap:8px;flex-wrap:wrap;}
.pill{min-width:40px;height:32px;padding:0 10px;border-radius:20px;border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:rgba(255,255,255,.45);font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;}
.pill:hover{background:rgba(255,255,255,.12);color:#fff;}
.pill.on{background:#4338ca;border-color:#6366f1;color:#fff;box-shadow:0 0 14px rgba(99,102,241,.5);}

/* ── PROGRESS ── */
.prog{display:flex;align-items:center;gap:10px;}
.ptrack{flex:1;height:5px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden;}
.pfill{height:100%;border-radius:99px;background:linear-gradient(90deg,#6366f1,#a78bfa);transition:width .35s ease;}
.ptxt{color:rgba(255,255,255,.4);font-size:12px;font-weight:700;white-space:nowrap;min-width:44px;text-align:right;}

/* ── LEGEND ── */
.leg{display:flex;gap:18px;flex-wrap:wrap;align-items:center;}
.li{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:rgba(255,255,255,.45);}
.ld{width:13px;height:13px;border-radius:3px;flex-shrink:0;}

/* ── HIGHLIGHT ── */
.hlrow{display:flex;gap:8px;}
.hlinput{
  flex:1;padding:10px 14px;border-radius:10px;
  border:1.5px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06);color:#fff;
  font-size:14px;font-weight:600;font-family:'Nunito',sans-serif;
  outline:none;transition:border .15s;
}
.hlinput::placeholder{color:rgba(255,255,255,.3);}
.hlinput:focus{border-color:#6366f1;}
.hlbtn{padding:10px 22px;border-radius:10px;border:none;background:#4f46e5;color:#fff;font-size:14px;font-weight:800;cursor:pointer;transition:all .15s;font-family:'Nunito',sans-serif;white-space:nowrap;}
.hlbtn:hover{background:#6366f1;transform:translateY(-1px);}

/* ── BOARD ── */
.board{display:flex;flex-direction:column;gap:3px;width:100%;}

/* column headers — 5 equal cols */
.cheads{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;}
.ch{border-radius:8px;padding:7px 4px;text-align:center;}
.chl{font-family:'Bebas Neue',sans-serif;font-size:clamp(16px,3vw,26px);display:block;line-height:1;}
.chr{font-size:10px;opacity:.65;display:block;margin-top:2px;font-family:'Nunito',sans-serif;font-weight:700;}

/* ball grid — 15 cols × 5 rows, numbers go LEFT-TO-RIGHT across each row */
/* Row 1: 1-15, Row 2: 16-30, Row 3: 31-45, Row 4: 46-60, Row 5: 61-75 */
.bgrid{
  display:grid;
  grid-template-columns:repeat(15,1fr);
  gap:4px;
}

.ball{
  aspect-ratio:1/1;
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:clamp(9px,1.15vw,14px);
  font-weight:800;
  cursor:pointer;
  transition:transform .1s, box-shadow .1s;
  border:2px solid rgba(255,255,255,.13);
  background:rgba(255,255,255,.09);
  color:rgba(255,255,255,.55);
  user-select:none;
  width:100%;
  min-width:0;
  font-family:'Nunito',sans-serif;
}
.ball:hover{transform:scale(1.12);z-index:2;position:relative;}
.ball.cal{
  background:rgba(255,255,255,.18);
  color:#fff;
  border-color:rgba(255,255,255,.6);
  box-shadow:0 0 8px rgba(255,255,255,.15);
}
.ball.prev-cal{
  opacity:.45;
  border-style:dashed;
  border-color:rgba(255,255,255,.25);
  color:rgba(255,255,255,.4);
}
.ball.hl{
  animation:glow 1.1s infinite;
  border-color:gold !important;
  color:gold !important;
}
@keyframes glow{
  0%,100%{box-shadow:0 0 0 2px gold,0 0 12px 2px rgba(255,215,0,.6);}
  50%{box-shadow:0 0 0 4px gold,0 0 20px 5px rgba(255,215,0,.8);}
}

/* ── ACTIONS ── */
.acts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.abtn{
  padding:14px 8px;border-radius:10px;
  border:1.5px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  font-size:clamp(12px,1.6vw,14px);font-weight:800;
  cursor:pointer;transition:all .15s;
  font-family:'Nunito',sans-serif;
}
.abtn.dr{color:#4ade80;border-color:rgba(74,222,128,.25);}
.abtn.dr:hover{background:rgba(74,222,128,.1);}
.abtn.nr{color:#fbbf24;border-color:rgba(251,191,36,.25);}
.abtn.nr:hover{background:rgba(251,191,36,.1);}
.abtn.rs{color:#f87171;border-color:rgba(248,113,113,.25);}
.abtn.rs:hover{background:rgba(248,113,113,.1);}

/* ── STATS ── */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.sc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:14px 8px;text-align:center;}
.sn{font-size:clamp(22px,4vw,34px);font-weight:900;color:#fff;line-height:1;font-family:'Bebas Neue',sans-serif;letter-spacing:1px;}
.sl{font-size:11px;color:rgba(255,255,255,.4);font-weight:700;margin-top:5px;letter-spacing:.4px;text-transform:uppercase;}

/* ── RESPONSIVE ── */
@media(max-width:640px){
  .stats{grid-template-columns:repeat(2,1fr);}
  .chr{display:none;}
  .bgrid{gap:2px;}
  .ball{font-size:clamp(7px,2.2vw,11px);}
}
@media(max-width:440px){
  .acts{grid-template-columns:1fr 1fr;} 
  .abtn.rs{grid-column:1/-1;}
}
@media(max-width:340px){
  .acts{grid-template-columns:1fr;}
  .hlrow{flex-direction:column;}
}
`;

export default function Generate({ onBack }) {
  const [maxBalls, setMaxBalls] = useState(48);
  const [called, setCalled]     = useState(new Set());
  const [prev, setPrev]         = useState(new Set());
  const [rounds, setRounds]     = useState(0);
  const [hlNum, setHlNum]       = useState("");
  const [inputVal, setInputVal] = useState("");
  const [label, setLabel]       = useState("");
  const [editLbl, setEditLbl]   = useState(false);

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
    setCalled(s => {
      const c = new Set(s);
      c.has(n) ? c.delete(n) : c.add(n);
      return c;
    });
  };

  const doHighlight = () => {
    const n = parseInt(inputVal, 10);
    if (n >= 1 && n <= 75) setHlNum(String(n));
    setInputVal("");
  };

  // Ball color by which BINGO column it belongs to (for called state)
  const ballCol = (n) => COLS[Math.floor((n - 1) / 15)];

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

      <div className="page">
        <div className="wrap">

          {/* LABEL BAR */}
          <div className="lbar">
            {editLbl ? (
              <input
                autoFocus value={label}
                onChange={e => setLabel(e.target.value)}
                onBlur={() => setEditLbl(false)}
                onKeyDown={e => e.key === "Enter" && setEditLbl(false)}
                placeholder="Game name, event, or date…"
                style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}
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
              <div className="pfill" style={{width:`${drawn/maxBalls*100}%`}} />
            </div>
            <span className="ptxt">{drawn} / {maxBalls}</span>
          </div>

          {/* LEGEND */}
          <div className="leg">
            <div className="li">
              <div className="ld" style={{background:"#6366f1",borderRadius:3}}/>
              Called this round
            </div>
            <div className="li">
              <div className="ld" style={{background:"transparent",border:"1.5px dashed rgba(99,102,241,.6)",borderRadius:3}}/>
              Previous rounds
            </div>
            <div className="li">
              <div className="ld" style={{background:"rgba(255,255,255,.09)",border:"1.5px solid rgba(255,255,255,.15)",borderRadius:3}}/>
              Not called
            </div>
          </div>

          {/* HIGHLIGHT */}
          <div className="hlrow">
            <input
              className="hlinput"
              placeholder="Enter 1–75 and press Enter"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key==="Enter" && doHighlight()}
            />
            <button className="hlbtn" onClick={doHighlight}>Highlight</button>
          </div>

          {/* BOARD */}
          <div className="board">

            {/* COLUMN HEADERS — B I N G O */}
            <div className="cheads">
              {COLS.map(col => (
                <div key={col.letter} className="ch"
                  style={{background:col.bg, border:`1px solid ${col.color}50`, color:col.color}}>
                  <span className="chl">{col.letter}</span>
                  <span className="chr">{col.range}</span>
                </div>
              ))}
            </div>

            {/* BALL GRID — 15 columns wide, 5 rows
                Row 1: 1–15, Row 2: 16–30, Row 3: 31–45, Row 4: 46–60, Row 5: 61–75
                Numbers go left-to-right across each row */}
            <div className="bgrid">
              {Array.from({length: 75}, (_, i) => {
                const n       = i + 1;
                const col     = ballCol(n);
                const isCalled = called.has(n);
                const isPrev   = prev.has(n);
                const isHL     = String(n) === hlNum;

                let style = {};
                if (isCalled) {
                  style = {
                    background: `${col.color}30`,
                    color: col.color,
                    borderColor: `${col.color}90`,
                    boxShadow: `0 0 10px ${col.color}40`,
                  };
                } else if (isPrev) {
                  style = {
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.25)",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderStyle: "dashed",
                  };
                }

                return (
                  <div
                    key={n}
                    className={`ball${isCalled?" cal":""}${isPrev?" prev-cal":""}${isHL?" hl":""}`}
                    style={style}
                    onClick={() => toggleBall(n)}
                    title={`Ball ${n}`}
                  >
                    {n}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="acts">
            <button className="abtn dr" onClick={drawRandom}>Draw random</button>
            <button className="abtn nr" onClick={newRound}>New round</button>
            <button className="abtn rs" onClick={reset}>Reset</button>
          </div>

          {/* STATS */}
          <div className="stats">
            {[
              [drawn,     "Drawn"],
              [remaining, "Remaining"],
              [rounds,    "Rounds done"],
              [maxBalls,  "Max / round"],
            ].map(([n, l]) => (
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
