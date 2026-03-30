import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Target, Trophy, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
    { to: '/dashboard', label: 'Misiones', icon: Target },
    { to: '/dashboard/simulator', label: 'Simulador', icon: Zap },
    { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">SparkLab</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                  <User className="h-4 w-4" /> Actualizar perfil
                </Link>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => { setMenuOpen(false); setShowLogoutConfirm(true); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de salir de tu cuenta. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => signOut()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}