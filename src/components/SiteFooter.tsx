import { Zap, Github, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const socialLinks = [
  { icon: Github, href: "https://github.com/yquinteropa/sparklab-dev", label: "GitHub" },
  { icon: Mail, href: "https://mail.google.com/mail/?view=cm&fs=1&to=kdbermudezr@ufpso.edu.co", label: "Email" },
];

interface SiteFooterProps {
  footerRef?: React.Ref<HTMLElement>;
}

export function SiteFooter({ footerRef }: SiteFooterProps) {
  const { t } = useTranslation();

  return (
    <footer
      ref={footerRef}
      className="bg-[hsl(220_30%_5%)] border-t border-border"
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <span
                className="text-primary text-xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
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
  );
}

export default SiteFooter;
