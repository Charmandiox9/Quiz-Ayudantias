import React, { useState } from "react";
import Button from "./Button";
import {
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Download,
  Trophy,
  Award,
} from "lucide-react";

export default function RewardCard({
  title = "Ayudantia N°3: Principios SOLID",
  subtitle = "Certificado de Dominio Conceptual 2026-02",
  accuracy = 100,
  score = 16000,
  mascotSrc = "/assets/ay03_solid.png",
  onRestart = null,
  onExit = null,
}) {
  const [imgSrc, setImgSrc] = useState(mascotSrc || "/assets/ay03_solid.png");
  const [imageError, setImageError] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const handlePointerMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const clientX =
      e.clientX !== undefined
        ? e.clientX
        : e.touches && e.touches[0]
        ? e.touches[0].clientX
        : rect.left + rect.width / 2;
    const clientY =
      e.clientY !== undefined
        ? e.clientY
        : e.touches && e.touches[0]
        ? e.touches[0].clientY
        : rect.top + rect.height / 2;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const px = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    const py = Math.min(Math.max((y / rect.height) * 100, 0), 100);

    const rotX = ((py - 50) / 50) * -16;
    const rotY = ((px - 50) / 50) * 16;

    setPointer({ x: px, y: py });
    setRotate({ x: rotX, y: rotY });
    setIsInteracting(true);
  };

  const handlePointerLeave = () => {
    setIsInteracting(false);
    setRotate({ x: 0, y: 0 });
    setPointer({ x: 50, y: 50 });
  };

  const handleImgError = () => {
    if (imgSrc !== "/assets/ay03_solid.png" && imgSrc !== "/assets/ay02_uml.png") {
      setImgSrc("/assets/ay03_solid.png");
    } else if (imgSrc !== "/favicon.png") {
      setImgSrc("/favicon.png");
    } else {
      setImageError(true);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        width: "100%",
        padding: "10px 0 24px",
      }}
    >
      {/* Encabezado Celebratorio */}
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            backgroundColor: "#FEF3C7",
            borderRadius: "20px",
            border: "1.5px solid #FCD34D",
            marginBottom: "10px",
          }}
        >
          <Sparkles size={16} color="#D97706" />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 900,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "#B45309",
            }}
          >
            Carta Coleccionable Desbloqueada
          </span>
        </div>

        <h2
          style={{
            fontSize: "clamp(22px, 4vw, 28px)",
            fontWeight: 900,
            color: "var(--color-primary)",
            margin: "0 0 6px",
          }}
        >
          ¡Dominio Conceptual Total!
        </h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0 }}>
          Mueve el cursor o inclina la pantalla para apreciar el efecto holografico de tu carta.
        </p>
      </div>

      {/* Contenedor 3D de la Carta */}
      <div
        style={{
          perspective: "1200px",
          width: "100%",
          maxWidth: "370px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={handlePointerLeave}
          onTouchEnd={handlePointerLeave}
          className="fade-in"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "360px",
            aspectRatio: "1792 / 2400",
            borderRadius: "22px",
            overflow: "hidden",
            cursor: "pointer",
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isInteracting ? 1.04 : 1}, ${isInteracting ? 1.04 : 1}, ${isInteracting ? 1.04 : 1})`,
            transition: isInteracting ? "transform 0.08s ease-out" : "all 0.5s ease",
            boxShadow: isInteracting
              ? `0 28px 50px -10px rgba(0, 0, 0, 0.4), ${rotate.y * -2}px ${rotate.x * 2}px 30px rgba(217, 119, 6, 0.35)`
              : "0 18px 36px -8px rgba(0, 0, 0, 0.25)",
            border: "2px solid rgba(251, 191, 36, 0.7)",
          }}
        >
          {/* Capa 1: La Ilustración Completa de la Carta */}
          {!imageError ? (
            <img
              src={imgSrc}
              alt={title}
              onError={handleImgError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#1E293B",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                color: "#FBBF24",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <Award size={64} color="#FBBF24" />
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>{title}</h3>
              <p style={{ fontSize: "13px", color: "#94A3B8" }}>{subtitle}</p>
            </div>
          )}

          {/* Capa 2: Holograma Arcoíris Foil (Diffraction Sheen) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `linear-gradient(
                ${115 + rotate.y * 1.5}deg,
                transparent 15%,
                rgba(255, 0, 128, 0.35) 30%,
                rgba(0, 245, 255, 0.45) 45%,
                rgba(255, 235, 0, 0.4) 55%,
                rgba(16, 185, 129, 0.35) 68%,
                transparent 85%
              )`,
              backgroundPosition: `${pointer.x}% ${pointer.y}%`,
              backgroundSize: "220% 220%",
              mixBlendMode: "color-dodge",
              opacity: isInteracting ? 0.85 : 0.4,
              transition: "opacity 0.25s ease",
            }}
          />

          {/* Capa 3: Destello Especular de Luz Blanca (Specular Glare) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `radial-gradient(
                circle at ${pointer.x}% ${pointer.y}%,
                rgba(255, 255, 255, 0.75) 0%,
                rgba(255, 255, 255, 0.2) 25%,
                transparent 55%
              )`,
              mixBlendMode: "overlay",
              opacity: isInteracting ? 0.9 : 0.25,
              transition: "opacity 0.2s ease",
            }}
          />

          {/* Capa 4: Micro-Textura Holográfica de Líneas Finas */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `repeating-linear-gradient(
                ${45 + rotate.x}deg,
                rgba(255, 255, 255, 0.05) 0px,
                rgba(255, 255, 255, 0.05) 1.5px,
                transparent 1.5px,
                transparent 6px
              )`,
              mixBlendMode: "color-dodge",
              opacity: isInteracting ? 0.7 : 0.35,
            }}
          />

          {/* Bisel Brillante en los Bordes */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "20px",
              boxShadow: "inset 0 0 15px rgba(255, 215, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* Tarjeta Informativa del Logro */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          padding: "10px 20px",
          backgroundColor: "var(--color-surface)",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Trophy size={16} color="#D97706" />
          <span style={{ fontSize: "13.5px", fontWeight: 800, color: "var(--color-primary)" }}>
            Rango S
          </span>
        </div>
        <div style={{ width: "1px", height: "16px", backgroundColor: "var(--color-border)" }} />
        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#16A34A" }}>
          Precision: {accuracy}%
        </span>
        <div style={{ width: "1px", height: "16px", backgroundColor: "var(--color-border)" }} />
        <span
          style={{
            fontSize: "13.5px",
            fontWeight: 800,
            fontFamily: "Consolas, monospace",
            color: "var(--color-accent)",
          }}
        >
          {score} pts
        </span>
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
        {/* Botón Descargar Carta */}
        <a
          href={imgSrc}
          download={`Carta_${title.replace(/[^a-zA-Z0-9]/g, "_")}.png`}
          style={{ textDecoration: "none" }}
        >
          <Button variant="accent" icon={Download} className="touch-btn">
            Descargar Carta
          </Button>
        </a>

        {onRestart && (
          <Button variant="secondary" icon={RotateCcw} onClick={onRestart} className="touch-btn">
            Practicar de Nuevo
          </Button>
        )}

        {onExit && (
          <Button variant="primary" icon={ArrowLeft} onClick={onExit} className="touch-btn">
            Volver al Menu
          </Button>
        )}
      </div>
    </div>
  );
}
