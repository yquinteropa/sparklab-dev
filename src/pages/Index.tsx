import { Link } from "react-router-dom";
import { Zap, Cpu, Database, Shield, FlaskConical, Trophy, ChevronRight, Sparkles, Monitor, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

const techs = [
{ name: "React", icon: Monitor, desc: "Interfaz interactiva y componentes reutilizables" },
{ name: "Tailwind CSS", icon: Sparkles, desc: "Diseño utilitario con estética Cyber-Tech" },
{ name: "Supabase", icon: Database, desc: "Base de datos, autenticación y tiempo real" },
{ name: "React Flow", icon: Cpu, desc: "Lienzo interactivo para simulación de circuitos" },
{ name: "TypeScript", icon: Shield, desc: "Tipado estático para código robusto" },
{ name: "Vite", icon: Zap, desc: "Build ultrarrápido para desarrollo ágil" }];


function TechCarousel() {
  const [current, setCurrent] = useState(0);
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    interval.current = setInterval(() => setCurrent((p) => (p + 1) % techs.length), 3000);
    return () => clearInterval(interval.current);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-md p-8">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
          {techs.map((t) =>
          <div key={t.name} className="min-w-full flex flex-col items-center gap-4 px-4">
              <div className="w-20 h-20 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <t.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{t.name}</h3>
              <p className="text-muted-foreground text-center max-w-md">{t.desc}</p>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {techs.map((_, i) =>
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-primary w-8 glow-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`} />

          )}
        </div>
      </div>
    </div>);

}

const features = [
{ icon: FlaskConical, title: "Laboratorio Virtual", desc: "Construye circuitos arrastrando componentes en un lienzo interactivo." },
{ icon: Trophy, title: "Gamificación", desc: "Gana XP, sube de nivel y desbloquea logros mientras aprendes." },
{ icon: BookOpen, title: "Misiones Guiadas", desc: "Aprende paso a paso con desafíos progresivos y retroalimentación." },
{ icon: Users, title: "Leaderboard Global", desc: "Compite con otros estudiantes y escala en el ranking." }];


export default function Index() {
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
      <section className="relative py-24 md:py-36 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12)_0%,transparent_70%)]" />
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
      <section id="features" className="py-20 px-6">
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

      {/* Tech Carousel */}
      <section id="tech" className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12" style={{ fontFamily: "var(--font-display)" }}>Tecnologías</h2>
          <TechCarousel />
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-24 px-6 text-center">
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
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SparkLab. Todos los derechos reservados.
      </footer>
    </div>);

}