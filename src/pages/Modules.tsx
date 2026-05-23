import { useState } from 'react';
import { useNavigate }  from 'react-router-dom';
import { DashboardNav } from '@/components/DashboardNav';
import { SiteFooter } from '@/components/SiteFooter';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { toast } from 'sonner';

type Lesson = { id: number; title: string; icon: string; done: boolean; xp: number };
type Module = {
  id: string;
  tier: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  colorDim: string;
  colorBorder: string;
  colorGlow: string;
  unlocked: boolean;
  currentLevel: number;
  totalLevels: number;
  xpReward: number;
  lessons: Lesson[];
};

const MODULES_DATA: Module[] = [
  {
    id: 'basico',
    tier: 'BÁSICO',
    title: 'Módulo de Aprendizaje Básico',
    subtitle: 'El punto de partida',
    icon: '⚡',
    color: '#22d3ee',
    colorDim: 'rgba(34,211,238,0.12)',
    colorBorder: 'rgba(34,211,238,0.35)',
    colorGlow: 'rgba(34,211,238,0.18)',
    unlocked: true,
    currentLevel: 0,
    totalLevels: 6,
    xpReward: 600,
    lessons: [
      { id: 1, title: 'nivel 1: ¿Qué es la electricidad?', icon: '⚡', done: false, xp: 50 },
      { id: 2, title: 'Voltaje y corriente', icon: '🔋', done: false, xp: 75 },
      { id: 3, title: 'La Ley de Ohm', icon: '📐', done: false, xp: 100 },
      { id: 4, title: 'Resistencias en serie', icon: '▬', done: false, xp: 100 },
      { id: 5, title: 'Resistencias en paralelo', icon: '🔗', done: false, xp: 125 },
      { id: 6, title: 'Circuito básico completo', icon: '🔬', done: false, xp: 150 },
    ],
  },
  {
    id: 'medio',
    tier: 'INTERMEDIO',
    title: 'Módulo de Aprendizaje Medio',
    subtitle: 'Lleva tus circuitos al siguiente nivel',
    icon: '💡',
    color: '#f59e0b',
    colorDim: 'rgba(245,158,11,0.1)',
    colorBorder: 'rgba(245,158,11,0.3)',
    colorGlow: 'rgba(245,158,11,0.15)',
    unlocked: false,
    currentLevel: 0,
    totalLevels: 6,
    xpReward: 1200,
    lessons: [
      { id: 1, title: 'Diodos y LEDs', icon: '💡', done: false, xp: 100 },
      { id: 2, title: 'Transistores NPN', icon: '🔌', done: false, xp: 125 },
      { id: 3, title: 'Amplificación de señal', icon: '📡', done: false, xp: 150 },
      { id: 4, title: 'Circuitos RC', icon: '⏱', done: false, xp: 175 },
      { id: 5, title: 'Filtros eléctricos', icon: '🎛', done: false, xp: 200 },
      { id: 6, title: 'Proyecto integrador', icon: '🏆', done: false, xp: 450 },
    ],
  },
  {
    id: 'avanzado',
    tier: 'AVANZADO',
    title: 'Módulo de Aprendizaje Avanzado',
    subtitle: 'El dominio del ingeniero',
    icon: '🛠️',
    color: '#a78bfa',
    colorDim: 'rgba(167,139,250,0.1)',
    colorBorder: 'rgba(167,139,250,0.3)',
    colorGlow: 'rgba(167,139,250,0.15)',
    unlocked: false,
    currentLevel: 0,
    totalLevels: 6,
    xpReward: 2400,
    lessons: [
      { id: 1, title: 'Lógica binaria', icon: '0️⃣', done: false, xp: 150 },
      { id: 2, title: 'Compuertas lógicas', icon: '🔣', done: false, xp: 200 },
      { id: 3, title: 'Circuitos combinacionales', icon: '🧩', done: false, xp: 250 },
      { id: 4, title: 'Flip-Flops y memorias', icon: '💾', done: false, xp: 300 },
      { id: 5, title: 'Microcontroladores', icon: '🤖', done: false, xp: 400 },
      { id: 6, title: 'Proyecto final SparkLab', icon: '🚀', done: false, xp: 1100 },
    ],
  },
];

function CircuitLines({ isLight }: { isLight: boolean }) {
  const stroke = isLight ? '#0ea5e9' : '#22d3ee';
  return (
    <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: isLight ? 0.08 : 0.055 }}>
      <defs>
        <pattern id="modgrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 40 H30 V10 H60" stroke={stroke} strokeWidth="1" fill="none" />
          <path d="M40 0 V30 H70 V60" stroke={stroke} strokeWidth="1" fill="none" />
          <circle cx="30" cy="40" r="2.5" fill={stroke} />
          <circle cx="40" cy="30" r="2.5" fill={stroke} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#modgrid)" />
    </svg>
  );
}

function ResistorSVG({ color = '#22d3ee', opacity = 0.18 }) {
  return (
    <svg width="70" height="22" viewBox="0 0 70 22" style={{ opacity }}>
      <line x1="0" y1="11" x2="12" y2="11" stroke={color} strokeWidth="1.5" />
      <rect x="12" y="4" width="46" height="14" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="58" y1="11" x2="70" y2="11" stroke={color} strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={20 + i * 10} y1="4" x2={20 + i * 10} y2="18" stroke={['#f59e0b', '#92400e', '#fbbf24', '#64748b'][i]} strokeWidth="2.5" />
      ))}
    </svg>
  );
}

function LEDSymbol({ color = '#22d3ee', opacity = 0.2, size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ opacity }}>
      <polygon points="6,4 26,16 6,28" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="26" y1="4" x2="26" y2="28" stroke={color} strokeWidth="1.5" />
      <line x1="0" y1="16" x2="6" y2="16" stroke={color} strokeWidth="1.5" />
      <line x1="26" y1="16" x2="32" y2="16" stroke={color} strokeWidth="1.5" />
      <line x1="28" y1="6" x2="31" y2="3" stroke={color} strokeWidth="1.2" />
      <line x1="28" y1="11" x2="32" y2="8" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

function BatterySymbol({ color = '#22d3ee', opacity = 0.18 }) {
  return (
    <svg width="50" height="24" viewBox="0 0 50 24" style={{ opacity }}>
      <line x1="0" y1="12" x2="10" y2="12" stroke={color} strokeWidth="1.5" />
      <line x1="10" y1="4" x2="10" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="18" y1="8" x2="18" y2="16" stroke={color} strokeWidth="1.5" />
      <line x1="26" y1="4" x2="26" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="34" y1="8" x2="34" y2="16" stroke={color} strokeWidth="1.5" />
      <line x1="42" y1="4" x2="42" y2="20" stroke={color} strokeWidth="2.5" />
      <line x1="42" y1="12" x2="50" y2="12" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function ProgressRing({ pct, color, size = 72, stroke = 5 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(127,127,127,0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

function ModuleCard({ mod, onOpen, isLight }: { mod: Module; onOpen: (m: Module) => void; isLight: boolean }) {
  const [hov, setHov] = useState(false);
  const pct = mod.totalLevels > 0 ? Math.round((mod.currentLevel / mod.totalLevels) * 100) : 0;
  const isLocked = !mod.unlocked;
  const isCompleted = mod.currentLevel === mod.totalLevels;

  const titleColor = isLight ? '#0f172a' : '#f1f5f9';
  const subColor = isLight ? '#64748b' : '#64748b';
  const innerPanel = isLight ? 'rgba(241,245,249,0.7)' : 'rgba(0,0,0,0.3)';
  const innerBorder = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.05)';
  const cardBase = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(10,20,40,0.75)';
  const cardLocked = isLight ? 'rgba(241,245,249,0.7)' : 'rgba(8,14,28,0.7)';
  const cardHov = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(15,30,50,0.9)';

  return (
    <div
      onMouseEnter={() => !isLocked && setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => !isLocked && onOpen(mod)}
      style={{
        background: isLocked ? cardLocked : hov ? cardHov : cardBase,
        border: isLocked
          ? `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.05)'}`
          : hov
            ? `1.5px solid ${mod.color}`
            : `1px solid ${mod.colorBorder}`,
        borderRadius: 22,
        padding: '32px 28px',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        transition: 'all 0.28s ease',
        transform: hov && !isLocked ? 'translateY(-5px)' : 'none',
        boxShadow: hov && !isLocked ? `0 16px 48px ${mod.colorGlow}` : 'none',
        opacity: isLocked ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
        minWidth: 240,
      }}
    >
      {!isLocked && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${mod.color}, transparent)`,
            opacity: hov ? 1 : 0.5,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      <div style={{ position: 'absolute', top: 20, right: 20, opacity: isLocked ? 0.06 : 0.18 }}>
        {mod.id === 'basico' && <ResistorSVG color={mod.color} opacity={1} />}
        {mod.id === 'medio' && <LEDSymbol color={mod.color} opacity={1} size={40} />}
        {mod.id === 'avanzado' && <BatterySymbol color={mod.color} opacity={1} />}
      </div>

      {isLocked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 22,
            background: isLight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(2px)',
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 11, color: isLight ? '#334155' : '#475569', fontFamily: "'Courier New',monospace", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Completa el módulo anterior
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 12px',
            borderRadius: 20,
            background: mod.colorDim,
            border: `1px solid ${mod.colorBorder}`,
            fontSize: 9,
            fontWeight: 700,
            color: mod.color,
            fontFamily: "'Courier New',monospace",
            letterSpacing: '0.15em',
          }}
        >
          <span>{mod.icon}</span> {mod.tier}
        </div>
        {isCompleted && (
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#34d399',
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.3)',
              padding: '3px 10px',
              borderRadius: 20,
              fontFamily: "'Courier New',monospace",
              letterSpacing: '0.1em',
            }}
          >
            ✓ COMPLETADO
          </div>
        )}
      </div>

      <h3 style={{ fontSize: 22, fontWeight: 900, color: titleColor, marginBottom: 6, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{mod.title}</h3>
      <p style={{ fontSize: 12, color: subColor, marginBottom: 24, lineHeight: 1.5 }}>{mod.subtitle}</p>

      {!isLocked && (
        <div style={{ background: innerPanel, borderRadius: 14, padding: '16px 18px', marginBottom: 20, border: `1px solid ${innerBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <ProgressRing pct={pct} color={mod.color} size={68} stroke={5} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: mod.color, fontFamily: "'Courier New',monospace" }}>{mod.currentLevel}</span>
                <span style={{ fontSize: 8, color: subColor }}>/{mod.totalLevels}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: isLight ? '#475569' : '#94a3b8', fontWeight: 700, marginBottom: 4 }}>
                Nivel actual: <span style={{ color: mod.color }}>{mod.currentLevel === 0 ? 'Sin iniciar' : `Nivel ${mod.currentLevel}`}</span>
              </div>
              <div style={{ height: 5, background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${mod.color}99, ${mod.color})`, borderRadius: 99, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: subColor }}>{pct}% completado</div>
            </div>
          </div>
        </div>
      )}

      {isLocked && (
        <div style={{ background: innerPanel, borderRadius: 14, padding: '16px 18px', marginBottom: 20, border: `1px solid ${innerBorder}`, minHeight: 88 }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: subColor }}>
          <span>📚</span>
          <span>{mod.totalLevels} lecciones</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#f59e0b', fontFamily: "'Courier New',monospace" }}>+{mod.xpReward.toLocaleString()} XP</div>
      </div>
    </div>
  );
}

function LessonsDrawer({ mod, onClose, isLight }: { mod: Module | null; onClose: () => void; isLight: boolean }) {
  const navigate = useNavigate();
  if (!mod) return null;
  const completedCount = mod.lessons.filter((l) => l.done).length;
  const panelBg = isLight ? 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)' : 'linear-gradient(180deg,#0a1628 0%,#060e1d 100%)';
  const headerBg = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(6,14,29,0.95)';
  const titleColor = isLight ? '#0f172a' : '#f1f5f9';
  const subColor = isLight ? '#64748b' : '#64748b';
  const dividerColor = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)';

  const handleLessonClick = (lesson: Lesson, isLocked: boolean) => {
    if (isLocked) return;
    if (mod.id === 'basico' && lesson.id === 1) {
      navigate('/dashboard/level1');
    } else {
      toast('Próximamente', { description: 'Este nivel aún no está disponible.' });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: isLight ? 'rgba(15,23,42,0.45)' : 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(440px, 100%)',
          height: '100%',
          background: panelBg,
          borderLeft: `1.5px solid ${mod.colorBorder}`,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease',
          boxShadow: `-20px 0 60px ${mod.colorGlow}`,
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '28px 24px 20px', borderBottom: `1px solid ${dividerColor}`, position: 'sticky', top: 0, background: headerBg, backdropFilter: 'blur(10px)', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  marginBottom: 8,
                  padding: '2px 10px',
                  borderRadius: 20,
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'Courier New',monospace",
                  letterSpacing: '0.15em',
                  background: mod.colorDim,
                  border: `1px solid ${mod.colorBorder}`,
                  color: mod.color,
                }}
              >
                {mod.icon} {mod.tier}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: titleColor, letterSpacing: '-0.01em' }}>{mod.title}</h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: subColor,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: subColor }}>Progreso del módulo</span>
                <span style={{ fontSize: 10, color: mod.color, fontWeight: 700 }}>
                  {completedCount}/{mod.totalLevels} lecciones
                </span>
              </div>
              <div style={{ height: 5, background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((completedCount / mod.totalLevels) * 100)}%`, background: `linear-gradient(90deg,${mod.color}99,${mod.color})`, borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#f59e0b', fontFamily: "'Courier New',monospace" }}>+{mod.xpReward.toLocaleString()} XP</div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, color: subColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Lecciones</div>

          {mod.lessons.map((lesson, i) => {
            const prevDone = i === 0 || mod.lessons[i - 1].done;
            const isAvailable = prevDone && !lesson.done;
            const isLockedLesson = !prevDone && !lesson.done;

            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson, isLockedLesson)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: lesson.done
                    ? mod.colorDim
                    : isAvailable
                      ? isLight
                        ? 'rgba(15,23,42,0.04)'
                        : 'rgba(255,255,255,0.04)'
                      : isLight
                        ? 'rgba(15,23,42,0.02)'
                        : 'rgba(0,0,0,0.2)',
                  border: lesson.done
                    ? `1px solid ${mod.colorBorder}`
                    : isAvailable
                      ? `1px solid ${isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.1)'}`
                      : `1px solid ${isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  opacity: isLockedLesson ? 0.5 : 1,
                  cursor: isLockedLesson ? 'not-allowed' : 'pointer',
                  transition: 'all 0.18s',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: lesson.done ? mod.color : isAvailable ? (isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)') : 'rgba(0,0,0,0.15)',
                    border: lesson.done ? 'none' : `1px solid ${isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: lesson.done ? 14 : 12,
                    color: lesson.done ? '#000' : subColor,
                    fontWeight: 900,
                    fontFamily: "'Courier New',monospace",
                  }}
                >
                  {lesson.done ? '✓' : isLockedLesson ? '🔒' : lesson.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: lesson.done ? titleColor : isAvailable ? (isLight ? '#1e293b' : '#cbd5e1') : subColor,
                      marginBottom: 3,
                    }}
                  >
                    {lesson.title}
                  </div>
                  <div style={{ fontSize: 10, color: lesson.done ? mod.color : subColor }}>{lesson.done ? '✓ Completado' : isAvailable ? '📖 Disponible' : '🔒 Bloqueado'}</div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 900, color: lesson.done ? mod.color : subColor, fontFamily: "'Courier New',monospace" }}>+{lesson.xp}</div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '16px 24px 32px', marginTop: 'auto' }}>
          <button
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 12,
              background: `linear-gradient(135deg,${mod.colorDim},${mod.colorDim})`,
              color: mod.color,
              border: `1.5px solid ${mod.colorBorder}`,
              fontWeight: 900,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'Courier New',monospace",
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            {mod.currentLevel === 0 ? `${mod.icon} Comenzar módulo` : `${mod.icon} Continuar en nivel ${mod.currentLevel + 1}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Modules() {
  const [openMod, setOpenMod] = useState<Module | null>(null);
  const { themeMode } = useAccessibility();
  const isLight = themeMode === 'light';
  const totalXP = 125;
  const userLevel = 2;

  const pageBg = isLight
    ? 'radial-gradient(ellipse at 30% 10%, #f1f5f9 0%, #ffffff 45%, #f8fafc 100%)'
    : 'radial-gradient(ellipse at 30% 10%, #0b1f3a 0%, #060e1d 45%, #06030f 100%)';
  const baseText = isLight ? '#0f172a' : '#e2e8f0';
  const mutedText = isLight ? '#64748b' : '#475569';
  const bannerBg = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(8,14,28,0.6)';
  const bannerBorder = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg, color: baseText, fontFamily: "'Courier New',monospace" }}>
      <DashboardNav />

      <main className="flex-1 relative" style={{ overflowX: 'hidden' }}>
        <CircuitLines isLight={isLight} />

        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {[
            { top: '8%', left: '5%', color: '#22d3ee', size: 18 },
            { top: '20%', right: '4%', color: '#f59e0b', size: 14 },
            { top: '55%', left: '3%', color: '#a78bfa', size: 16 },
            { top: '75%', right: '6%', color: '#22d3ee', size: 12 },
            { top: '40%', right: '2%', color: '#34d399', size: 10 },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                ...p,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: p.color,
                opacity: 0.12,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                animation: `mod-glow${i % 3} ${3 + i}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 80px', position: 'relative', zIndex: 1 }}>
          {/* PAGE HEADER */}
          <div style={{ paddingTop: 52, paddingBottom: 44, textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 20,
                padding: '6px 18px',
                borderRadius: 30,
                background: 'rgba(34,211,238,0.06)',
                border: '1px solid rgba(34,211,238,0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: 'rgba(34,211,238,0.15)',
                    border: '1px solid rgba(34,211,238,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                  }}
                >
                  ⚡
                </div>
                <span style={{ fontSize: 11, color: '#0891b2', fontWeight: 700 }}>Nivel {userLevel}</span>
              </div>
              <div style={{ width: 1, height: 14, background: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 11, color: mutedText }}>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{totalXP} XP</span> acumulados
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(30px,5.5vw,52px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 14, letterSpacing: '-0.02em' }}>
              <span
                style={{
                  background: isLight
                    ? 'linear-gradient(135deg,#0f172a 0%,#1e293b 40%,#0891b2 100%)'
                    : 'linear-gradient(135deg,#fff 0%,#e2e8f0 40%,#22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ruta de
              </span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg,#a78bfa 0%,#8b5cf6 50%,#22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Aprendizaje
              </span>
            </h1>
            <p style={{ fontSize: 14, color: mutedText, maxWidth: 400, margin: '0 auto', lineHeight: 1.75 }}>
              Domina la electrónica módulo a módulo. Completa cada etapa para desbloquear la siguiente.
            </p>
          </div>

          {/* PATH CONNECTOR */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{ position: 'absolute', top: '50%', left: 'calc(33% + 20px)', right: 'calc(33% + 20px)', height: 2, zIndex: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg,rgba(34,211,238,0.4),rgba(245,158,11,0.2))' }} />
              <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg,rgba(245,158,11,0.2),rgba(167,139,250,0.15))' }} />
            </div>
          </div>

          {/* MODULES */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', position: 'relative', zIndex: 1, marginBottom: 32 }}>
            {MODULES_DATA.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} onOpen={setOpenMod} isLight={isLight} />
            ))}
          </div>

          {/* INFO BANNER */}
          <div style={{ background: bannerBg, border: `1px solid ${bannerBorder}`, borderRadius: 16, padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 20 }}>💡</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: isLight ? '#334155' : '#94a3b8', marginBottom: 3 }}>¿Cómo avanzar?</div>
              <div style={{ fontSize: 11, color: mutedText, lineHeight: 1.6 }}>
                Completa todas las lecciones de un módulo para desbloquear el siguiente. Cada lección desbloquea la siguiente dentro del módulo.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { icon: '🟢', label: 'Completado', color: '#34d399' },
                { icon: '🔵', label: 'En progreso', color: '#0891b2' },
                { icon: '🔒', label: 'Bloqueado', color: mutedText },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: s.color }}>
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 32, opacity: 0.18 }}>
            <ResistorSVG color="#22d3ee" opacity={1} />
            <LEDSymbol color="#f59e0b" opacity={1} size={24} />
            <BatterySymbol color="#a78bfa" opacity={1} />
            <LEDSymbol color="#34d399" opacity={1} size={24} />
            <ResistorSVG color="#22d3ee" opacity={1} />
          </div>
        </div>

        {openMod && <LessonsDrawer mod={openMod} onClose={() => setOpenMod(null)} isLight={isLight} />}

        <style>{`
          @keyframes mod-glow0{0%,100%{opacity:.12}50%{opacity:.22}}
          @keyframes mod-glow1{0%,100%{opacity:.1}50%{opacity:.2}}
          @keyframes mod-glow2{0%,100%{opacity:.08}50%{opacity:.18}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        `}</style>
      </main>

      <SiteFooter />
    </div>
  );
}
