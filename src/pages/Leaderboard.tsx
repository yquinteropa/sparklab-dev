import { DashboardNav } from '@/components/DashboardNav';
import { Trophy, Medal, Zap } from 'lucide-react';

const mockPlayers = [
  { name: 'ElectroMaster', xp: 2450, level: 8 },
  { name: 'CircuitNinja', xp: 1980, level: 6 },
  { name: 'VoltageHero', xp: 1520, level: 5 },
  { name: 'OhmRunner', xp: 1100, level: 4 },
  { name: 'SparkChamp', xp: 890, level: 3 },
];

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold text-foreground">
          <Trophy className="h-6 w-6 text-primary" /> Leaderboard
        </h1>
        <div className="space-y-3">
          {mockPlayers.map((p, i) => (
            <div
              key={p.name}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                i === 0
                  ? 'border-primary bg-primary/5 glow-primary'
                  : 'border-border bg-card'
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-display text-sm font-bold text-muted-foreground">
                {i === 0 ? <Medal className="h-4 w-4 text-primary" /> : i + 1}
              </span>
              <div className="flex-1">
                <span className="font-medium text-card-foreground">{p.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">Nivel {p.level}</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-primary">
                <Zap className="h-3.5 w-3.5" /> {p.xp} XP
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
