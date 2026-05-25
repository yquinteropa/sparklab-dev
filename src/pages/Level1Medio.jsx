import React, { useState } from "react";

const BANDS = [
  {name:'Negro',   hex:'#1a1a1a', digit:0, mult:1,       tol:null},
  {name:'Marrón',  hex:'#7b3f00', digit:1, mult:10,      tol:'±1%'},
  {name:'Rojo',    hex:'#c0392b', digit:2, mult:100,     tol:'±2%'},
  {name:'Naranja', hex:'#e67e22', digit:3, mult:1000,    tol:null},
  {name:'Amarillo',hex:'#f1c40f', digit:4, mult:10000,   tol:null},
  {name:'Verde',   hex:'#27ae60', digit:5, mult:100000,  tol:'±0.5%'},
  {name:'Azul',    hex:'#2980b9', digit:6, mult:1000000, tol:'±0.25%'},
  {name:'Violeta', hex:'#8e44ad', digit:7, mult:null,    tol:'±0.1%'},
  {name:'Gris',    hex:'#95a5a6', digit:8, mult:null,    tol:'±0.05%'},
  {name:'Blanco',  hex:'#ecf0f1', digit:9, mult:null,    tol:null},
  {name:'Oro',     hex:'#f0c040', digit:null,mult:0.1,   tol:'±5%'},
  {name:'Plata',   hex:'#b2bec3', digit:null,mult:0.01,  tol:'±10%'},
];
const DIGIT_BANDS = BANDS.filter(b=>b.digit!==null);
const MULT_BANDS  = BANDS.filter(b=>b.mult!==null);
const TOL_BANDS   = BANDS.filter(b=>b.tol!==null);

const PART1_Q = [
  {ohms:470,  tol:'±5%'},
  {ohms:1000, tol:'±5%'},
  {ohms:4700, tol:'±5%'},
];
const PART2_Q = [
  {b1:'Amarillo',b2:'Violeta',b3:'Rojo',   b4:'Oro'},
  {b1:'Marrón',  b2:'Negro',  b3:'Naranja',b4:'Oro'},
  {b1:'Rojo',    b2:'Rojo',   b3:'Marrón', b4:'Plata'},
];

function formatOhms(v){
  if(v>=1e6) return (v/1e6).toFixed(v%1e6===0?0:2)+' MΩ';
  if(v>=1000) return (v/1000).toFixed(v%1000===0?0:2)+' kΩ';
  return v+' Ω';
}
function bandHex(name){ return BANDS.find(x=>x.name===name)?.hex||'#ccc'; }

function ResistorSVG({colors}){
  const xs=[100,128,156,192];
  return (
    <svg viewBox="0 0 340 80" style={{display:'block',margin:'0 auto 1.2rem',maxWidth:320,width:'100%'}}>
      <line x1="20" y1="40" x2="90" y2="40" stroke="#94a3b8" strokeWidth="2.5"/>
      <line x1="248" y1="40" x2="320" y2="40" stroke="#94a3b8" strokeWidth="2.5"/>
      <rect x="90" y="22" width="158" height="36" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1"/>
      {xs.map((x,i)=>(
        <rect key={i} x={x} y="22" width="18" height="36" rx="2"
          fill={colors[i]||'#e2e8f0'} stroke="#cbd5e1" strokeWidth="0.5"/>
      ))}
    </svg>
  );
}

function ColorTable(){
  return (
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,marginTop:8}}>
      <thead>
        <tr>{['Color','Muestra','Dígito','Multiplicador','Tolerancia'].map(h=>(
          <th key={h} style={{fontSize:11,fontWeight:500,color:'#64748b',padding:'4px 8px',textAlign:'center',borderBottom:'0.5px solid #e2e8f0'}}>{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {BANDS.map(b=>(
          <tr key={b.name}>
            <td style={{padding:'4px 8px',textAlign:'left'}}>{b.name}</td>
            <td style={{padding:'4px 8px',textAlign:'center'}}><span style={{display:'inline-block',width:28,height:16,borderRadius:3,background:b.hex,border:'0.5px solid #e2e8f0'}}/></td>
            <td style={{padding:'4px 8px',textAlign:'center'}}>{b.digit!=null?b.digit:'—'}</td>
            <td style={{padding:'4px 8px',textAlign:'center'}}>{b.mult!=null?'×'+b.mult.toLocaleString():'—'}</td>
            <td style={{padding:'4px 8px',textAlign:'center'}}>{b.tol||'—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Level1Medio(){
  const [screen, setScreen] = useState('intro'); // intro | book | game
  const [part,   setPart]   = useState(0);
  const [qIdx,   setQIdx]   = useState(0);
  const [sel,    setSel]    = useState({b1:null,b2:null,b3:null,b4:null});
  const [ohmsInput, setOhmsInput] = useState('');
  const [msg,    setMsg]    = useState({type:'info',text:'Selecciona los colores que corresponden al valor mostrado.'});
  const [completed, setCompleted] = useState([0,0]);

  const q1 = PART1_Q[qIdx];
  const q2 = PART2_Q[qIdx];
  const totalDone = completed[0]+completed[1];

  const preview=[sel.b1?bandHex(sel.b1):'#e2e8f0',sel.b2?bandHex(sel.b2):'#e2e8f0',sel.b3?bandHex(sel.b3):'#e2e8f0',sel.b4?bandHex(sel.b4):'#e2e8f0'];

  const checkAnswer=()=>{
    if(part===0){
      if(!sel.b1||!sel.b2||!sel.b3||!sel.b4){setMsg({type:'err',text:'Selecciona los 4 colores antes de verificar.'});return;}
      const b1=BANDS.find(x=>x.name===sel.b1),b2=BANDS.find(x=>x.name===sel.b2),b3=BANDS.find(x=>x.name===sel.b3),b4=BANDS.find(x=>x.name===sel.b4);
      const calc=Math.round((b1.digit*10+b2.digit)*b3.mult);
      if(calc===q1.ohms&&b4.tol===q1.tol){
        setMsg({type:'ok',text:'¡Correcto! '+formatOhms(q1.ohms)+' representado correctamente.'});
        const nc=[...completed]; nc[0]++; setCompleted(nc);
        setSel({b1:null,b2:null,b3:null,b4:null});
        setTimeout(()=>{
          if(qIdx<2){setQIdx(q=>q+1);setMsg({type:'info',text:'Selecciona los colores que corresponden al valor mostrado.'});}
          else{setPart(1);setQIdx(0);setMsg({type:'info',text:'Lee las bandas y escribe el valor en ohmios.'});}
        },1400);
      } else {
        let hint='';
        const calc2=Math.round((b1.digit*10+b2.digit)*b3.mult);
        if(calc2!==q1.ohms) hint=` Calculaste ${formatOhms(calc2)}, pero el objetivo es ${formatOhms(q1.ohms)}.`;
        if(b4.tol!==q1.tol) hint+=' Revisa la banda de tolerancia.';
        setMsg({type:'err',text:'Respuesta incorrecta.'+hint});
      }
    } else {
      const qb1=BANDS.find(x=>x.name===q2.b1),qb2=BANDS.find(x=>x.name===q2.b2),qb3=BANDS.find(x=>x.name===q2.b3);
      const correct=Math.round((qb1.digit*10+qb2.digit)*qb3.mult);
      const entered=parseInt(ohmsInput||'0',10);
      if(!ohmsInput){setMsg({type:'err',text:'Escribe el valor de la resistencia.'});return;}
      if(entered===correct){
        setMsg({type:'ok',text:'¡Excelente! El valor correcto es '+formatOhms(correct)+'.'});
        const nc=[...completed]; nc[1]++; setCompleted(nc);
        setOhmsInput('');
        setTimeout(()=>{
          if(qIdx<2){setQIdx(q=>q+1);setMsg({type:'info',text:'Lee las bandas y escribe el valor en ohmios.'});}
          else setMsg({type:'ok',text:'¡Completaste el Nivel 1 del módulo medio!'});
        },1400);
      } else {
        setMsg({type:'err',text:`Incorrecto. (${qb1.name}[${qb1.digit}]×10+${qb2.name}[${qb2.digit}])×${qb3.mult.toLocaleString()} = ${formatOhms(correct)}. Ingresaste ${formatOhms(entered)}.`});
      }
    }
  };

  const giveHint=()=>{
    if(part===0){
      const mult=MULT_BANDS.find(b=>{ const r=q1.ohms/b.mult; return Number.isInteger(r)&&r<100&&r>=10; });
      if(mult&&!sel.b3){setSel(s=>({...s,b3:mult.name}));setMsg({type:'info',text:'Pista: banda 3 (multiplicador) es '+mult.name+' (×'+mult.mult.toLocaleString()+')'});}
      else{const tol=TOL_BANDS.find(b=>b.tol===q1.tol);if(tol&&!sel.b4){setSel(s=>({...s,b4:tol.name}));setMsg({type:'info',text:'Pista: banda 4 es '+tol.name+' ('+q1.tol+').'});}}
    } else {
      const qb1=BANDS.find(x=>x.name===q2.b1),qb2=BANDS.find(x=>x.name===q2.b2),qb3=BANDS.find(x=>x.name===q2.b3);
      setMsg({type:'info',text:`Pista: (${qb1.name}=${qb1.digit})×10 + (${qb2.name}=${qb2.digit}) = ${qb1.digit*10+qb2.digit}, luego × ${qb3.mult.toLocaleString()}.`});
    }
  };

  const skip=()=>{
    setSel({b1:null,b2:null,b3:null,b4:null}); setOhmsInput('');
    if(part===0){ if(qIdx<2) setQIdx(q=>q+1); else{setPart(1);setQIdx(0);} setMsg({type:'info',text:'Selecciona los colores que corresponden al valor mostrado.'});}
    else{ if(qIdx<2) setQIdx(q=>q+1); setMsg({type:'info',text:'Lee las bandas y escribe el valor en ohmios.'});}
  };

  const msgStyle={info:{bg:'#f8fafc',border:'#e2e8f0',color:'#64748b'},ok:{bg:'#f0fdf4',border:'#86efac',color:'#15803d'},err:{bg:'#fef2f2',border:'#fca5a5',color:'#dc2626'}};
  const ms=msgStyle[msg.type];

  if(screen==='intro') return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',minHeight:400}}>
      <div style={{background:'#fff',border:'0.5px solid #e2e8f0',borderRadius:12,padding:'26px 22px',maxWidth:440,width:'100%'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <span style={{fontSize:20}}>▬</span>
          <span style={{fontSize:17,fontWeight:500}}>Nivel 1 — Código de colores</span>
        </div>
        <p style={{fontSize:13,color:'#64748b',lineHeight:1.65,marginBottom:12}}>Las resistencias tienen bandas de color que indican su valor. Aprenderás a leer y calcular ese valor en dos partes.</p>
        <div style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#64748b',lineHeight:1.6,marginBottom:16}}>
          <strong style={{fontWeight:500,color:'#1e293b'}}>Fórmula (4 bandas):</strong><br/>
          Valor = (banda1 × 10 + banda2) × multiplicador ± tolerancia<br/>
          <span style={{fontSize:11}}>Ej: Rojo(2)·Violeta(7)·Naranja(×1000)·Oro(±5%) = 27 000 Ω</span>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button onClick={()=>setScreen('book')} style={{padding:'8px 16px',borderRadius:8,border:'0.5px solid #e2e8f0',background:'#f8fafc',fontSize:13,cursor:'pointer',color:'#475569'}}>📖 Tabla de colores</button>
          <button onClick={()=>setScreen('game')} style={{padding:'8px 20px',borderRadius:8,border:'0.5px solid #93c5fd',background:'#eff6ff',fontSize:13,cursor:'pointer',color:'#1d4ed8',fontWeight:500}}>▶ Empezar</button>
        </div>
      </div>
    </div>
  );

  if(screen==='book') return (
    <div style={{padding:'1.5rem 0',maxWidth:560,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <span style={{fontSize:16,fontWeight:500}}>📚 Tabla de código de colores</span>
        <button onClick={()=>setScreen('game')} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#94a3b8'}}>✕</button>
      </div>
      <ColorTable/>
      <div style={{marginTop:12,fontSize:12,color:'#64748b',lineHeight:1.65}}>
        <strong style={{fontWeight:500,color:'#1e293b'}}>Cómo calcular:</strong> Toma el dígito de banda 1, el de banda 2, multiplica por el multiplicador de banda 3. Banda 4 = tolerancia.
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}>
        <button onClick={()=>setScreen('game')} style={{padding:'8px 20px',borderRadius:8,border:'0.5px solid #93c5fd',background:'#eff6ff',fontSize:13,cursor:'pointer',color:'#1d4ed8',fontWeight:500}}>Entendido — ¡a practicar!</button>
      </div>
    </div>
  );

  return (
    <div style={{padding:'1.5rem 0',maxWidth:580,margin:'0 auto',fontFamily:'sans-serif'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.2rem',flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:16}}>▬</span>
          <span style={{fontSize:14,fontWeight:500}}>Nivel 1</span>
          <span style={{fontSize:12,color:'#64748b',background:'#f1f5f9',border:'0.5px solid #e2e8f0',borderRadius:8,padding:'3px 10px'}}>Código de colores</span>
        </div>
        <button onClick={()=>setScreen('book')} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#64748b',background:'#f8fafc',border:'0.5px solid #e2e8f0',borderRadius:8,padding:'5px 12px',cursor:'pointer'}}>
          📖 Tabla de colores
        </button>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
        <span style={{fontSize:11,color:'#94a3b8',whiteSpace:'nowrap'}}>Progreso</span>
        <div style={{flex:1,height:5,background:'#f1f5f9',borderRadius:99,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${(totalDone/6)*100}%`,background:'#3b82f6',borderRadius:99,transition:'width .5s'}}/>
        </div>
        <span style={{fontSize:11,color:'#94a3b8'}}>{totalDone} / 6</span>
      </div>

      <div style={{display:'flex',gap:6,marginBottom:'1.5rem',flexWrap:'wrap'}}>
        {[['Parte 1 — Valor a colores',0],['Parte 2 — Colores a valor',1]].map(([lbl,p])=>(
          <div key={p} style={{fontSize:11,padding:'3px 11px',borderRadius:99,
            background:part===p?'#eff6ff':completed[p]>=3?'#f0fdf4':'#f8fafc',
            border:`0.5px solid ${part===p?'#93c5fd':completed[p]>=3?'#86efac':'#e2e8f0'}`,
            color:part===p?'#1d4ed8':completed[p]>=3?'#16a34a':'#94a3b8',
            fontWeight:part===p?500:400}}>{lbl}</div>
        ))}
      </div>

      <div style={{background:'#fff',border:'0.5px solid #e2e8f0',borderRadius:12,padding:'1.25rem',marginBottom:'1rem'}}>
        {part===0 ? (
          <>
            <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Parte 1 — Valor a colores <span style={{fontSize:11,color:'#94a3b8',fontWeight:400}}>({qIdx+1} de 3)</span></div>
            <div style={{fontSize:13,color:'#64748b',marginBottom:'1rem',lineHeight:1.5}}>Elige las 4 bandas de color que representan el siguiente valor.</div>
            <div style={{background:'#f8fafc',borderRadius:8,padding:'10px 16px',textAlign:'center',marginBottom:'1rem'}}>
              <div style={{fontSize:22,fontWeight:500,fontFamily:'monospace'}}>{formatOhms(q1.ohms)}</div>
              <div style={{fontSize:12,color:'#64748b'}}>Tolerancia: {q1.tol}</div>
            </div>
            <ResistorSVG colors={preview}/>
            <div style={{display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap'}}>
              {['b1','b2','b3','b4'].map((k,i)=>{
                const opts=[DIGIT_BANDS,DIGIT_BANDS,MULT_BANDS,TOL_BANDS][i];
                const lbl=['Banda 1\n(1er dígito)','Banda 2\n(2do dígito)','Banda 3\n(multiplicador)','Banda 4\n(tolerancia)'][i];
                return (
                  <div key={k} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                    <div style={{fontSize:11,color:'#94a3b8',textAlign:'center',whiteSpace:'pre-line',lineHeight:1.3}}>{lbl}</div>
                    <div style={{width:28,height:18,borderRadius:4,border:'0.5px solid #e2e8f0',background:sel[k]?bandHex(sel[k]):'#f1f5f9',transition:'background .2s'}}/>
                    <select value={sel[k]||''} onChange={e=>setSel(s=>({...s,[k]:e.target.value||null}))}
                      style={{width:80,height:30,borderRadius:8,border:'0.5px solid #e2e8f0',fontSize:11,cursor:'pointer',background:'#fff',color:'#1e293b'}}>
                      <option value="">--</option>
                      {opts.map(b=><option key={b.name} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </>
        ):(
          <>
            <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>Parte 2 — Colores a valor <span style={{fontSize:11,color:'#94a3b8',fontWeight:400}}>({qIdx+1} de 3)</span></div>
            <div style={{fontSize:13,color:'#64748b',marginBottom:'1rem',lineHeight:1.5}}>Lee las bandas de la resistencia y escribe su valor en ohmios.</div>
            <ResistorSVG colors={[q2.b1,q2.b2,q2.b3,q2.b4].map(bandHex)}/>
            <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:'1rem',flexWrap:'wrap'}}>
              {[q2.b1,q2.b2,q2.b3,q2.b4].map((lbl,i)=>(
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <div style={{width:36,height:36,borderRadius:8,border:'0.5px solid #e2e8f0',background:bandHex(lbl)}}/>
                  <div style={{fontSize:10,color:'#94a3b8'}}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <input type="number" value={ohmsInput} onChange={e=>setOhmsInput(e.target.value)} placeholder="Valor"
                style={{width:120,height:36,borderRadius:8,border:'0.5px solid #e2e8f0',fontSize:15,textAlign:'center',padding:'0 8px',fontFamily:'monospace'}}/>
              <span style={{fontSize:13,color:'#64748b'}}>Ω</span>
            </div>
          </>
        )}
      </div>

      <div style={{minHeight:40,borderRadius:8,border:`0.5px solid ${ms.border}`,background:ms.bg,padding:'9px 15px',fontSize:12,color:ms.color,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:7,marginBottom:'1rem'}}>
        {msg.type==='ok'?'✅':msg.type==='err'?'❌':'ℹ️'} {msg.text}
      </div>

      <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
        <button onClick={skip} style={{padding:'7px 18px',borderRadius:8,border:'0.5px solid #e2e8f0',background:'#f8fafc',fontSize:12,cursor:'pointer',color:'#64748b'}}>→ Saltar</button>
        <button onClick={giveHint} style={{padding:'7px 18px',borderRadius:8,border:'0.5px solid #e2e8f0',background:'#f8fafc',fontSize:12,cursor:'pointer',color:'#64748b'}}>💡 Pista</button>
        <button onClick={checkAnswer} style={{padding:'7px 20px',borderRadius:8,border:'0.5px solid #93c5fd',background:'#eff6ff',fontSize:12,cursor:'pointer',color:'#1d4ed8',fontWeight:500}}>✓ Verificar</button>
      </div>
    </div>
  );
}
