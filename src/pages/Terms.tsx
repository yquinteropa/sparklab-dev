import { Zap, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function Terms() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sections = t("terms.sections", { returnObjects: true }) as {
    title: string;
    content: string;
  }[];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.25)] flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-[0.22em] uppercase text-primary">
              SparkLab
            </span>
          </Link>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("legal.back")}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("terms.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("legal.lastUpdated", { date: "08/05/2026" })}
          </p>
        </div>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <p className="text-lg text-muted-foreground">{t("terms.intro")}</p>

          {sections.map((section, i) => (
            <section
              key={i}
              className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <h2 className="text-xl font-semibold text-primary mb-3">
                {i + 1}. {section.title}
              </h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
