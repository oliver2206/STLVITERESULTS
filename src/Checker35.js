import { useState } from "react";

const PLAYERS = [
  { name: "Patrick", initials: "P", color: "#C8A85A", lucky: [34, 23, 45, 67, 75] },
  { name: "Maria",   initials: "M", color: "#C87A5A", lucky: [5, 18, 32, 54, 70] },
  { name: "Jose",    initials: "J", color: "#5AC88A", lucky: [11, 26, 38, 49, 62] },
  { name: "Ana",     initials: "A", color: "#5A9EC8", lucky: [3, 22, 41, 55, 73] },
  { name: "Carlos",  initials: "C", color: "#C85A9E", lucky: [9, 29, 33, 58, 68] },
];

const ROUNDS = [
  { label: "Round 1", time: "7:00 PM" },
  { label: "Round 2", time: "7:30 PM" },
  { label: "Round 3", time: "8:00 PM" },
  { label: "Round 4", time: "8:35 PM" },
];

const COL_RANGES = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };
const COL_COLORS = { B:"#5A9EC8", I:"#5AC88A", N:"#C8A85A", G:"#C87A5A", O:"#C85A9E" };
const COL_BG    = { B:"rgba(90,158,200,.10)", I:"rgba(90,200,138,.10)", N:"rgba(200,168,90,.10)", G:"rgba(200,122,90,.10)", O:"rgba(200,90,158,.10)" };

function getCol(n) {
  for (const [c,[lo,hi]] of Object.entries(COL_RANGES)) if (n>=lo && n<=hi) return c;
}
function shuffle(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function simulate() {
  return ROUNDS.map(()=>shuffle(Array.from({length:75},(_,i)=>i+1)).slice(0,22+Math.floor(Math.random()*13)));
}
function getFrequency(drawnRounds) {
  const freq={};
  for(let n=1;n<=75;n++)freq[n]=0;
  drawnRounds.forEach(d=>d.forEach(n=>freq[n]++));
  return freq;
}

const BADGE_COLORS = {
  0: { bg:"rgba(255,255,255,.08)", color:"rgba(232,228,220,.25)" },
  1: { bg:"rgba(90,158,200,.3)",   color:"#5A9EC8" },
  2: { bg:"rgba(200,168,90,.32)",  color:"#C8A85A" },
  3: { bg:"rgba(90,200,138,.32)",  color:"#5AC88A" },
  4: { bg:"rgba(200,90,158,.32)",  color:"#C85A9E" },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0C0C0F;font-family:'DM Sans',sans-serif;color:#E8E4DC}
.root{min-height:100vh;background:#0C0C0F;background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(200,168,90,.13) 0%,transparent 70%)}
.wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:48px 20px 96px}
.hero{text-align:center;margin-bottom:52px}
.eyebrow{font-size:11px;font-weight:500;letter-spacing:.25em;text-transform:uppercase;color:#C8A85A;display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px}
.eyebrow-line{width:40px;height:1px;background:#C8A85A;opacity:.4}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(36px,6vw,64px);font-weight:900;line-height:1.05;letter-spacing:-.02em;color:#E8E4DC;margin-bottom:10px}
.hero h1 em{font-style:normal;color:#C8A85A}
.hero p{font-size:13px;color:rgba(232,228,220,.4);letter-spacing:.06em}
.resim{margin-top:26px;display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:40px;border:1px solid rgba(200,168,90,.3);background:transparent;color:#C8A85A;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;letter-spacing:.05em}
.resim:hover{background:rgba(200,168,90,.1);border-color:rgba(200,168,90,.6)}
.resim svg{transition:transform .5s}
.resim.spin svg{transform:rotate(360deg)}
.sec-label{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,228,220,.28);margin-bottom:14px}
.player-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}
.ptab{padding:8px 16px;border-radius:40px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);color:rgba(232,228,220,.5);transition:all .2s;display:flex;align-items:center;gap:8px}
.ptab:hover{background:rgba(255,255,255,.06)}
.ptab.on{color:#0C0C0F}
.ptab-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.legend-row{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:28px}
.leg{display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(232,228,220,.35)}
.ldot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.rounds-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:20px}
@media(max-width:700px){.rounds-grid{grid-template-columns:1fr}}
.rcard{border-radius:20px;padding:24px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03)}
.rcard-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;gap:8px;flex-wrap:wrap}
.rcard-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:#E8E4DC}
.rcard-sub{font-size:11px;color:rgba(232,228,220,.3);margin-top:3px;letter-spacing:.05em}
.rbadge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap}
.rbadge .rdot{width:5px;height:5px;border-radius:50%}
.win{background:rgba(90,200,138,.12);color:#5AC88A;border:1px solid rgba(90,200,138,.2)}
.close{background:rgba(200,168,90,.12);color:#C8A85A;border:1px solid rgba(200,168,90,.2)}
.miss{background:rgba(255,255,255,.04);color:rgba(232,228,220,.3);border:1px solid rgba(255,255,255,.06)}
.blbl{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:rgba(232,228,220,.28);margin-bottom:8px}
.bwrap{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:14px}
.sball{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;flex-shrink:0;border:1px solid;transition:transform .15s;cursor:default}
.sball:hover{transform:scale(1.2)}
.sball.hit{outline:2.5px solid #5AC88A;outline-offset:2px}
.divhr{height:1px;background:rgba(255,255,255,.05);margin:12px 0}
.hits-row{display:flex;gap:5px;flex-wrap:wrap;align-items:center}
.hpill{font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(90,200,138,.12);color:#5AC88A;border:1px solid rgba(90,200,138,.2);font-weight:500}
.no-hit{font-size:12px;color:rgba(232,228,220,.22);font-style:italic}

/* ── FREQUENCY TRACKER ── */
.ft-box{border-radius:24px;padding:28px 28px 24px;border:1px solid rgba(90,158,200,.2);background:rgba(255,255,255,.02);margin-bottom:24px}
.ft-box-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#5A9EC8;margin-bottom:4px}
.ft-box-sub{font-size:13px;color:rgba(232,228,220,.35);margin-bottom:22px}
.ft-summary{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.ft-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 16px;border-radius:30px;font-size:12px;font-weight:500;border:1px solid}
.ft-pill-val{font-family:'Playfair Display',serif;font-size:20px;font-weight:900;line-height:1}
.ft-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px;align-items:center}
.ft-filter-lbl{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(232,228,220,.3);margin-right:2px}
.ft-ftab{padding:5px 14px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(232,228,220,.45);transition:all .18s}
.ft-ftab:hover{background:rgba(255,255,255,.07)}
.ft-ftab.sel{background:rgba(90,158,200,.15);border-color:rgba(90,158,200,.4);color:#5A9EC8}
.col-hdr-row{display:grid;grid-template-columns:repeat(15,1fr);gap:5px;margin-bottom:8px}
@media(max-width:900px){.col-hdr-row{grid-template-columns:repeat(10,1fr)}}
@media(max-width:600px){.col-hdr-row{grid-template-columns:repeat(5,1fr)}}
.col-hdr-cell{text-align:center;padding:6px 2px;border-radius:8px;font-size:11px;font-weight:500;letter-spacing:.04em}
.ball-grid{display:grid;grid-template-columns:repeat(15,1fr);gap:5px}
@media(max-width:900px){.ball-grid{grid-template-columns:repeat(10,1fr)}}
@media(max-width:600px){.ball-grid{grid-template-columns:repeat(5,1fr)}}
.bg-cell{display:flex;flex-direction:column;align-items:center;justify-content:center;aspect-ratio:1;border-radius:50%;border:1.5px solid;position:relative;cursor:default;transition:transform .15s,opacity .2s}
.bg-cell:hover{transform:scale(1.12)}
.bg-cell-num{font-size:clamp(10px,1.3vw,14px);font-weight:500;line-height:1}
.bg-badge{position:absolute;bottom:-2px;right:-2px;min-width:16px;height:16px;padding:0 3px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:500;border:1.5px solid #0C0C0F;white-space:nowrap}

.final-card{border-radius:24px;padding:32px;border:1px solid rgba(200,168,90,.2);background:linear-gradient(135deg,rgba(200,168,90,.06) 0%,rgba(255,255,255,.02) 100%);margin-bottom:20px}
.final-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:#C8A85A;margin-bottom:6px}
.final-sub{font-size:13px;color:rgba(232,228,220,.35);margin-bottom:26px}
.freq-section{margin-bottom:24px}
.freq-header{display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap}
.freq-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 16px;border-radius:30px;font-size:13px;font-weight:500}
.f4{background:rgba(200,168,90,.18);color:#C8A85A;border:1px solid rgba(200,168,90,.35)}
.f3{background:rgba(90,200,138,.14);color:#5AC88A;border:1px solid rgba(90,200,138,.25)}
.f2{background:rgba(90,158,200,.14);color:#5A9EC8;border:1px solid rgba(90,158,200,.25)}
.f1{background:rgba(255,255,255,.05);color:rgba(232,228,220,.5);border:1px solid rgba(255,255,255,.08)}
.freq-desc{font-size:12px;color:rgba(232,228,220,.3)}
.freq-balls{display:flex;flex-wrap:wrap;gap:6px}
.fball{width:34px;height:34px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;font-weight:500;flex-shrink:0;border:1px solid;transition:transform .2s;cursor:default}
.fball:hover{transform:scale(1.15)}
.fball .fnum{font-size:12px;line-height:1}
.fball .fcol{font-size:8px;opacity:.7;line-height:1;margin-top:1px}
.empty-freq{font-size:13px;color:rgba(232,228,220,.22);font-style:italic;padding:8px 0}
.hm-balls{display:flex;gap:4px;flex-wrap:wrap}
.hm-ball{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;flex-shrink:0;border:1px solid rgba(255,255,255,.06);cursor:default;transition:transform .15s}
.hm-ball:hover{transform:scale(1.18)}
.col-section{margin-bottom:16px}
.col-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.col-letter{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;flex-shrink:0}
.col-name{font-size:12px;color:rgba(232,228,220,.4);letter-spacing:.08em}

@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fadeUp .4s ease both}
.fu1{animation-delay:.08s}.fu2{animation-delay:.16s}.fu3{animation-delay:.24s}
`;

function SmallBall({ n, hit }) {
  const col = getCol(n); const c = COL_COLORS[col];
  return <div className={`sball${hit?" hit":""}`} title={`${col}-${n}`} style={{background:`${c}18`,color:c,borderColor:`${c}40`}}>{n}</div>;
}
function FreqBall({ n, times }) {
  const col = getCol(n); const c = COL_COLORS[col];
  return (
    <div className="fball" title={`${col}-${n} · ${times}x`}
      style={{background:`${c}${times===4?"28":times===3?"20":"14"}`,color:c,borderColor:`${c}${times===4?"55":"30"}`,opacity:times===4?1:times===3?.8:times===2?.6:.4}}>
      <span className="fnum">{n}</span><span className="fcol">{col}</span>
    </div>
  );
}
function HmBall({ n, times }) {
  const col = getCol(n); const c = COL_COLORS[col];
  const alphas=["08","14","20","30","40"];
  return <div className="hm-ball" title={`${col}-${n} · ${times}x`} style={{background:`${c}${alphas[times]||"08"}`,color:times>0?c:"rgba(232,228,220,.15)",borderColor:times>0?`${c}35`:"rgba(255,255,255,.05)",fontWeight:times>1?500:400}}>{n}</div>;
}

// Screenshot-style cell with Nx badge
function BgCell({ n, times, allLucky, filterTimes }) {
  const col = getCol(n); const c = COL_COLORS[col]; const bg = COL_BG[col];
  const badge = BADGE_COLORS[Math.min(times, 4)];
  const isLucky = allLucky.has(n);
  const dimmed = filterTimes !== null && times !== filterTimes;
  return (
    <div className="bg-cell"
      title={`${col}${n} · appeared ${times}× across 4 rounds${isLucky?" · LUCKY NUMBER":""}`}
      style={{
        background: dimmed ? "rgba(255,255,255,.02)" : (isLucky ? `${c}30` : bg),
        borderColor: dimmed ? "rgba(255,255,255,.05)" : (isLucky ? `${c}90` : `${c}38`),
        opacity: dimmed ? 0.25 : 1,
        boxShadow: isLucky && !dimmed ? `0 0 0 1.5px ${c}50` : "none",
      }}
    >
      <span className="bg-cell-num" style={{color: dimmed ? "rgba(232,228,220,.18)" : c}}>{n}</span>
      {times > 0 && (
        <span className="bg-badge" style={{background:badge.bg, color:badge.color}}>
          {times}x
        </span>
      )}
    </div>
  );
}

// Column header row — 15 cells aligned with grid
function ColHeaderRow() {
  return (
    <div className="col-hdr-row">
      {Array.from({length:75},(_,i)=>i+1).map(n=>{
        const col = getCol(n); const c = COL_COLORS[col]; const bg = COL_BG[col];
        const isFirst = (n-1) % 15 === 0 || getCol(n) !== getCol(n-1);
        return (
          <div key={n} className="col-hdr-cell"
            style={{background:bg, color:c, fontSize:10, fontWeight:500, padding:"4px 2px", borderRadius:6,
              opacity: [1,16,31,46,61].includes(n) ? 1 : 0, pointerEvents:"none"
            }}
          >
            {[1,16,31,46,61].includes(n) ? getCol(n) : ""}
          </div>
        );
      })}
    </div>
  );
}

function FreqTrackerBox({ drawn, players }) {
  const [filter, setFilter] = useState(null);
  const freq = getFrequency(drawn);
  const allLucky = new Set(players.flatMap(p=>p.lucky));
  const counts = [4,3,2,1,0].map(t=>({ t, n: Object.values(freq).filter(v=>v===t).length }));
  const FC = {
    4:{ color:"#C8A85A", bg:"rgba(200,168,90,.14)", border:"rgba(200,168,90,.38)" },
    3:{ color:"#5AC88A", bg:"rgba(90,200,138,.12)", border:"rgba(90,200,138,.32)" },
    2:{ color:"#5A9EC8", bg:"rgba(90,158,200,.12)", border:"rgba(90,158,200,.32)" },
    1:{ color:"rgba(232,228,220,.6)", bg:"rgba(255,255,255,.05)", border:"rgba(255,255,255,.14)" },
    0:{ color:"rgba(232,228,220,.3)", bg:"rgba(255,255,255,.03)", border:"rgba(255,255,255,.08)" },
  };

  return (
    <div className="ft-box fu fu3">
      <div className="ft-box-title">Ball Frequency Tracker — Rounds 1 to 4</div>
      <div className="ft-box-sub">Every ball 1–75 · badge shows how many times it was drawn across all 4 rounds</div>

      {/* Summary pills */}
      <div className="ft-summary">
        {counts.map(({t,n})=>(
          <div key={t} className="ft-pill" style={{borderColor:FC[t].border, background:FC[t].bg, color:FC[t].color}}>
            <span className="ft-pill-val">{n}</span>
            <span>{t===0?"never drawn":t===4?"all 4 rounds":`${t}× drawn`}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="ft-filters">
        <span className="ft-filter-lbl">Show</span>
        <div className={`ft-ftab${filter===null?" sel":""}`} onClick={()=>setFilter(null)}>All 75</div>
        {[4,3,2,1,0].map(t=>(
          <div key={t}
            className={`ft-ftab${filter===t?" sel":""}`}
            onClick={()=>setFilter(filter===t?null:t)}
            style={filter===t?{background:FC[t].bg,borderColor:FC[t].border,color:FC[t].color}:{}}
          >
            {t}× {t===4?"every round":t===0?"never":"rounds"}
          </div>
        ))}
      </div>

      {/* B I N G O column strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:8}}>
        {Object.entries(COL_RANGES).map(([col,[lo,hi]])=>(
          <div key={col} style={{textAlign:"center",padding:"8px 4px",borderRadius:10,background:COL_BG[col],color:COL_COLORS[col],fontSize:14,fontWeight:500,letterSpacing:".06em"}}>
            {col}<span style={{display:"block",fontSize:10,opacity:.55,marginTop:1}}>{lo}–{hi}</span>
          </div>
        ))}
      </div>

      {/* 75-ball grid */}
      <div className="ball-grid">
        {Array.from({length:75},(_,i)=>i+1).map(n=>(
          <BgCell key={n} n={n} times={freq[n]} allLucky={allLucky} filterTimes={filter}/>
        ))}
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,.05)",alignItems:"center"}}>
        <span style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(232,228,220,.28)"}}>Badge key</span>
        {[1,2,3,4].map(t=>(
          <div key={t} style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}>
            <span style={{minWidth:22,height:16,borderRadius:10,background:BADGE_COLORS[t].bg,color:BADGE_COLORS[t].color,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500,padding:"0 4px"}}>{t}x</span>
            <span style={{color:"rgba(232,228,220,.38)"}}>{t===1?"once":t===2?"twice":t===3?"3 rounds":"all 4"}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,marginLeft:4}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)"}}/>
          <span style={{color:"rgba(232,228,220,.38)"}}>no badge = never drawn</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:"rgba(90,200,138,.3)",border:"2px solid #5AC88A"}}/>
          <span style={{color:"rgba(232,228,220,.38)"}}>bright = lucky number</span>
        </div>
      </div>
    </div>
  );
}

export default function BingoFinalResults() {
  const [drawn, setDrawn] = useState(()=>simulate());
  const [activeP, setActiveP] = useState(0);
  const [spin, setSpin] = useState(false);

  const reSimulate = () => { setSpin(true); setTimeout(()=>setSpin(false),600); setDrawn(simulate()); };

  const p = PLAYERS[activeP];
  const freq = getFrequency(drawn);
  const allHits = drawn.map(d=>p.lucky.filter(n=>d.includes(n)));
  const totalHits = allHits.flat().length;
  const totalWins = allHits.filter(h=>h.length>=3).length;
  const rate = Math.round((totalHits/(p.lucky.length*4))*100);
  const grouped={4:[],3:[],2:[],1:[],0:[]};
  for(let n=1;n<=75;n++) grouped[freq[n]].push(n);
  const freqLabels={
    4:{label:"4× — Every round",cls:"f4",desc:"Appeared in all 4 rounds"},
    3:{label:"3× — Three rounds",cls:"f3",desc:"Appeared in 3 of 4 rounds"},
    2:{label:"2× — Two rounds",cls:"f2",desc:"Appeared in 2 of 4 rounds"},
    1:{label:"1× — Once only",cls:"f1",desc:"Appeared in only 1 round"},
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="root">
        <div className="wrap">

          <div className="hero fu">
            <div className="eyebrow"><div className="eyebrow-line"/>March 24, 2026 · Night Session<div className="eyebrow-line"/></div>
            <h1>Bingo <em>Results</em> &amp; Analysis</h1>
            <p>75 Ball · B-I-N-G-O · 4 Rounds · 5 Players</p>
            <button className={`resim${spin?" spin":""}`} onClick={reSimulate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Re-simulate
            </button>
          </div>

          <div className="sec-label fu fu1">Select player</div>
          <div className="player-tabs fu fu1">
            {PLAYERS.map((pl,i)=>(
              <div key={i} className={`ptab${activeP===i?" on":""}`} onClick={()=>setActiveP(i)}
                style={activeP===i?{background:pl.color,borderColor:pl.color,color:"#0C0C0F"}:{}}>
                <div className="ptab-dot" style={{background:activeP===i?"rgba(0,0,0,.4)":pl.color}}/>{pl.name}
              </div>
            ))}
          </div>

          <div className="legend-row fu fu1">
            {Object.entries(COL_COLORS).map(([c,col])=>(
              <div key={c} className="leg"><div className="ldot" style={{background:col}}/>{c} {COL_RANGES[c].join("–")}</div>
            ))}
            <div className="leg"><div className="ldot" style={{background:"#5AC88A",outline:"2px solid #5AC88A",outlineOffset:2}}/> Lucky hit</div>
          </div>

          <div className="sec-label fu fu2">Round by round — {p.name}</div>
          <div className="rounds-grid fu fu2">
            {ROUNDS.map((r,ri)=>{
              const d=drawn[ri]; const hits=allHits[ri];
              const isWin=hits.length>=3; const isClose=hits.length>0&&!isWin;
              return (
                <div key={ri} className="rcard">
                  <div className="rcard-head">
                    <div><div className="rcard-title">{r.label}</div><div className="rcard-sub">March 24 · {r.time} · {d.length} balls</div></div>
                    <div className={`rbadge ${isWin?"win":isClose?"close":"miss"}`}>
                      <div className="rdot" style={{background:isWin?"#5AC88A":isClose?"#C8A85A":"rgba(232,228,220,.3)"}}/>
                      {isWin?`${hits.length}/5 Winner!`:hits.length>0?`${hits.length}/5 matched`:"No match"}
                    </div>
                  </div>
                  <div className="blbl">Drawn balls</div>
                  <div className="bwrap">{d.map(n=><SmallBall key={n} n={n} hit={p.lucky.includes(n)}/>)}</div>
                  <div className="divhr"/>
                  <div className="blbl" style={{marginTop:10}}>Lucky hits</div>
                  <div className="hits-row">
                    {hits.length>0?hits.map(n=><div key={n} className="hpill">{getCol(n)}-{n}</div>):<span className="no-hit">No lucky numbers drawn</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounds-grid fu fu2" style={{marginBottom:36}}>
            <div className="rcard" style={{borderColor:`${p.color}30`,background:`${p.color}08`}}>
              <div style={{color:p.color,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,marginBottom:16}}>{p.name}'s Summary</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {[{v:4,l:"Rounds"},{v:totalWins,l:"Wins"},{v:totalHits,l:"Hits"},{v:`${rate}%`,l:"Rate"}].map(s=>(
                  <div key={s.l} style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:p.color}}>{s.v}</div>
                    <div style={{fontSize:10,color:"rgba(232,228,220,.3)",textTransform:"uppercase",letterSpacing:".12em",marginTop:3}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:16}}>
                <div className="blbl">Lucky numbers</div>
                <div style={{display:"flex",gap:6,marginTop:6}}>
                  {p.lucky.map(n=>(
                    <div key={n} style={{width:34,height:34,borderRadius:"50%",border:`1.5px solid ${p.color}`,color:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:500}}>{n}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rcard">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,marginBottom:14,color:"#E8E4DC"}}>All players — standings</div>
              {PLAYERS.map((pl,i)=>{
                const ph=drawn.flat().filter(n=>pl.lucky.includes(n)).length;
                const pw=drawn.filter(d=>pl.lucky.filter(n=>d.includes(n)).length>=3).length;
                const mx=Math.max(...PLAYERS.map((_,ii)=>drawn.flat().filter(n=>PLAYERS[ii].lucky.includes(n)).length),1);
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<PLAYERS.length-1?"1px solid rgba(255,255,255,.05)":"none"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:pl.color,color:"#0C0C0F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,flexShrink:0}}>{pl.initials}</div>
                    <div style={{flex:1,fontSize:13,fontWeight:500,color:"#E8E4DC"}}>{pl.name}</div>
                    <div style={{flex:2,background:"rgba(255,255,255,.07)",borderRadius:3,height:6,overflow:"hidden"}}>
                      <div style={{height:6,borderRadius:3,background:pl.color,width:`${Math.round((ph/mx)*100)}%`,transition:"width .4s ease"}}/>
                    </div>
                    <div style={{fontSize:11,color:"rgba(232,228,220,.4)",width:56,textAlign:"right"}}>{ph}H · {pw}W</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── FREQUENCY TRACKER BOX ── */}
          <div className="sec-label fu fu3">Frequency tracker — all 75 balls · rounds 1 to 4</div>
          <FreqTrackerBox drawn={drawn} players={PLAYERS}/>

          {/* Final Results */}
          <div className="final-card fu fu3">
            <div className="final-title">Final Results — Ball Frequency</div>
            <div className="final-sub">Which numbers appeared across all 4 rounds · Total pool: 75 balls</div>
            {[4,3,2,1].map(times=>(
              <div key={times} className="freq-section">
                <div className="freq-header">
                  <div className={`freq-badge ${freqLabels[times].cls}`}>{freqLabels[times].label}</div>
                  <div className="freq-desc">{freqLabels[times].desc} · {grouped[times].length} ball{grouped[times].length!==1?"s":""}</div>
                </div>
                {grouped[times].length>0
                  ?<div className="freq-balls">{grouped[times].sort((a,b)=>a-b).map(n=><FreqBall key={n} n={n} times={times}/>)}</div>
                  :<div className="empty-freq">No balls appeared exactly {times}×</div>}
              </div>
            ))}
            <div style={{height:1,background:"rgba(255,255,255,.05)",margin:"24px 0"}}/>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#E8E4DC",marginBottom:6}}>Full board heatmap</div>
            <div style={{fontSize:12,color:"rgba(232,228,220,.3)",marginBottom:14}}>Every ball 1–75 · brighter = drawn more often</div>
            {Object.entries(COL_RANGES).map(([col,[lo,hi]])=>(
              <div key={col} className="col-section">
                <div className="col-head">
                  <div className="col-letter" style={{background:`${COL_COLORS[col]}22`,color:COL_COLORS[col]}}>{col}</div>
                  <div className="col-name">{lo}–{hi}</div>
                </div>
                <div className="hm-balls">
                  {Array.from({length:hi-lo+1},(_,i)=>lo+i).map(n=>(
                    <HmBall key={n} n={n} times={freq[n]}/>
                  ))}
                </div>
              </div>
            ))}
            <div style={{height:1,background:"rgba(255,255,255,.05)",margin:"24px 0"}}/>
            <div className="freq-section">
              <div className="freq-header">
                <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 16px",borderRadius:30,fontSize:13,fontWeight:500,background:"rgba(255,255,255,.03)",color:"rgba(232,228,220,.25)",border:"1px solid rgba(255,255,255,.06)"}}>0× — Never drawn</div>
                <div className="freq-desc">Did not appear in any round · {grouped[0].length} balls</div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {grouped[0].sort((a,b)=>a-b).map(n=>(
                  <div key={n} style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"rgba(232,228,220,.18)",border:"1px solid rgba(255,255,255,.05)",flexShrink:0}}>{n}</div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}