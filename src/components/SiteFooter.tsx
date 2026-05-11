import { Zap, Github, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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
      className="bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_-5px_hsl(var(--primary)/0.1)]"
    >
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-primary/10 border border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.25)]">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span
                className="text-sm font-bold tracking-[0.22em] uppercase text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                SparkLab
              </span>
            </Link>
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              {t("index.footerShortDesc")}
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Legal
            </span>
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {t("index.terms")}
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {t("index.privacy")}
              </Link>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
              {t("index.followUs")}
            </span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-secondary/60 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:-translate-y-1 hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-border/50 my-8" />

        <div className="text-center text-muted-foreground text-sm">
          {t("index.footer", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
