/**
 * Modal de confirmación para salir de un intento en curso.
 * Se usa en todos los niveles (Básico, Medio, Avanzado) para mantener una
 * experiencia consistente cuando el usuario decide abandonar el intento.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function ExitAttemptModal({ open, onCancel, redirectTo = "/dashboard/modules" }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!open) return null;

  const handleConfirm = () => navigate(redirectTo);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "hsl(222, 47%, 11%)",
          border: "1px solid hsl(217, 33%, 28%)",
          borderRadius: 14,
          padding: "26px 24px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "hsl(0, 70%, 18%)", border: "1px solid hsl(0, 84%, 60%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>⚠️</div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "hsl(210, 40%, 96%)", margin: 0 }}>
            {t("exitAttempt.title", "¿Salir del intento?")}
          </h2>
        </div>
        <p style={{
          fontSize: 14, color: "hsl(215, 20%, 75%)", lineHeight: 1.6,
          marginBottom: 22,
        }}>
          {t(
            "exitAttempt.desc",
            "Si sales ahora perderás el progreso de este intento y no se guardará la experiencia obtenida. ¿Estás seguro de que deseas continuar?"
          )}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 18px", borderRadius: 8,
              border: "1px solid hsl(217, 33%, 28%)",
              background: "hsl(217, 33%, 17%)",
              color: "hsl(215, 20%, 80%)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            {t("exitAttempt.cancel", "Cancelar")}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "9px 20px", borderRadius: 8,
              border: "1px solid hsl(0, 84%, 60%)",
              background: "hsl(0, 70%, 35%)",
              color: "hsl(0, 0%, 100%)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {t("exitAttempt.confirm", "Salir sin guardar")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExitAttemptModal;
