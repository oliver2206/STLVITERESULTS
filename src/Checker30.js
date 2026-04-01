import { useState, useCallback, useRef } from "react";

const COLS = ["B","I","N","G","O"];
const RANGES = [[1,15],[16,30],[31,45],[46,60],[61,75]];
const COL_COLORS = { B:"#7C3AED", I:"#EC4899", N:"#3B82F6", G:"#10B981", O:"#F97316" };
const DRAW_PRESETS = [25,30,35,40,44,48];

const PROFILES = [
  { name:"Alex Rivera", seed:"Alex",   color:"#6D28D9", accent:"#F59E0B" },
  { name:"Sam Chen",    seed:"Sam",    color:"#DB2777", accent:"#10B981" },
  { name:"Jordan Lee",  seed:"Jordan", color:"#0284C7", accent:"#F97316" },
];

function genGrid() {
  return RANGES.map(([min,max]) => {
    const pool = Array.from({length:max-min+1},(_,i)=>i+min);
    return pool.sort(()=>Math.random()-0.5).slice(0,5);
  });
}
function serial(){ return String(Math.floor(Math.random()*99999999)).padStart(8,"0"); }
function colOf(n){ return COLS[Math.floor((n-1)/15)]; }
function checkBingo(m){
  for(let r=0;r<5;r++) if(m[r].every(Boolean)) return true;
  for(let c=0;c<5;c++) if(m.every(row=>row[c])) return true;
  if([0,1,2,3,4].every(i=>m[i][i])) return true;
  if([0,1,2,3,4].every(i=>m[i][4-i])) return true;
  return false;
}
function makeCards(){
  return PROFILES.map((p,i)=>({
    p, id:i, grid:genGrid(), serial:serial(),
    marked: Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>r===2&&c===2)),
  }));
}

// ── Instant Entry ───────────────────────────────────────────────
function InstantEntry({ called, onCall, limit }) {
  const [val, setVal] = useState("");
  const [flash, setFlash] = useState(null);
  const [log, setLog] = useState([]);
  const inputRef = useRef(null);

  const triggerFlash = (type) => {
    setFlash(type);
    setTimeout(()=>setFlash(null), 600);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const n = parseInt(val);
    if (isNaN(n)||n<1||n>75) {
      triggerFlash("err");
      setLog(prev=>[...prev,{label:`"${val}" invalid`,type:"bad"}]);
      setVal(""); return;
    }
    if (called.has(n)) {
      triggerFlash("err");
      setLog(prev=>[...prev,{label:`${n} already called`,type:"dup"}]);
      setVal(""); return;
    }
    if (limit !== null && called.size >= limit) {
      triggerFlash("err");
      setLog(prev=>[...prev,{label:`Limit of ${limit} reached!`,type:"bad"}]);
      setVal(""); return;
    }
    onCall(n);
    triggerFlash("ok");
    setLog(prev=>[...prev,{label:`${colOf(n)}${n} ✓`,type:"ok"}]);
    setVal("");
    inputRef.current?.focus();
  };

  return (
    <div style={s.panel}>
      <div style={s.panelLabel}>Type a number &amp; press Enter → instant highlight</div>
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <input
          ref={inputRef} type="number" min="1" max="75" placeholder="00"
          value={val} autoFocus
          onChange={e=>setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            ...s.entryInput,
            ...(flash==="ok"?{borderColor:"#10B981",boxShadow:"0 0 0 3px rgba(16,185,129,0.3)"}:{}),
            ...(flash==="err"?{borderColor:"#EF4444",boxShadow:"0 0 0 3px rgba(239,68,68,0.3)"}:{}),
          }}
        />
        <div style={{flex:1}}>
          <div style={s.entryHint}>Press Enter after each number — highlights all cards immediately</div>
          {log.length>0 && (
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
              {log.map((item,i)=>(
                <span key={i} style={{...s.tag,...(item.type==="ok"?s.tagOk:item.type==="dup"?s.tagDup:s.tagBad)}}>
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>
        {log.length>0 && (
          <button onClick={()=>setLog([])} style={s.btnClearLog}>Clear log</button>
        )}
      </div>
    </div>
  );
}

// ── Draw Panel with inline counter ─────────────────────────────
function DrawPanel({calledSize, selectedCount, onSelect, onDraw, onDrawOne, onReset}){
  return (
    <div style={s.panel}>
      <div style={s.panelLabel}>Draw total numbers</div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
        {DRAW_PRESETS.map(n => {
          const done = calledSize >= n;
          const remaining = Math.max(0, n - calledSize);
          const isActive = selectedCount === n;
          return (
            <button key={n} onClick={()=>!done && onSelect(isActive ? null : n)} style={{
              ...s.presetBtn,
              ...(isActive ? s.presetActive : {}),
              ...(done ? s.presetDone : {}),
            }}>
              <span style={{...s.presetNum,...(isActive?{color:"#fff"}:{}),...(done?{color:"rgba(255,255,255,0.3)"}:{})}}>{n}</span>
              <span style={{...s.presetCounter,...(isActive?{color:"rgba(255,255,255,0.75)"}:{}),...(done?{color:"rgba(255,255,255,0.2)"}:{})}}>
                {done ? "done" : `+${remaining} more`}
              </span>
            </button>
          );
        })}
        <button onClick={onDraw} disabled={selectedCount===null||calledSize>=selectedCount} style={{
          ...s.btnGo,
          ...((selectedCount===null||calledSize>=selectedCount)?s.btnDisabled:{}),
        }}>Draw</button>
        <button onClick={onDrawOne} disabled={calledSize>=75||(selectedCount!==null&&calledSize>=selectedCount)} style={s.btnOne}>+1 Random</button>
        <button onClick={onReset} style={s.btnReset}>New Game</button>
      </div>
      <div style={s.progressTrack}>
        <div style={{...s.progressFill,width:`${(calledSize/75)*100}%`}}/>
      </div>
    </div>
  );
}

// ── Number Board ────────────────────────────────────────────────
function NumberBoard({called, onCall}){
  return (
    <div style={s.board}>
      {COLS.map((col,ci)=>{
        const[min,max]=RANGES[ci];
        return (
          <div key={col} style={s.colGroup}>
            <div style={s.colRow}>
              <div style={{...s.colBadge,background:COL_COLORS[col]}}>{col}</div>
              <div style={s.colNums}>
                {Array.from({length:max-min+1},(_,i)=>{
                  const n=min+i; const isCalled=called.has(n);
                  return (
                    <button key={n} onClick={()=>onCall(n)} disabled={isCalled} style={{
                      ...s.numBtn,
                      ...(isCalled?{background:COL_COLORS[col],color:"#fff",borderColor:"transparent",cursor:"default"}:{}),
                    }}>{n}</button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Bingo Card ──────────────────────────────────────────────────
function BingoCard({card}){
  const isWinner=checkBingo(card.marked);
  return (
    <div style={{...s.card,...(isWinner?s.winCard:{})}}>
      {isWinner&&<div style={s.winBadge}>BINGO!</div>}
      <div style={{...s.prof,background:card.p.color}}>
        <div style={s.avWrap}>
          <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${card.p.seed}&backgroundColor=ffffff`} alt={card.p.name} style={s.av}/>
        </div>
        <div>
          <div style={s.pname}>{card.p.name}</div>
          <div style={s.pserial}>#{card.serial}</div>
        </div>
      </div>
      <div style={{...s.bhead,background:card.p.color}}>
        {COLS.map(c=><div key={c} style={s.bhdrCell}>{c}</div>)}
      </div>
      <div style={s.bgrid}>
        {Array.from({length:5},(_,ri)=>Array.from({length:5},(_,ci)=>{
          const isFree=ri===2&&ci===2, val=card.grid[ci][ri], isMarked=card.marked[ri][ci];
          return (
            <div key={`${ri}-${ci}`} style={{
              ...s.bcell,
              ...(isFree?{background:card.p.accent,borderColor:"transparent",color:"#fff",fontSize:9}:{}),
              ...(isMarked&&!isFree?{background:card.p.color,borderColor:"transparent",color:"#fff",transform:"scale(0.95)"}:{}),
            }}>{isFree?"FREE":val}</div>
          );
        }))}
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────────
export default function BingoGallery(){
  const [cards,setCards]=useState(makeCards);
  const [called,setCalled]=useState(()=>new Set());
  const [selectedCount,setSelectedCount]=useState(null);

  const applyCall=useCallback((n,c,cds)=>{
    if(c.has(n)) return{called:c,cards:cds};
    const nc=new Set(c); nc.add(n);
    const nCards=cds.map(card=>{
      const nm=card.marked.map(r=>[...r]);
      card.grid.forEach((col,ci)=>col.forEach((val,ri)=>{if(val===n)nm[ri][ci]=true;}));
      return{...card,marked:nm};
    });
    return{called:nc,cards:nCards};
  },[]);

  const callOne=useCallback((n)=>{
    if(selectedCount!==null && called.size>=selectedCount) return;
    const{called:nc,cards:nCards}=applyCall(n,called,cards);
    setCalled(nc); setCards(nCards);
  },[called,cards,applyCall,selectedCount]);

  const drawTotal=useCallback((total)=>{
    const rem=[]; for(let n=1;n<=75;n++) if(!called.has(n)) rem.push(n);
    const needed=Math.min(total-called.size,rem.length); if(needed<=0) return;
    rem.sort(()=>Math.random()-0.5);
    let c=called,cds=cards;
    for(let i=0;i<needed;i++){const r=applyCall(rem[i],c,cds);c=r.called;cds=r.cards;}
    setCalled(c); setCards(cds);
  },[called,cards,applyCall]);

  const drawOne=()=>{
    if(selectedCount!==null && called.size>=selectedCount) return;
    const rem=[]; for(let n=1;n<=75;n++) if(!called.has(n)) rem.push(n);
    if(rem.length) callOne(rem[Math.floor(Math.random()*rem.length)]);
  };

  const reset=()=>{ setCards(makeCards()); setCalled(new Set()); setSelectedCount(null); };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <div style={s.appName}>🎴 Bingo Gallery</div>
          <div style={s.appSub}>Live Caller Board</div>
        </div>
        <span style={s.countBadge}>{called.size} / 75 called</span>
      </div>

      <InstantEntry called={called} onCall={callOne} limit={selectedCount}/>

      <DrawPanel
        calledSize={called.size}
        selectedCount={selectedCount}
        onSelect={n=>setSelectedCount(n)}
        onDraw={()=>{ if(selectedCount!==null) drawTotal(selectedCount); }}
        onDrawOne={drawOne}
        onReset={reset}
      />

      <NumberBoard called={called} onCall={callOne}/>

      <div style={s.cardsRow}>
        {cards.map(card=><BingoCard key={card.id} card={card}/>)}
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const s={
  root:{minHeight:"100vh",background:"#0f0c29",padding:16,fontFamily:"'Segoe UI',sans-serif"},
  header:{display:"flex",alignItems:"center",gap:12,marginBottom:10},
  appName:{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:1},
  appSub:{fontSize:11,color:"rgba(255,255,255,0.35)",letterSpacing:3,textTransform:"uppercase",marginTop:2},
  countBadge:{fontSize:12,color:"rgba(255,255,255,0.4)",marginLeft:"auto"},

  panel:{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"10px 14px",marginBottom:10},
  panelLabel:{fontSize:11,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:2,marginBottom:8},

  entryInput:{width:90,height:48,borderRadius:10,border:"2px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:26,fontWeight:900,textAlign:"center",fontFamily:"inherit",outline:"none",transition:"border-color 0.15s, box-shadow 0.15s"},
  entryHint:{fontSize:12,color:"rgba(255,255,255,0.35)"},
  tag:{padding:"2px 9px",borderRadius:12,fontWeight:700,fontSize:11},
  tagOk:{background:"rgba(16,185,129,0.15)",color:"#34D399",border:"1px solid rgba(16,185,129,0.25)"},
  tagDup:{background:"rgba(245,158,11,0.15)",color:"#FBBF24",border:"1px solid rgba(245,158,11,0.2)"},
  tagBad:{background:"rgba(239,68,68,0.15)",color:"#F87171",border:"1px solid rgba(239,68,68,0.2)"},
  btnClearLog:{background:"transparent",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,cursor:"pointer"},

  // Preset pill with counter inside
  presetBtn:{display:"flex",flexDirection:"column",alignItems:"center",padding:"5px 14px 4px",borderRadius:20,border:"1.5px solid rgba(255,255,255,0.15)",background:"transparent",cursor:"pointer",minWidth:52,transition:"all 0.15s"},
  presetActive:{background:"#7C3AED",border:"1.5px solid #7C3AED"},
  presetDone:{opacity:0.45,cursor:"default"},
  presetNum:{fontSize:13,fontWeight:900,color:"#c4b5fd",lineHeight:1.1},
  presetCounter:{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.4)",letterSpacing:0.5,marginTop:1,lineHeight:1},

  btnGo:{background:"#7C3AED",color:"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"},
  btnOne:{background:"rgba(255,255,255,0.08)",color:"#e0e7ff",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 13px",fontSize:12,fontWeight:700,cursor:"pointer"},
  btnReset:{background:"transparent",color:"#a0aec0",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"},
  btnDisabled:{opacity:0.38,cursor:"default"},
  progressTrack:{height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden"},
  progressFill:{height:"100%",background:"#7C3AED",borderRadius:2,transition:"width 0.3s"},

  board:{marginBottom:12,display:"flex",flexDirection:"column",alignItems:"center"},
  colGroup:{marginBottom:5,display:"flex",justifyContent:"center"},
  colRow:{display:"flex",alignItems:"center",gap:6},
  colBadge:{width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#fff",flexShrink:0},
  colNums:{display:"flex",gap:3},
  numBtn:{width:35,height:32,borderRadius:6,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#e0e7ff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",flexShrink:0},

  cardsRow:{display:"flex",gap:10,flexWrap:"wrap"},
  card:{background:"#fff",borderRadius:14,overflow:"hidden",minWidth:182,flex:1,border:"1.5px solid #ede9fe",position:"relative"},
  winCard:{border:"2.5px solid #F59E0B"},
  winBadge:{position:"absolute",top:6,right:6,background:"#F59E0B",color:"#fff",borderRadius:12,padding:"2px 8px",fontSize:10,fontWeight:900,zIndex:5,letterSpacing:1},
  prof:{display:"flex",alignItems:"center",gap:8,padding:"10px 10px 8px"},
  avWrap:{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.25)",padding:2,flexShrink:0},
  av:{width:"100%",height:"100%",borderRadius:"50%",display:"block"},
  pname:{color:"#fff",fontSize:12,fontWeight:900},
  pserial:{color:"rgba(255,255,255,0.6)",fontSize:10,marginTop:1},
  bhead:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:2,padding:"0 8px 4px"},
  bhdrCell:{textAlign:"center",color:"#fff",fontWeight:900,fontSize:12,letterSpacing:1},
  bgrid:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gridTemplateRows:"repeat(5,1fr)",gap:2,padding:"0 8px 8px",background:"#f5f3ff"},
  bcell:{background:"#fff",borderRadius:5,height:29,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #ede9fe",fontSize:11,fontWeight:700,color:"#1e1b4b",transition:"all 0.2s"},
};