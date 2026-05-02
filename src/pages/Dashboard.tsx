import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNav } from '@/components/DashboardNav';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';

/* ── Robot pixel art ── */
function RobotPixel() {
  return (
    <svg width="80" height="96" viewBox="0 0 80 96" style={{ imageRendering: 'pixelated' }} aria-hidden="true">
      <rect x="36" y="0" width="8" height="4" fill="#22d3ee" />
      <rect x="34" y="4" width="12" height="4" fill="#22d3ee" />
      <rect x="16" y="8" width="48" height="36" fill="#1e3a5f" />
      <rect x="12" y="12" width="56" height="28" fill="#1e3a5f" />
      <rect x="22" y="18" width="12" height="12" fill="#22d3ee" />
      <rect x="46" y="18" width="12" height="12" fill="#22d3ee" />
      <rect x="26" y="22" width="4" height="4" fill="#fff" />
      <rect x="50" y="22" width="4" height="4" fill="#fff" />
      <rect x="24" y="34" width="32" height="4" fill="#22d3ee" />
      <rect x="28" y="34" width="4" height="4" fill="#0f172a" />
      <rect x="36" y="34" width="4" height="4" fill="#0f172a" />
      <rect x="44" y="34" width="4" height="4" fill="#0f172a" />
      <rect x="32" y="44" width="16" height="8" fill="#1e3a5f" />
      <rect x="8" y="52" width="64" height="32" fill="#1e3a5f" />
      <rect x="20" y="58" width="40" height="20" fill="#0f2d4a" />
      <rect x="24" y="62" width="8" height="8" fill="#22d3ee" opacity="0.85" />
      <rect x="36" y="62" width="8" height="8" fill="#f59e0b" opacity="0.85" />
      <rect x="48" y="62" width="8" height="8" fill="#ef4444" opacity="0.85" />
      <rect x="0" y="52" width="8" height="24" fill="#1e3a5f" />
      <rect x="72" y="52" width="8" height="24" fill="#1e3a5f" />
      <rect x="16" y="84" width="16" height="12" fill="#1e3a5f" />
      <rect x="48" y="84" width="16" height="12" fill="#1e3a5f" />
    </svg>
  );
}

/* ── Fondo de circuitos ── */
function CircuitBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.07, zIndex: 0 }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="ckt-dash" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M10 60 H50 V20 H90" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
            <path d="M60 10 V50 H100 V90" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
            <path d="M10 90 H40 V110" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="60" r="3" fill="#22d3ee" />
            <circle cx="60" cy="50" r="3" fill="#22d3ee" />
            <circle cx="90" cy="20" r="3" fill="#22d3ee" />
            <rect x="38" y="16" width="14" height="8" rx="1" stroke="#22d3ee" strokeWidth="1" fill="none" />
            <rect x="96" y="46" width="8" height="14" rx="1" stroke="#22d3ee" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ckt-dash)" />
      </svg>
    </div>
  );
}

/* ── Tarjeta de modo ── */
type ModeCardProps = {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
  badge?: string;
  href: string;
};
function ModeCard({ icon, title, desc, tag, tagColor, badge, href }: ModeCardProps) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 14, position: 'relative',
        background: hov ? 'rgba(30,58,95,0.7)' : 'rgba(15,30,50,0.55)',
        border: `1.5px solid ${hov ? tagColor : 'rgba(34,211,238,0.12)'}`,
        borderRadius: 16, padding: '28px 24px', textDecoration: 'none',
        transition: 'all 0.22s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 12px 36px ${tagColor}22` : 'none',
      }}
    >
      {badge && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
          background: 'rgba(52,211,153,0.15)', color: '#34d399',
          border: '1px solid rgba(52,211,153,0.35)',
          fontFamily: "'Courier New',monospace", letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>{badge}</div>
      )}
      <div style={{ fontSize: 36 }}>{icon}</div>
      <div style={{ fontFamily: "'Courier New',monospace", fontWeight: 900, color: '#f1f5f9', fontSize: 16 }}>{title}</div>
      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, flex: 1 }}>{desc}</div>
      <div style={{
        alignSelf: 'flex-start', fontSize: 9, fontWeight: 700,
        padding: '3px 10px', borderRadius: 20,
        background: `${tagColor}18`, color: tagColor,
        border: `1px solid ${tagColor}40`,
        fontFamily: "'Courier New',monospace", letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>{tag}</div>
    </Link>
  );
}

/* ── Tarjeta de componente del lab ── */
function CompCard({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      background: 'rgba(15,30,50,0.6)', border: '1px solid rgba(34,211,238,0.12)',
      borderRadius: 14, padding: '18px 20px', minWidth: 80,
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'Courier New',monospace" }}>{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profileCheckedRef = useRef(false);
  const [displayName, setDisplayName] = useState<string>(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Explorer'
  );

  const [msgIndex, setMsgIndex] = useState(0);
  const [displayText, setDisplay] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const messages = [
    `¡Bienvenido de nuevo, ${displayName}! ⚡ ¿Listo para practicar hoy?`,
    'Tip: Una resistencia protege el LED de quemarse. ¡Úsala siempre!',
    'Reto del día: Construye un circuito que encienda 2 LEDs. 💡',
    '¿Sabías que la corriente fluye del + al −? ¡Compruébalo en el lab!',
  ];

  useEffect(() => {
    if (!user || profileCheckedRef.current) return;
    profileCheckedRef.current = true;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, language, gender, country')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) return;
      if (data?.username) setDisplayName(data.username);
      const missing = !data || !data.username || !data.language || !data.gender || !data.country;
      if (missing) {
        toast.warning(t('dashboard.profileIncompleteTitle'), {
          description: t('dashboard.profileIncompleteDesc'),
          duration: 8000,
          action: {
            label: t('dashboard.completeProfile'),
            onClick: () => navigate('/dashboard/profile'),
          },
        });
      }
    })();
  }, [user, t, navigate]);

  useEffect(() => {
    const msg = messages[msgIndex];
    if (charIndex < msg.length) {
      const tm = setTimeout(() => {
        setDisplay((p) => p + msg[charIndex]);
        setCharIndex((p) => p + 1);
      }, 30);
      return () => clearTimeout(tm);
    } else {
      const tm = setTimeout(() => {
        setDisplay('');
        setCharIndex(0);
        setMsgIndex((p) => (p + 1) % messages.length);
      }, 3000);
      return () => clearTimeout(tm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charIndex, msgIndex, displayName]);

  const modes: ModeCardProps[] = [
    {
      icon: '📖',
      title: 'Módulos de Teoría',
      desc: 'Aprende los fundamentos: voltaje, corriente, resistencia y la Ley de Ohm. Lecciones cortas con ejemplos visuales y quizzes al final de cada tema.',
      tag: 'Teoría · 6 módulos',
      tagColor: '#a78bfa',
      href: '/dashboard',
    },
    {
      icon: '🎯',
      title: 'Retos Guiados',
      desc: 'Desafíos paso a paso con instrucciones claras. Arma circuitos específicos y recibe feedback inmediato sobre si funcionan correctamente.',
      tag: 'Práctica · 30+ retos',
      tagColor: '#f59e0b',
      href: '/dashboard',
    },
    {
      icon: '🏆',
      title: 'Ranking de la Clase',
      desc: 'Compite con tus compañeros. Gana XP resolviendo retos, sube de nivel y escala posiciones en el ranking global de SparkLab.',
      tag: 'Competitivo',
      tagColor: '#34d399',
      href: '/dashboard/leaderboard',
    },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/yquinteropa/sparklab-dev', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg,#060e1d 0%,#091624 60%,#060e1d 100%)', color: '#e2e8f0', fontFamily: "'Courier New',monospace" }}>
      <DashboardNav />

      <main className="flex-1 relative">
        <CircuitBackground />
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 20px 80px', position: 'relative', zIndex: 1 }}>
          {/* HERO */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 64, paddingBottom: 80 }}>
            <div style={{ marginBottom: 28, filter: 'drop-shadow(0 0 28px rgba(34,211,238,0.4))', animation: 'dash-float 3.2s ease-in-out infinite' }}>
              <RobotPixel />
            </div>

            <div style={{
              background: 'rgba(15,30,50,0.85)',
              border: '1.5px solid rgba(34,211,238,0.22)',
              borderRadius: 12, padding: '14px 24px',
              maxWidth: 540, fontSize: 13, color: '#94a3b8',
              lineHeight: 1.6, marginBottom: 40,
              backdropFilter: 'blur(8px)', minHeight: 50,
            }}>
              <span style={{ color: '#22d3ee' }}>{'> '}</span>
              {displayText}
              <span style={{ animation: 'dash-blink 1s step-end infinite', color: '#22d3ee' }}>█</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(30px,6vw,56px)', fontWeight: 900,
              letterSpacing: '0.03em', marginBottom: 14, lineHeight: 1.1,
              background: 'linear-gradient(135deg,#ffffff 0%,#22d3ee 55%,#0ea5e9 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ¡Bienvenido a SparkLab, {displayName}!
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', maxWidth: 440, lineHeight: 1.75, marginBottom: 36 }}>
              Aprende electrónica construyendo circuitos reales en un laboratorio virtual gamificado. Desde cero hasta experto.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/dashboard/simulator"
                style={{
                  padding: '12px 30px', borderRadius: 10,
                  background: 'rgba(34,211,238,0.12)', color: '#22d3ee',
                  border: '1.5px solid rgba(34,211,238,0.4)', fontWeight: 700,
                  fontSize: 12, textDecoration: 'none', letterSpacing: '0.12em',
                  textTransform: 'uppercase', transition: 'all 0.2s',
                }}
              >⚡ Ir al Laboratorio</Link>
              <a href="#modos"
                style={{
                  padding: '12px 30px', borderRadius: 10,
                  background: 'transparent', color: '#64748b',
                  border: '1.5px solid rgba(255,255,255,0.1)', fontWeight: 700,
                  fontSize: 12, textDecoration: 'none', letterSpacing: '0.12em',
                  textTransform: 'uppercase', transition: 'all 0.2s',
                }}
              >Ver modos</a>
            </div>
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.18),transparent)', marginBottom: 72 }} />

          {/* MODOS */}
          <div id="modos" style={{ marginBottom: 80 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{
                display: 'inline-block', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: '#22d3ee', marginBottom: 12,
                padding: '3px 14px', border: '1px solid rgba(34,211,238,0.25)', borderRadius: 20,
              }}>Modos de juego</div>
              <h2 style={{ fontSize: 'clamp(20px,4vw,32px)', fontWeight: 900, color: '#f1f5f9', marginBottom: 10 }}>
                Elige cómo aprender hoy
              </h2>
              <p style={{ fontSize: 13, color: '#475569', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
                Tres caminos distintos según tu estilo. Teoría, práctica guiada o competencia con tus compañeros.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              {modes.map((m, i) => <ModeCard key={i} {...m} />)}
            </div>

            <div style={{
              marginTop: 32, background: 'rgba(15,30,50,0.55)',
              border: '1px solid rgba(34,211,238,0.1)', borderRadius: 14, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>Tu progreso general</span>
                  <span style={{ fontSize: 11, color: '#22d3ee', fontWeight: 900 }}>0 / 6 módulos</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg,#22d3ee,#0ea5e9)', borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[{ v: '0', l: 'XP', i: '⭐' }, { v: '0', l: 'Retos', i: '🎯' }, { v: 'Bronce', l: 'Rango', i: '🏅' }].map((s) => (
                  <div key={s.l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, marginBottom: 3 }}>{s.i}</div>
                    <div style={{ fontWeight: 900, color: '#22d3ee', fontSize: 15 }}>{s.v}</div>
                    <div style={{ fontSize: 9, color: '#475569' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(52,211,153,0.18),transparent)', marginBottom: 72 }} />

          {/* LABORATORIO */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#34d399', padding: '3px 14px',
                border: '1px solid rgba(52,211,153,0.25)', borderRadius: 20,
              }}>Laboratorio Virtual</div>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#f59e0b', padding: '3px 10px',
                border: '1px solid rgba(245,158,11,0.35)', borderRadius: 20,
                background: 'rgba(245,158,11,0.08)',
              }}>BETA</div>
            </div>

            <h2 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.2 }}>
              Arma circuitos reales<br />
              <span style={{ color: '#22d3ee' }}>en tiempo real</span>
            </h2>

            <p style={{ fontSize: 13, color: '#475569', maxWidth: 480, lineHeight: 1.8 }}>
              Coloca componentes sobre una protoboard virtual 2D. Conecta baterías, resistencias y LEDs — el simulador detecta al instante si tu circuito funciona o tiene errores.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', margin: '8px 0 4px' }}>
              <CompCard icon="🔋" label="Batería" />
              <CompCard icon="▬" label="Resistencia" />
              <CompCard icon="💡" label="LED" />
              <CompCard icon="〰️" label="Cables" />
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', margin: '4px 0 12px' }}>
              {[
                '✅ Detección de circuito cerrado',
                '⚠️ Alerta de cortocircuito',
                '💡 LEDs que se encienden',
                '🗑️ Edición en tiempo real',
              ].map((f) => (
                <span key={f} style={{ fontSize: 11, color: '#475569' }}>{f}</span>
              ))}
            </div>

            <Link to="/dashboard/simulator"
              style={{
                padding: '15px 48px', borderRadius: 12,
                background: 'linear-gradient(135deg,rgba(34,211,238,0.16),rgba(14,165,233,0.1))',
                color: '#22d3ee', border: '1.5px solid rgba(34,211,238,0.45)',
                fontWeight: 900, fontSize: 13, textDecoration: 'none',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                transition: 'all 0.22s', display: 'inline-block',
              }}
            >
              🔬 Abrir Laboratorio
            </Link>

            <p style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
              Versión beta · Más componentes y funciones próximamente
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t" style={{ background: '#0a1122', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6" style={{ color: '#22d3ee' }} />
                <span className="text-xl font-bold" style={{ color: '#22d3ee' }}>SparkLab</span>
              </div>
              <p className="text-sm text-center md:text-left max-w-xs" style={{ color: '#94a3b8' }}>
                Aprende electrónica de forma interactiva y divertida.
              </p>
            </div>

            <nav className="flex flex-wrap justify-center gap-6">
              {[
                { name: t('nav.levels'), href: '/dashboard' },
                { name: t('nav.ranking'), href: '/dashboard/leaderboard' },
                { name: t('nav.information'), href: '/' },
              ].map((link) => (
                <Link key={link.name} to={link.href} className="text-sm transition-colors duration-300" style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#22d3ee')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.3)', color: '#94a3b8' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#22d3ee'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(100,116,139,0.3)'; }}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="my-8" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ color: '#64748b' }}>
            <p>&copy; {new Date().getFullYear()} SparkLab. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="transition-colors duration-300" style={{ color: '#64748b' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#22d3ee')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
                Política de privacidad
              </a>
              <a href="#" className="transition-colors duration-300" style={{ color: '#64748b' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#22d3ee')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
                Términos de uso
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes dash-float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-9px); } }
        @keyframes dash-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
