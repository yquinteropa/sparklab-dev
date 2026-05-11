import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Target, Trophy, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function DashboardNav() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { to: '/dashboard', label: t('nav.missions'), icon: Target },
    { to: '/dashboard/simulator', label: t('nav.simulator'), icon: Zap },
    { to: '/dashboard/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-20 backdrop-blur-md"
        style={{
          background: "hsl(var(--simulator-bg) / 0.92)",
          borderBottom: "1px solid hsl(var(--primary) / 0.18)",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
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

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-200 group ${
                    active
                      ? 'text-primary bg-primary/10 border border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.25)]'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {!active && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30 transition-all duration-200"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown className="h-3 w-3" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-xl">
                <Link
                  to="/dashboard/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-card-foreground hover:bg-muted"
                >
                  <User className="h-4 w-4" /> {t('nav.updateProfile')}
                </Link>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-card-foreground hover:bg-muted"
                >
                  <Settings className="h-4 w-4" /> Configuración y privacidad
                </Link>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => { setMenuOpen(false); setShowLogoutConfirm(true); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> {t('nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('nav.logoutConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('nav.logoutConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('nav.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { await signOut(); navigate('/'); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('nav.logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
