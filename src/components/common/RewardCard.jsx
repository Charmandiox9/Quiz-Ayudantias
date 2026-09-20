import React, { useState } from "react";
import Button from "./Button";
import { Award, Sparkles, RotateCcw, ArrowLeft, Shield } from "lucide-react";

export default function RewardCard({
  title = "Maestria en Principios SOLID",
  subtitle = "Certificado de Dominio Conceptual 2026-02",
  accuracy = 100,
  score = 16000,
  mascotSrc = "/assets/mascot.png",
  onRestart = null,
  onExit = null,
}) {
  const [imageError, setImageError] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        width: "100%",
        padding: "16px 0",
      }}
    >
      {/* Contenedor con Perspectiva 3D */}
      <div
        style={{
          perspective: "1200px",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="fade-in"
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "20px",
            padding: "4px",
            background: "linear-gradient(135deg, #F59E0B, #E2E8F0, #3B82F6, #F59E0B, #10B981)",
            backgroundSize: "300% 300%",
            boxShadow: isHovered
              ? "0 25px 40px -10px rgba(217, 119, 6, 0.4), 0 0 25px rgba(59, 130, 246, 0.3)"
              : "0 15px 30px -5px rgba(0, 0, 0, 0.15)",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: isHovered ? "transform 0.1s ease-out" : "all 0.5s ease",
            cursor: "pointer",
          }}
        >
          {/* Cuerpo Interior de la Carta */}
          <div
            style={{
              backgroundColor: "#0F172A",
              borderRadius: "16px",
              padding: "20px 18px",
              color: "#FFFFFF",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Destello Holográfico Superior */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "50%",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Cabecera de la Carta */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                paddingBottom: "8px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={16} color="#FBBF24" />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#FBBF24",
                  }}
                >
                  Logro Legendario
                </span>
              </div>
              <span
                style={{
                  fontFamily: "Consolas, monospace",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#94A3B8",
                }}
              >
                100% HP
              </span>
            </div>

            {/* Titulo de la Carta */}
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 900,
                color: "#FFFFFF",
                margin: "0 0 4px",
                textAlign: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: "11.5px",
                color: "#94A3B8",
                margin: "0 0 14px",
                textAlign: "center",
              }}
            >
              {subtitle}
            </p>

            {/* Ventana de Ilustración / Mascota */}
            <div
              style={{
                width: "100%",
                height: "210px",
                borderRadius: "12px",
                backgroundColor: "#1E293B",
                border: "2px solid #334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                marginBottom: "14px",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.4)",
              }}
            >
              {!imageError ? (
                <img
                  src={mascotSrc}
                  alt="Mascota Oficial Pingüino"
                  onError={() => setImageError(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "8px",
                    filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))",
                  }}
                />
              ) : (
                /* Fallback Gráfico si la imagen aún no ha sido cargada en /assets */
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    color: "#FBBF24",
                  }}
                >
                  <Award size={64} color="#FBBF24" />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#E2E8F0" }}>
                    Pingüino Ingeniero SOLID
                  </span>
                  <span style={{ fontSize: "10.5px", color: "#64748B" }}>
                    Coloca tu mascot.png en public/assets/
                  </span>
                </div>
              )}

              {/* Distintivo de Rareza */}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  backdropFilter: "blur(4px)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid rgba(251, 191, 36, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Shield size={12} color="#FBBF24" />
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#FBBF24" }}>
                  RANGO S
                </span>
              </div>
            </div>

            {/* Estadísticas de Rendimiento */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  padding: "8px 10px",
                  backgroundColor: "rgba(30, 41, 59, 0.7)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase" }}>
                  Precision
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#10B981",
                    fontFamily: "Consolas, monospace",
                  }}
                >
                  {accuracy}%
                </span>
              </div>

              <div
                style={{
                  padding: "8px 10px",
                  backgroundColor: "rgba(30, 41, 59, 0.7)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "10px", color: "#94A3B8", textTransform: "uppercase" }}>
                  Puntaje Total
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#FBBF24",
                    fontFamily: "Consolas, monospace",
                  }}
                >
                  {score} pts
                </span>
              </div>
            </div>

            {/* Cita Pedagógica */}
            <div
              style={{
                padding: "8px 10px",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                borderLeft: "2px solid #FBBF24",
                borderRadius: "4px",
                fontSize: "11px",
                color: "#CBD5E1",
                lineHeight: 1.4,
                fontStyle: "italic",
              }}
            >
              "Ninguna clase debe prometer lo que no puede cumplir. El software crece sin desarmar lo probado."
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {onRestart && (
          <Button variant="secondary" icon={RotateCcw} onClick={onRestart}>
            Practicar de Nuevo
          </Button>
        )}
        {onExit && (
          <Button variant="primary" icon={ArrowLeft} onClick={onExit}>
            Volver al Menu
          </Button>
        )}
      </div>
    </div>
  );
}
