import React, { useState, useEffect } from "react";

const PUZZLES = [
  {
    label: "Puzzle 1 — Circuito básico",
    grid: [
      'bat','H','bend_br','V','bend_br','bend_bl','empty',
      'empty','empty','V','empty','V','V','empty',
      'empty','empty','V','empty','V','V','empty',
      'empty','empty','bend_tr','H','bend_tl','bend_tr','bulb',
    ],
    solution: [
      'bat','H','bend_br','V','bend_br','bend_bl','empty',
      'empty','empty','V','empty','V','V','empty',
      'empty','empty','V','empty','V','V','empty',
      'empty','empty','bend_tr','H','bend_tl','bend_tr','bulb',
    ],
    hint: 26,
  },
  {
    label: "Puzzle 2 — Rama rota",
    grid: [
      'bat','H','H','broken','H','H','bulb',
      'empty','empty','empty','empty','empty','empty','empty',
      'empty','empty','empty','empty','empty','empty','empty',
      'empty','empty','empty','empty','empty','empty','empty',
    ],
    solution: [
      'bat','H','H','H','H','H','bulb',
      'empty','empty','empty','empty','empty','empty','empty',
      'empty','empty','empty','empty','empty','empty','empty',
      'empty','empty','empty','empty','empty','empty','empty',
    ],
    rotatable: [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    hint: 3,
  },
  {
    label: "Puzzle 3 — Laberinto",
    grid: [
      'bat','H','bend_br','empty','empty','empty','empty',
      'empty','empty','V','empty','empty','empty','empty',
      'empty','empty','bend_tr','H','bend_br','empty','empty',
      'empty','empty','empty','empty','V','H','bulb',
    ],
    solution: [
      'bat','H','bend_br','empty','empty','empty','empty',
      'empty','empty','V','empty','empty','empty','empty',
      'empty','empty','bend_tr','H','bend_br','empty','empty',
      'empty','empty','empty','empty','bend_tr','H','bulb',
    ],
    rotatable: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    hint: 24,
  },
];

const ROTATE = { H:'V',V:'H',bend_br:'bend_bl',bend_bl:'bend_tl',bend_tl:'bend_tr',bend_tr:'bend_br',broken:'H',empty:'empty',bat:'bat',bulb:'bulb' };
const ROTATABLE_FOR_CLICK = ['H','V','bend_br','bend_bl','bend_tl','bend_tr','broken'];
const isRotatableType = (t) => ROTATABLE_FOR_CLICK.includes(t);
const RANDOMIZABLE = ['H','V','bend_br','bend_bl','bend_tl','bend_tr'];
const randomizeGrid = (g) => g.map(t => {
  if (!RANDOMIZABLE.includes(t)) return t;
  let cur = t;
  const n = Math.floor(Math.random()*4);
  for (let i=0;i<n;i++) cur = ROTATE[cur];
  return cur;
});
const COLS = 7;

// ── SVGs de cables ──
function CableH({ color }) {
  return <svg viewBox="0 0 40 40" style={{width:"68%",height:"68%"}}>
    <line x1="0" y1="20" x2="40" y2="20" stroke={color} strokeWidth="5" strokeLinecap="round"/>
  </svg>;
}
function CableV({ color }) {
  return <svg viewBox="0 0 40 40" style={{width:"68%",height:"68%"}}>
    <line x1="20" y1="0" x2="20" y2="40" stroke={color} strokeWidth="5" strokeLinecap="round"/>
  </svg>;
}
function Bend({ type, color }) {
  const paths = {
    bend_br:"M20 40 L20 20 L40 20", bend_bl:"M0 20 L20 20 L20 40",
    bend_tr:"M20 0 L20 20 L40 20",  bend_tl:"M0 20 L20 20 L20 0",
  };
  return <svg viewBox="0 0 40 40" style={{width:"68%",height:"68%"}}>
    <path d={paths[type]} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function BrokenCable({ color }) {
  return <svg viewBox="0 0 40 40" style={{width:"68%",height:"68%"}}>
    <line x1="0" y1="20" x2="14" y2="20" stroke={color} strokeWidth="5" strokeLinecap="round"/>
    <line x1="26" y1="20" x2="40" y2="20" stroke={color} strokeWidth="5" strokeLinecap="round"/>
    <line x1="17" y1="13" x2="23" y2="27" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>;
}
function Battery() {
  return <svg viewBox="0 0 40 40" style={{width:"68%",height:"68%"}}>
    <rect x="4" y="14" width="24" height="12" rx="2" fill="none" stroke="hsl(215, 20%, 70%)" strokeWidth="1.5"/>
    <rect x="28" y="17" width="4" height="6" rx="1" fill="hsl(215, 20%, 70%)"/>
    <line x1="28" y1="20" x2="40" y2="20" stroke="hsl(215, 20%, 70%)" strokeWidth="3"/>
    <text x="16" y="24" fontSize="8" textAnchor="middle" fill="hsl(215, 20%, 70%)" fontFamily="sans-serif">9V</text>
  </svg>;
}
function Bulb({ lit }) {
  return lit
    ? <svg viewBox="0 0 40 40" style={{width:"68%",height:"68%"}}>
        <circle cx="20" cy="17" r="9" fill="hsl(45, 90%, 70%)" stroke="#f59e0b" strokeWidth="1.5"/>
        <line x1="16" y1="27" x2="24" y2="27" stroke="hsl(215, 20%, 65%)" strokeWidth="1.5"/>
        <line x1="17" y1="30" x2="23" y2="30" stroke="hsl(215, 20%, 65%)" strokeWidth="1.5"/>
        <line x1="20" y1="0" x2="20" y2="8" stroke="#f59e0b" strokeWidth="2.5"/>
      </svg>
    : <svg viewBox="0 0 40 40" style={{width:"68%",height:"68%"}}>
        <circle cx="20" cy="17" r="9" fill="none" stroke="hsl(215, 20%, 65%)" strokeWidth="1.5"/>
        <line x1="16" y1="27" x2="24" y2="27" stroke="hsl(215, 20%, 65%)" strokeWidth="1.5"/>
        <line x1="17" y1="30" x2="23" y2="30" stroke="hsl(215, 20%, 65%)" strokeWidth="1.5"/>
        <line x1="20" y1="0" x2="20" y2="8" stroke="hsl(217, 33%, 35%)" strokeWidth="2.5"/>
      </svg>;
}

function CableCell({ type, lit, rotatable, onClick }) {
  const col = lit ? "#f59e0b" : "hsl(215, 20%, 65%)";
  const content = () => {
    if(type==='bat') return <Battery/>;
    if(type==='bulb') return <Bulb lit={lit}/>;
    if(type==='H') return <CableH color={col}/>;
    if(type==='V') return <CableV color={col}/>;
    if(type==='broken') return <BrokenCable color={col}/>;
    if(type.startsWith('bend')) return <Bend type={type} color={col}/>;
    return null;
  };
  return (
    <div onClick={rotatable ? onClick : undefined} style={{
      aspectRatio:"1", borderRadius:8, border:"0.5px solid rgba(148,163,184,0.25)",
      background: rotatable ? "rgba(34,211,238,0.10)" : "transparent",
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor: rotatable ? "pointer" : "default",
      transition:"background .15s",
    }}>
      {content()}
    </div>
  );
}

// ── Modal intro ──
function IntroModal({ onPlay, onBook }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:99, padding:16,
    }}>
      <div style={{
        background:"hsl(222, 47%, 11%)",
        border:"0.5px solid rgba(148,163,184,0.3)",
        borderRadius:12, padding:"28px 24px", maxWidth:420, width:"100%",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:22}}>⚡</span>
          <span style={{fontSize:18,fontWeight:500}}>Nivel 1 — El camino del electrón</span>
        </div>
        <p style={{fontSize:13,color:"hsl(215, 20%, 70%)",lineHeight:1.65,marginBottom:14}}>
          La bombilla está apagada porque los electrones no tienen un camino completo. Tu misión: <strong style={{fontWeight:500}}>rotar los cables</strong> para unir la batería con la bombilla y cerrar el circuito.
        </p>
        <div style={{
          borderLeft:"2px solid #93c5fd", padding:"10px 14px",
          fontSize:12, color:"hsl(215, 20%, 70%)", lineHeight:1.65,
          background:"hsl(217, 91%, 20%)", borderRadius:"0 8px 8px 0", marginBottom:18, fontStyle:"italic",
        }}>
          "¡El foco está apagado porque los electrones no tienen un camino para volver a casa! Une los cables para cerrar el circuito."
        </div>
        <p style={{fontSize:12,color:"hsl(215, 20%, 65%)",marginBottom:18}}>
          💡 Clic en un cable resaltado para rotarlo 90° · Pulsa "Activar" para probar
        </p>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button onClick={onBook} style={{
            display:"flex",alignItems:"center",gap:6,padding:"8px 16px",
            borderRadius:8,border:"0.5px solid #cbd5e1",background:"hsl(217, 33%, 17%)",
            fontSize:13,cursor:"pointer",color:"hsl(215, 20%, 75%)",
          }}>📖 Ver explicación</button>
          <button onClick={onPlay} style={{
            padding:"8px 20px",borderRadius:8,border:"0.5px solid #93c5fd",
            background:"hsl(217, 91%, 20%)",fontSize:13,cursor:"pointer",color:"hsl(199, 89%, 70%)",fontWeight:500,
          }}>▶ ¡Jugar!</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal libro ──
function BookModal({ onClose }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:99, padding:16,
    }}>
      <div style={{
        background:"hsl(222, 47%, 11%)",
        border:"0.5px solid rgba(148,163,184,0.3)",
        borderRadius:12, padding:"28px 24px", maxWidth:460, width:"100%",
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <span style={{fontSize:16,fontWeight:500}}>📚 Circuito cerrado vs abierto</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"hsl(215, 20%, 65%)"}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14,fontSize:13,color:"hsl(215, 20%, 70%)",lineHeight:1.7,marginBottom:20}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{minWidth:32,height:32,borderRadius:"50%",background:"hsl(142, 70%, 14%)",display:"flex",alignItems:"center",justifyContent:"center",marginTop:2,fontSize:16}}>✅</div>
            <div><strong style={{fontWeight:500,color:"hsl(210, 40%, 96%)"}}>Circuito cerrado</strong><br/>El camino está completo. Los electrones fluyen desde la batería, recorren todos los componentes y regresan. La bombilla enciende.</div>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{minWidth:32,height:32,borderRadius:"50%",background:"hsl(0, 70%, 18%)",display:"flex",alignItems:"center",justifyContent:"center",marginTop:2,fontSize:16}}>❌</div>
            <div><strong style={{fontWeight:500,color:"hsl(210, 40%, 96%)"}}>Circuito abierto</strong><br/>Hay una ruptura en el camino. Los electrones no pueden circular. La bombilla permanece apagada sin importar la energía disponible.</div>
          </div>
          <div style={{background:"hsl(217, 33%, 17%)",borderRadius:8,padding:"10px 14px",fontSize:12}}>
            <strong style={{fontWeight:500,color:"hsl(210, 40%, 96%)"}}>Analogía:</strong> Imagina que los electrones son agua en una tubería. Si hay un hueco, el agua se derrama y nunca llega al destino.
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"8px 20px",borderRadius:8,border:"0.5px solid #93c5fd",background:"hsl(217, 91%, 20%)",fontSize:13,cursor:"pointer",color:"hsl(199, 89%, 70%)",fontWeight:500}}>
            Entendido — ¡a jugar!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Level1() {
  const [showIntro, setShowIntro] = useState(true);
  const [showBook, setShowBook]   = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [grid, setGrid] = useState(() => randomizeGrid(PUZZLES[0].grid));
  const [lit, setLit]   = useState(false);
  const [msg, setMsg]   = useState({ type:"info", text:"Rota los cables para trazar un camino continuo desde la batería hasta la bombilla." });
  const [completed, setCompleted] = useState([false,false,false]);
  const [flash, setFlash] = useState(false);

  const pz = PUZZLES[currentPuzzle];

  const checkSolved = (g) => pz.solution.every((v,i)=>v===g[i]);

  const rotateCell = (i) => {
    if(!isRotatableType(grid[i])) return;
    const newGrid = [...grid];
    newGrid[i] = ROTATE[newGrid[i]] || newGrid[i];
    setGrid(newGrid);
    setLit(false);
    setMsg({ type:"info", text:"Rota los cables para trazar un camino continuo desde la batería hasta la bombilla." });
  };

  const activate = () => {
    if(checkSolved(grid)) {
      setLit(true);
      setMsg({ type:"ok", text:"¡Circuito cerrado! Los electrones fluyen y la bombilla enciende. ✅" });
      const newCompleted = [...completed];
      newCompleted[currentPuzzle] = true;
      setCompleted(newCompleted);
      setTimeout(()=>{
        if(currentPuzzle < PUZZLES.length-1) {
          const next = currentPuzzle+1;
          setCurrentPuzzle(next);
          setGrid(randomizeGrid(PUZZLES[next].grid));
          setLit(false);
          setMsg({ type:"info", text:"Rota los cables para trazar un camino continuo desde la batería hasta la bombilla." });
        } else {
          setMsg({ type:"ok", text:"¡Completaste los 3 puzzles del Nivel 1! Electrón domado. ⚡" });
        }
      }, 1800);
    } else {
      setFlash(true);
      setTimeout(()=>setFlash(false),900);
      setMsg({ type:"err", text:"Circuito abierto — los electrones no tienen camino de regreso. Ajusta los cables." });
    }
  };

  const giveHint = () => {
    if(pz.hint===undefined) return;
    const newGrid=[...grid];
    newGrid[pz.hint]=pz.solution[pz.hint];
    setGrid(newGrid);
    setMsg({ type:"info", text:"Pista: un cable fue colocado en su posición correcta." });
  };

  const reset = () => {
    setGrid(randomizeGrid(pz.grid)); setLit(false);
    setMsg({ type:"info", text:"Rota los cables para trazar un camino continuo desde la batería hasta la bombilla." });
  };

  const msgColors = { ok:{bg:"hsl(142, 70%, 14%)",border:"hsl(142, 71%, 45%)",text:"hsl(142, 71%, 70%)"}, err:{bg:"hsl(0, 70%, 18%)",border:"hsl(0, 84%, 60%)",text:"hsl(0, 84%, 75%)"}, info:{bg:"hsl(217, 33%, 17%)",border:"rgba(148,163,184,0.25)",text:"hsl(215, 20%, 75%)"} };
  const mc = msgColors[msg.type];
  const donePct = (completed.filter(Boolean).length/3*100);

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", padding:"24px 16px", maxWidth:560, margin:"0 auto" }}>
      {showIntro && <IntroModal onPlay={()=>setShowIntro(false)} onBook={()=>{setShowIntro(false);setShowBook(true);}}/>}
      {showBook  && <BookModal onClose={()=>setShowBook(false)}/>}

      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>⚡</span>
          <span style={{fontSize:15,fontWeight:500}}>Nivel 1</span>
          <span style={{fontSize:12,color:"hsl(215, 20%, 65%)",background:"hsl(217, 33%, 20%)",border:"0.5px solid #e2e8f0",borderRadius:8,padding:"3px 10px"}}>El camino del electrón</span>
        </div>
        <button onClick={()=>setShowBook(true)} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"hsl(215, 20%, 70%)",background:"hsl(217, 33%, 17%)",border:"0.5px solid #e2e8f0",borderRadius:8,padding:"5px 12px",cursor:"pointer"}}>
          📖 Explicación
        </button>
      </div>

      {/* Progress */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:12,color:"hsl(215, 20%, 65%)",whiteSpace:"nowrap"}}>Progreso</span>
        <div style={{flex:1,height:6,background:"hsl(217, 33%, 20%)",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${donePct}%`,background:"#3b82f6",borderRadius:99,transition:"width .5s ease"}}/>
        </div>
        <span style={{fontSize:12,color:"hsl(215, 20%, 65%)"}}>{completed.filter(Boolean).length} / 3</span>
      </div>

      {/* Step chips */}
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {PUZZLES.map((p,i)=>(
          <div key={i} style={{
            fontSize:11,padding:"3px 10px",borderRadius:99,
            background:completed[i]?"hsl(142, 70%, 14%)":i===currentPuzzle?"hsl(217, 91%, 20%)":"hsl(217, 33%, 17%)",
            border:`0.5px solid ${completed[i]?"hsl(142, 71%, 45%)":i===currentPuzzle?"hsl(199, 89%, 55%)":"hsl(217, 33%, 28%)"}`,
            color:completed[i]?"hsl(142, 71%, 65%)":i===currentPuzzle?"hsl(199, 89%, 70%)":"hsl(215, 20%, 65%)",
            fontWeight:i===currentPuzzle?500:400,
          }}>{p.label}</div>
        ))}
      </div>

      {/* Board */}
      <div style={{
        background:"hsl(217, 33%, 17%)",border:"0.5px solid #e2e8f0",borderRadius:12,
        padding:16,marginBottom:12,
        animation:flash?"flash .5s linear 2":"none",
      }}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${COLS},1fr)`,gap:5}}>
          {grid.map((type,i)=>(
            <CableCell key={i} type={type} lit={lit && pz.solution[i]!=='empty'}
              rotatable={isRotatableType(type)} onClick={()=>rotateCell(i)}/>
          ))}
        </div>
      </div>

      {/* Message */}
      <div style={{
        minHeight:44,borderRadius:8,border:`0.5px solid ${mc.border}`,
        background:mc.bg,padding:"10px 16px",fontSize:13,color:mc.text,
        display:"flex",alignItems:"center",gap:8,marginBottom:14,textAlign:"center",
        justifyContent:"center",
      }}>
        {msg.type==="ok"?"✅":msg.type==="err"?"❌":"ℹ️"} {msg.text}
      </div>

      {/* Actions */}
      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={reset} style={{padding:"8px 18px",borderRadius:8,border:"0.5px solid #e2e8f0",background:"hsl(217, 33%, 17%)",fontSize:13,cursor:"pointer",color:"hsl(215, 20%, 75%)"}}>
          🔄 Reiniciar
        </button>
        <button onClick={giveHint} style={{padding:"8px 18px",borderRadius:8,border:"0.5px solid #e2e8f0",background:"hsl(217, 33%, 17%)",fontSize:13,cursor:"pointer",color:"hsl(215, 20%, 75%)"}}>
          💡 Pista
        </button>
        <button onClick={activate} style={{padding:"8px 22px",borderRadius:8,border:"0.5px solid #93c5fd",background:"hsl(217, 91%, 20%)",fontSize:13,cursor:"pointer",color:"hsl(199, 89%, 70%)",fontWeight:500}}>
          ⚡ Activar circuito
        </button>
      </div>

      <style>{`
        @keyframes flash {
          0%,100%{background:#f8fafc} 50%{background:#fef2f2}
        }
      `}</style>
    </div>
  );
}
