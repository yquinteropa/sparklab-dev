import { Zap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  const { t } = useTranslation();
  const sections = t("privacy.sections", { returnObjects: true }) as {
    title: string;
    content: string;
  }[];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span
              className="text-primary text-xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              SparkLab
            </span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("legal.back")}
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("privacy.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("legal.lastUpdated", { date: "08/05/2026" })}
          </p>
        </div>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <p className="text-lg text-muted-foreground">{t("privacy.intro")}</p>

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
