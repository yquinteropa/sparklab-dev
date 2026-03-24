import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { Zap, FlaskConical, Trophy, ChevronRight, BookOpen, Users, Atom, Wind, Database, FileCode, Flame, Triangle } from "lucide-react";
import heroBg from "@/assets/hero-bg.webp";
import { Button } from "@/components/ui/button";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "opacity 0.7s ease-out, transform 0.7s ease-out";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        } else {
          el.style.opacity = "0";
          el.style.transform = "translateY(40px)";
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const techStack = [
  { icon: Atom, name: "React", color: "text-sky-400" },
  { icon: Wind, name: "Tailwind CSS", color: "text-cyan-400" },
  { icon: Database, name: "Supabase", color: "text-emerald-400" },
  { icon: FileCode, name: "TypeScript", color: "text-blue-400" },
  { icon: Flame, name: "Vite", color: "text-amber-400" },
  { icon: Triangle, name: "Vercel", color: "text-foreground" },
];

const features = [
{ icon: FlaskConical, title: "Laboratorio Virtual", desc: "Construye circuitos arrastrando componentes en un lienzo interactivo." },
{ icon: Trophy, title: "Gamificación", desc: "Gana XP, sube de nivel y desbloquea logros mientras aprendes." },
{ icon: BookOpen, title: "Misiones Guiadas", desc: "Aprende paso a paso con desafíos progresivos y retroalimentación." },
{ icon: Users, title: "Leaderboard Global", desc: "Compite con otros estudiantes y escala en el ranking." }];


export default function Index() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useScrollReveal();
  const featuresRef = useScrollReveal();
  const techRef = useScrollReveal();
  const ctaRef = useScrollReveal();
  const footerRef = useScrollReveal();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>SparkLab</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Características</a>
            <a href="#tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tecnologías</a>
          </div>
          <Link to="/auth">
            <Button size="sm" className="glow-primary gap-1.5">
              Ingresar <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 text-center overflow-hidden" ref={heroRef}>
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.4}px)` }}>
          <img src={heroBg} alt="" className="w-full h-full object-cover scale-125" />
          <div className="absolute inset-0 bg-background/30" />
        </div>
        <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" /> Plataforma Educativa Gamificada
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Aprende Circuitos<br />
            <span className="text-primary text-glow">Eléctricos Jugando</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            SparkLab transforma conceptos complejos de electrónica en experiencias interactivas con simulaciones, misiones y competencias.
          </p>
          <Link to="/auth">
            <Button size="lg" className="glow-primary text-base gap-2 mt-2">
              Comenzar Ahora <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 scroll-mt-20" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12" style={{ fontFamily: "var(--font-display)" }}>Características</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) =>
            <div key={f.title} className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 hover:border-primary/40 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="tech" className="py-20 px-6 bg-muted/30 scroll-mt-20" ref={techRef}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-14" style={{ fontFamily: "var(--font-display)" }}>
            Tecnologías que impulsan SparkLab
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300"
              >
                <tech.icon className={`w-10 h-10 ${tech.color} group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-24 px-6 text-center" ref={ctaRef}>
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            ¿Listo para <span className="text-primary text-glow">encender</span> tu aprendizaje?
          </h2>
          <p className="text-muted-foreground">Crea tu cuenta gratis y comienza a construir circuitos hoy.</p>
          <Link to="/auth">
            <Button size="lg" className="glow-primary gap-2">
              Crear Cuenta <Zap className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground" ref={footerRef}>
        © {new Date().getFullYear()} SparkLab. Todos los derechos reservados.
      </footer>
    </div>);

}