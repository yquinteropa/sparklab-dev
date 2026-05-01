import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  Zap,
  FlaskConical,
  Trophy,
  BookOpen,
  Users,
  Atom,
  Wind,
  Database,
  FileCode,
  Flame,
  Triangle,
  Github,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/* ───────────────────── Decorative SVGs ───────────────────── */

function LightningBolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function Nut({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

function Screw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      <line x1="12" y1="10" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="9" y1="19" x2="15" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function MiniRobot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="16" cy="2" r="1.5" fill="currentColor" opacity="0.6" />
      <rect x="8" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.7" />
      <line x1="12" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <rect x="10" y="18" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      <line x1="10" y1="22" x2="6" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="22" y1="22" x2="26" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <rect x="14" y="21" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

/* ───────────────────── Scroll reveal ───────────────────── */

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ───────────────────── Tech stack ───────────────────── */

const techStack = [
  { icon: Atom, name: "React", color: "text-sky-400" },
  { icon: Wind, name: "Tailwind CSS", color: "text-cyan-400" },
  { icon: Database, name: "Supabase", color: "text-emerald-400" },
  { icon: FileCode, name: "TypeScript", color: "text-blue-400" },
  { icon: Flame, name: "Vite", color: "text-amber-400" },
  { icon: Triangle, name: "Vercel", color: "text-foreground" },
];

/* ───────────────────── Page ───────────────────── */

export default function Index() {
  const { t } = useTranslation();
  const featuresRef = useScrollReveal();
  const techRef = useScrollReveal();
  const ctaRef = useScrollReveal();
  const footerRef = useScrollReveal();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (!href?.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    const NAVBAR_OFFSET = 80; // h-20
    const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const features = [
    { icon: FlaskConical, title: t("index.virtualLab"), desc: t("index.virtualLabDesc") },
    { icon: Trophy, title: t("index.gamification"), desc: t("index.gamificationDesc") },
    { icon: BookOpen, title: t("index.guidedMissions"), desc: t("index.guidedMissionsDesc") },
    { icon: Users, title: t("index.globalLeaderboard"), desc: t("index.globalLeaderboardDesc") },
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/yquinteropa/sparklab-dev", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--simulator-bg))] text-foreground overflow-x-hidden">
      {/* ───────────── Header ───────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-20 backdrop-blur-md"
        style={{
          background: "hsl(var(--simulator-bg) / 0.92)",
          borderBottom: "1px solid hsl(var(--primary) / 0.18)",
        }}
      >
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-primary/10 border border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.25)]">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold tracking-[0.22em] uppercase text-primary" style={{ fontFamily: "var(--font-display)" }}>
            SparkLab
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: t("nav.levels"), href: "/dashboard", isAnchor: false },
            { label: t("nav.ranking"), href: "/dashboard/leaderboard", isAnchor: false },
            { label: t("nav.information"), href: "#features", isAnchor: true },
          ].map((link) =>
            link.isAnchor ? (
              <a
                key={link.label}
                href={link.href}
                onClick={handleAnchorClick}
                className="relative px-4 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground hover:text-primary transition-colors duration-200 rounded-lg group"
              >
                {link.label}
                <span className="absolute bottom-0.5 left-3 right-3 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-transparent via-primary to-transparent" />
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="relative px-4 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground hover:text-primary transition-colors duration-200 rounded-lg group"
              >
                {link.label}
                <span className="absolute bottom-0.5 left-3 right-3 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-transparent via-primary to-transparent" />
              </Link>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/auth?mode=signup"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30 transition-all duration-200"
          >
            {t("nav.register")}
          </Link>
          <Link
            to="/auth"
            className="px-4 py-1.5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase text-primary border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:shadow-[0_0_12px_hsl(var(--primary)/0.35)] transition-all duration-200"
          >
            {t("nav.enter")}
          </Link>
        </div>
      </header>

      {/* ───────────── Hero / Banner ───────────── */}
      <section className="relative min-h-[calc(100vh-5rem)] mt-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--simulator-bg))] via-[hsl(220_50%_18%)] to-[hsl(var(--simulator-bg))]" />

        {/* Lightning bolts */}
        <LightningBolt className="absolute top-20 left-8 w-6 h-6 text-primary animate-pulse" />
        <LightningBolt className="absolute top-40 left-16 w-8 h-8 text-primary/80 animate-pulse [animation-delay:300ms]" />
        <LightningBolt className="absolute bottom-32 left-12 w-5 h-5 text-primary animate-pulse [animation-delay:500ms]" />
        <LightningBolt className="absolute top-60 left-4 w-4 h-4 text-primary/70 animate-pulse [animation-delay:700ms]" />
        <LightningBolt className="absolute top-24 right-10 w-7 h-7 text-primary animate-pulse [animation-delay:200ms]" />
        <LightningBolt className="absolute top-52 right-20 w-5 h-5 text-primary/80 animate-pulse [animation-delay:400ms]" />
        <LightningBolt className="absolute bottom-40 right-8 w-6 h-6 text-primary animate-pulse [animation-delay:600ms]" />

        {/* Nuts & screws */}
        <Nut className="absolute top-32 left-24 w-8 h-8 text-primary/60 animate-spin-slow" />
        <Screw className="absolute bottom-48 left-20 w-6 h-6 text-primary/50 animate-bounce-slow" />
        <Nut className="absolute top-72 left-6 w-5 h-5 text-primary/40 animate-spin-slow [animation-delay:500ms]" />
        <Screw className="absolute top-36 right-24 w-7 h-7 text-primary/50 animate-bounce-slow [animation-delay:300ms]" />
        <Nut className="absolute bottom-52 right-16 w-6 h-6 text-primary/60 animate-spin-slow [animation-delay:200ms]" />
        <Screw className="absolute top-64 right-6 w-5 h-5 text-primary/40 animate-bounce-slow [animation-delay:700ms]" />

        {/* Mini robots */}
        <MiniRobot className="absolute top-16 left-[15%] w-10 h-10 text-primary animate-float" />
        <MiniRobot className="absolute bottom-24 left-[10%] w-8 h-8 text-primary/80 animate-float [animation-delay:500ms]" />
        <MiniRobot className="absolute top-28 right-[12%] w-9 h-9 text-primary animate-float [animation-delay:300ms]" />
        <MiniRobot className="absolute bottom-36 right-[18%] w-7 h-7 text-primary/70 animate-float [animation-delay:700ms]" />
        <MiniRobot className="absolute top-1/2 left-[5%] w-6 h-6 text-primary/70 animate-float [animation-delay:200ms]" />
        <MiniRobot className="absolute top-1/3 right-[8%] w-8 h-8 text-primary/80 animate-float [animation-delay:600ms]" />

        {/* Circuit lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-px h-32 bg-primary" />
          <div className="absolute top-1/3 left-1/4 w-24 h-px bg-primary" />
          <div className="absolute bottom-1/4 right-1/4 w-px h-24 bg-primary" />
          <div className="absolute bottom-1/3 right-1/4 w-32 h-px bg-primary" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm font-medium">{t("index.badge")}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-foreground">{t("index.heroTitle1")} </span>
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary/80 bg-clip-text text-transparent">
              {t("index.heroTitle2")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("index.heroDesc")}
          </p>

          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-primary-foreground font-semibold px-8 py-4 text-lg rounded-full shadow-[0_0_25px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_35px_hsl(var(--primary)/0.5)] hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            {t("index.startNow")}
          </Link>
        </div>

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      </section>

      {/* ───────────── Features ───────────── */}
      <section
        id="features"
        className="relative py-24 px-4 overflow-hidden bg-[hsl(var(--simulator-bg))] scroll-mt-20"
        ref={featuresRef}
      >
        <Nut className="absolute top-12 left-8 w-10 h-10 text-primary/40 animate-spin-slow" />
        <Nut className="absolute bottom-16 left-16 w-8 h-8 text-primary/30 animate-spin-slow [animation-delay:300ms]" />
        <Nut className="absolute top-1/2 left-6 w-6 h-6 text-primary/20 animate-spin-slow [animation-delay:500ms]" />
        <Nut className="absolute top-16 right-12 w-9 h-9 text-primary/40 animate-spin-slow [animation-delay:200ms]" />
        <Nut className="absolute bottom-12 right-8 w-7 h-7 text-primary/30 animate-spin-slow [animation-delay:400ms]" />
        <Nut className="absolute top-1/3 right-6 w-6 h-6 text-primary/20 animate-spin-slow [animation-delay:600ms]" />

        <h2
          className="text-3xl md:text-4xl font-bold text-center text-primary mb-16"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("index.featuresTitle")}
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm hover:border-primary/70 hover:shadow-[0_0_24px_hsl(var(--primary)/0.18)] transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary border border-border/60 flex items-center justify-center mb-4 group-hover:border-primary/50 transition-all duration-300">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-foreground font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Technologies ───────────── */}
      <section id="tech" className="scroll-mt-20" ref={techRef}>
        <div className="h-1 bg-primary" />
        <div className="relative bg-[hsl(var(--simulator-bg))] py-24 px-4 overflow-hidden">
          <Nut className="absolute top-12 left-8 w-10 h-10 text-primary/40 animate-spin-slow" />
          <Nut className="absolute bottom-16 left-16 w-8 h-8 text-primary/30 animate-spin-slow [animation-delay:300ms]" />
          <Nut className="absolute top-1/2 left-6 w-6 h-6 text-primary/20 animate-spin-slow [animation-delay:500ms]" />
          <Nut className="absolute top-16 right-12 w-9 h-9 text-primary/40 animate-spin-slow [animation-delay:200ms]" />
          <Nut className="absolute bottom-12 right-8 w-7 h-7 text-primary/30 animate-spin-slow [animation-delay:400ms]" />
          <Nut className="absolute top-1/3 right-6 w-6 h-6 text-primary/20 animate-spin-slow [animation-delay:600ms]" />

          <h2
            className="text-center text-primary text-3xl md:text-4xl font-bold mb-16"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("index.techTitle")}
          </h2>

          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary/50 border border-border/60 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_20px_hsl(var(--primary)/0.18)] hover:border-primary/50"
              >
                <tech.icon
                  className={`w-10 h-10 ${tech.color} transition-transform duration-300 group-hover:scale-110`}
                  strokeWidth={1.5}
                />
                <span className="text-foreground/90 text-sm font-bold">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-1 bg-primary" />
      </section>

      {/* ───────────── CTA / Start ───────────── */}
      <section
        id="signup-section"
        className="relative bg-[hsl(var(--simulator-bg))] py-24 px-4 overflow-hidden scroll-mt-20"
        ref={ctaRef}
      >
        <Nut className="absolute top-12 left-8 w-10 h-10 text-primary/40 animate-spin-slow" />
        <Nut className="absolute bottom-16 left-16 w-8 h-8 text-primary/30 animate-spin-slow [animation-delay:300ms]" />
        <Nut className="absolute top-1/2 left-6 w-6 h-6 text-primary/20 animate-spin-slow [animation-delay:500ms]" />
        <Nut className="absolute top-16 right-12 w-9 h-9 text-primary/40 animate-spin-slow [animation-delay:200ms]" />
        <Nut className="absolute bottom-12 right-8 w-7 h-7 text-primary/30 animate-spin-slow [animation-delay:400ms]" />
        <Nut className="absolute top-1/3 right-6 w-6 h-6 text-primary/20 animate-spin-slow [animation-delay:600ms]" />

        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("index.ctaTitle")}{" "}
            <span className="text-primary">{t("index.ctaHighlight")}</span> {t("index.ctaSuffix")}
          </h2>

          <p className="text-muted-foreground mb-8">{t("index.ctaDesc")}</p>

          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
          >
            {t("index.createAccount")}
            <Zap className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer
        className="bg-[hsl(220_30%_5%)] border-t border-border"
        ref={footerRef}
      >
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                <span className="text-primary text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  SparkLab
                </span>
              </div>
              <p className="text-muted-foreground text-sm text-center md:text-left max-w-xs">
                {t("index.heroDesc")}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-secondary/60 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="h-px bg-border my-8" />

          <div className="text-center text-muted-foreground text-sm">
            {t("index.footer", { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  );
}
