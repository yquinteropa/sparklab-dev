/**
 * Modal de "Nivel completado".
 * Se muestra al terminar un nivel y permite al usuario:
 *  - Avanzar al siguiente nivel desbloqueado (si existe).
 *  - Volver al catálogo de módulos.
 *
 * El siguiente nivel se calcula a partir de `getNextLevel(levelKey)`
 * definido en `src/lib/progress.ts`.
 */
import { useNavigate } from "react-router-dom";
import { getNextLevel } from "@/lib/progress";

interface LevelCompleteModalProps {
  /** Clave única del nivel recién completado (ej: 'basico:level1'). */
  levelKey: string;
  /** XP otorgados (solo informativo en la UI). */
  xp?: number;
  /** Cierra el modal sin navegar. */
  onClose: () => void;
}

export function LevelCompleteModal({ levelKey, xp = 100, onClose }: LevelCompleteModalProps) {
  const navigate = useNavigate();
  const next = getNextLevel(levelKey);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, hsl(222, 47%, 13%) 0%, hsl(222, 47%, 9%) 100%)",
          border: "1px solid rgba(34,211,238,0.35)",
          borderRadius: 16,
          padding: "32px 28px",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(34,211,238,0.18)",
        }}
        role="dialog"
        aria-labelledby="level-complete-title"
      >
        <div style={{ fontSize: 56, marginBottom: 10, lineHeight: 1 }}>🏆</div>
        <h2
          id="level-complete-title"
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "hsl(210, 40%, 96%)",
            marginBottom: 8,
            letterSpacing: "-0.01em",
          }}
        >
          ¡Nivel completado!
        </h2>
        <p style={{ fontSize: 13, color: "hsl(215, 20%, 70%)", lineHeight: 1.6, marginBottom: 18 }}>
          Has dominado este nivel y desbloqueado nuevos contenidos.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 99,
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
            color: "#f59e0b",
            fontFamily: "'Courier New', monospace",
            fontWeight: 800,
            fontSize: 13,
            marginBottom: 22,
          }}
        >
          ⚡ +{xp} XP
        </div>

        {next && (
          <div
            style={{
              background: "hsl(217, 33%, 17%)",
              border: "1px solid rgba(34,211,238,0.25)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              color: "hsl(215, 20%, 75%)",
              marginBottom: 18,
            }}
          >
            🔓 Siguiente nivel desbloqueado: <strong style={{ color: "hsl(199, 89%, 70%)" }}>{next.label}</strong>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              onClose();
              navigate("/dashboard/modules");
            }}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "hsl(217, 33%, 17%)",
              color: "hsl(215, 20%, 80%)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Volver a módulos
          </button>
          {next ? (
            <button
              onClick={() => {
                onClose();
                navigate(next.route);
              }}
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                border: "1px solid #93c5fd",
                background: "linear-gradient(135deg, hsl(217, 91%, 28%), hsl(199, 89%, 30%))",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(59,130,246,0.35)",
              }}
            >
              Avanzar al siguiente nivel →
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                navigate("/dashboard");
              }}
              style={{
                padding: "10px 22px",
                borderRadius: 10,
                border: "1px solid #93c5fd",
                background: "linear-gradient(135deg, hsl(217, 91%, 28%), hsl(199, 89%, 30%))",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Ir al dashboard
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
