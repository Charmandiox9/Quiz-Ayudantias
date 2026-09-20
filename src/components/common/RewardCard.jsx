import React, { useState, useMemo, useRef } from "react";
import Button from "./Button";
import { audioService } from "../../services/audioService";
import { certificateService } from "../../services/certificateService";
import {
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Download,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
  Gift,
} from "lucide-react";

/**
 * Genera un numero de serie unico y seguro para el certificado.
 * Cumple con la Ley N° 21.719 al no utilizar datos personales ni RUTs.
 */
function generateUniqueSerial(prefix = "SOLID") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `#${prefix}-${part1}-${part2}`;
}

export default function RewardCard({
  title = "Ayudantia N°3: Principios SOLID",
  subtitle = "Certificado de Dominio Conceptual 2026-02",
  accuracy = 100,
  score = 16000,
  mascotSrc = "/assets/ay03_solid.png",
  onRestart = null,
  onExit = null,
}) {
  const [customSrcOverride, setCustomSrcOverride] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isSuctioning, setIsSuctioning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState(null);

  // Estados compartidos para la fisica 3D interactiva del raton (tanto para el sobre como para la carta)
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const downloadBtnRef = useRef(null);

  const activeImgSrc = customSrcOverride || mascotSrc || "/assets/ay03_solid.png";

  // ID unico generado una sola vez por sesion de completitud
  const uniqueId = useMemo(() => {
    const isSolid = title.toLowerCase().includes("solid");
    return generateUniqueSerial(isSolid ? "SOLID" : "UML");
  }, [title]);

  /**
   * Apertura pausada y cinematografica del sobre (1.5s).
   * Fase 1: Carga luminosa y sonido de rasgado (0 - 450ms).
   * Fase 2: Fanfarria triunfal y transicion (450ms - 900ms).
   * Fase 3: La carta emerge majestuosamente y el sobre se desvanece (900ms - 1500ms).
   */
  const handleOpenPack = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);

    try {
      audioService.playTear();
    } catch {
      // Audio fallback silencioso
    }

    setTimeout(() => {
      try {
        audioService.playReveal();
      } catch {
        // Audio fallback
      }
    }, 450);

    setTimeout(() => {
      setIsOpened(true);
      setIsOpening(false);
    }, 1300);
  };

  /**
   * Controlador de movimiento 3D compartido (responde tanto en el sobre como en la carta).
   */
  const handlePointerMove = (e) => {
    if (isSuctioning) return;
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
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
    if (activeImgSrc !== "/assets/ay03_solid.png" && activeImgSrc !== "/assets/ay02_uml.png") {
      setCustomSrcOverride("/assets/ay03_solid.png");
    } else if (activeImgSrc !== "/favicon.png") {
      setCustomSrcOverride("/favicon.png");
    } else {
      setImageError(true);
    }
  };

  /**
   * Guarda la imagen asegurando formato PNG sin perdida en todos los navegadores y Windows.
   */
  const saveImageFile = async (pngBlob, filename) => {
    // 1. Intentar con showSaveFilePicker (Chromium nativo en Windows)
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: "Imagen PNG (*.png)",
              accept: { "image/png": [".png"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(pngBlob);
        await writable.close();
        return true;
      } catch (err) {
        if (err && err.name === "AbortError") {
          return false;
        }
      }
    }

    // 2. Metodo estandar mediante Blob URL forzado
    const url = URL.createObjectURL(pngBlob);
    setGeneratedBlobUrl(url);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
    }, 1200);

    return true;
  };

  /**
   * Renderizado en Canvas en MAXIMA RESOLUCION (1792 x 2400).
   * Se inserta unicamente el ID, semestre, ramo y usuario de GitHub @Marton1123 en el borde inferior exterior,
   * garantizando que los medallones e ilustracion permanezcan 100% intactos y limpios.
   */
  const handleCanvasDownload = async () => {
    if (isDownloading || isSuctioning) return;
    setIsDownloading(true);
    setIsSuctioning(true);

    // Reproducir efecto de succion por el boton
    try {
      audioService.playSuction();
    } catch {
      // Audio fallback
    }

    const cleanId = uniqueId.replace(/[^a-zA-Z0-9]/g, "");
    const cleanFilename = `Carta_IS_${cleanId}.png`;

    try {
      // 1. Cargar imagen binaria mediante fetch para máxima fidelidad
      const response = await fetch(activeImgSrc);
      const sourceBlob = await response.blob();
      const imgBitmap = await createImageBitmap(sourceBlob);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Resolucion nativa ultra nitida
      canvas.width = imgBitmap.width || 1792;
      canvas.height = imgBitmap.height || 2400;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Dibujar la ilustracion completa de la carta
      ctx.drawImage(imgBitmap, 0, 0, canvas.width, canvas.height);

      // Sombra para contraste y legibilidad sobre cualquier fondo
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      const footerY = canvas.height - 24;

      // Izquierda: ID unico de la carta
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 20px Consolas, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`ID: ${uniqueId}`, 68, footerY);

      // Centro: Semestre y Ramo
      ctx.fillStyle = "#F1E3C6";
      ctx.font = "bold 19px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Ingenieria de Software • 2026-02", canvas.width / 2, footerY);

      // Derecha: Usuario de GitHub @Marton1123
      ctx.fillStyle = "#FCD34D";
      ctx.font = "bold 20px Consolas, monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText("Ayudantia: @Marton1123", canvas.width - 68, footerY);

      // 2. Exportar canvas a Blob PNG genuino sin perdida de calidad
      const canvasBlob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png", 1.0)
      );

      const finalPngBlob = new Blob([await canvasBlob.arrayBuffer()], {
        type: "image/png",
      });

      // 3. Esperar que la animacion pausada de succion culmine (1.1s)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // 4. Guardar archivo con formato PNG garantizado
      const saved = await saveImageFile(finalPngBlob, cleanFilename);

      if (saved) {
        setDownloadSuccess(true);

        // 5. Registrar la descarga en base de datos (Supabase y localStorage)
        certificateService.recordDownload({
          serialId: uniqueId,
          quizTitle: title,
          accuracy: accuracy,
          score: score,
          nickname: "Estudiante",
        });
      }
    } catch {
      // Fallback directo en caso de incompatibilidad
      const a = document.createElement("a");
      a.href = activeImgSrc;
      a.download = cleanFilename;
      a.setAttribute("download", cleanFilename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadSuccess(true);
    } finally {
      setIsSuctioning(false);
      setIsDownloading(false);
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
      {/* 1. Experiencia del Sobre Booster Pack con Diseno Coherente y Movimiento 3D */}
      {!isOpened ? (
        <div
          className="fade-in"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              backgroundColor: "#FEF3C7",
              borderRadius: "20px",
              border: "1.5px solid #FCD34D",
              marginBottom: "14px",
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
              Recompensa por Dominio 100%
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 900,
              color: "var(--color-primary)",
              marginBottom: "8px",
            }}
          >
            Has ganado un Sobre Coleccionable
          </h2>
          <p
            style={{
              fontSize: "14.5px",
              color: "var(--color-text-secondary)",
              marginBottom: "20px",
              lineHeight: 1.5,
            }}
          >
            Mueve el cursor para apreciar el brillo foil 3D, y presiona el sobre para rasgarlo y revelar tu carta.
          </p>

          {/* Contenedor 3D del Sobre (Reacciona al raton igual que la carta) */}
          <div
            style={{
              perspective: "1200px",
              width: "100%",
              maxWidth: "360px",
              display: "flex",
              justifyContent: "center",
              marginBottom: "18px",
            }}
          >
            <div
              onMouseMove={handlePointerMove}
              onTouchMove={handlePointerMove}
              onMouseEnter={() => setIsInteracting(true)}
              onMouseLeave={handlePointerLeave}
              onTouchEnd={handlePointerLeave}
              onClick={handleOpenPack}
              className={`card-hover ${isOpening ? "pack-charge" : ""}`}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "360px",
                aspectRatio: "1792 / 2400",
                borderRadius: "22px",
                overflow: "hidden",
                cursor: "pointer",
                transformStyle: "preserve-3d",
                transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isInteracting ? 1.03 : 1}, ${isInteracting ? 1.03 : 1}, ${isInteracting ? 1.03 : 1})`,
                transition: isInteracting ? "transform 0.08s ease-out" : "all 0.5s ease",
                boxShadow: isInteracting
                  ? `0 28px 55px -10px rgba(15, 23, 42, 0.55), ${rotate.y * -2}px ${rotate.x * 2}px 32px rgba(245, 158, 11, 0.35)`
                  : "0 20px 40px -8px rgba(15, 23, 42, 0.4)",
                border: "2.5px solid rgba(251, 191, 36, 0.85)",
                background: "linear-gradient(135deg, #090D16 0%, #151D3B 30%, #1E3A8A 65%, #0F172A 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "20px 18px",
                color: "#FFFFFF",
              }}
            >
              {/* Costura superior de sellado termico foil */}
              <div
                style={{
                  height: "18px",
                  background: "repeating-linear-gradient(90deg, #F59E0B 0px, #F59E0B 3px, #78350F 3px, #78350F 6px)",
                  borderRadius: "6px",
                  opacity: 0.9,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              />

              {/* Franja de Rasgado Perforada (Elegante e integrada, sin cortes extranos) */}
              <div
                style={{
                  margin: "8px 0",
                  padding: "8px 12px",
                  borderBottom: "2px dashed rgba(251, 191, 36, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "#FCD34D",
                  }}
                >
                  LINEA DE APERTURA OFICIAL
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#FEF3C7",
                    backgroundColor: "rgba(245, 158, 11, 0.35)",
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  TIRAR AQUI
                </span>
              </div>

              {/* Emblema Central Integrado del Sobre Coleccionable */}
              <div
                style={{
                  padding: "16px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "82px",
                    height: "82px",
                    borderRadius: "24px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(8px)",
                    border: "2px solid #FCD34D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.4)",
                  }}
                >
                  <Gift size={42} color="#FBBF24" />
                </div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    letterSpacing: "1.8px",
                    textTransform: "uppercase",
                    color: "#FCD34D",
                    marginBottom: "6px",
                  }}
                >
                  INGENIERIA DE SOFTWARE 2026-02
                </span>

                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    margin: "0 0 6px",
                    textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                  }}
                >
                  Sobre de Maestria
                </h3>

                <p style={{ fontSize: "13px", color: "#CBD5E1", margin: "0 0 10px", lineHeight: 1.4 }}>
                  {title}
                </p>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    backgroundColor: "rgba(245, 158, 11, 0.2)",
                    borderRadius: "20px",
                    border: "1px solid rgba(251, 191, 36, 0.5)",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#FDE68A" }}>
                    EDICION LIMITADA — 100% DOMINIO
                  </span>
                </div>
              </div>

              {/* Boton Táctil Inferior de Rasgado */}
              <div>
                <div
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "rgba(245, 158, 11, 0.28)",
                    borderRadius: "12px",
                    border: "1.5px dashed #FCD34D",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Zap size={16} color="#FDE68A" />
                  <span style={{ fontSize: "12.5px", fontWeight: 900, color: "#FDE68A" }}>
                    {isOpening ? "Abriendo sobre..." : "Toca aqui para rasgar y abrir"}
                  </span>
                </div>

                {/* Costura inferior de sellado termico foil */}
                <div
                  style={{
                    height: "18px",
                    background: "repeating-linear-gradient(90deg, #F59E0B 0px, #F59E0B 3px, #78350F 3px, #78350F 6px)",
                    borderRadius: "6px",
                    opacity: 0.9,
                    boxShadow: "0 -2px 8px rgba(0,0,0,0.4)",
                  }}
                />
              </div>

              {/* Brillo Foil Metalico Dinamico que sigue al cursor en el sobre */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background: `radial-gradient(
                    circle at ${pointer.x}% ${pointer.y}%,
                    rgba(255, 255, 255, 0.4) 0%,
                    rgba(255, 215, 0, 0.2) 30%,
                    transparent 65%
                  )`,
                  mixBlendMode: "overlay",
                  opacity: isInteracting ? 0.9 : 0.2,
                  transition: "opacity 0.25s ease",
                }}
              />
            </div>
          </div>

          <div>
            <Button
              variant="accent"
              size="lg"
              icon={Zap}
              onClick={handleOpenPack}
              className="touch-btn pulse-animation"
            >
              {isOpening ? "Abriendo Sobre..." : "Abrir Sobre Coleccionable"}
            </Button>
          </div>
        </div>
      ) : (
        /* 2. Carta Revelada en su Esplendor Holografico 3D con Animacion de Succion Cinematografica */
        <div
          className="fade-in card-slide-out-slow"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "480px", marginBottom: "16px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                backgroundColor: "#FEF3C7",
                borderRadius: "20px",
                border: "1.5px solid #FCD34D",
                marginBottom: "8px",
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
                Carta Holografica Desbloqueada
              </span>
            </div>

            <h2
              style={{
                fontSize: "clamp(22px, 4vw, 28px)",
                fontWeight: 900,
                color: "var(--color-primary)",
                margin: "0 0 4px",
              }}
            >
              Dominio Conceptual Total
            </h2>
            <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", margin: 0 }}>
              Mueve el cursor o inclina la pantalla para apreciar el efecto holografico.
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
              marginBottom: "16px",
            }}
          >
            <div
              onMouseMove={handlePointerMove}
              onTouchMove={handlePointerMove}
              onMouseEnter={() => setIsInteracting(true)}
              onMouseLeave={handlePointerLeave}
              onTouchEnd={handlePointerLeave}
              className={`card-pop-up ${isSuctioning ? "card-suction-slow" : ""}`}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "360px",
                aspectRatio: "1792 / 2400",
                borderRadius: "22px",
                overflow: "hidden",
                cursor: "pointer",
                transformStyle: "preserve-3d",
                transform: !isSuctioning
                  ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isInteracting ? 1.04 : 1}, ${isInteracting ? 1.04 : 1}, ${isInteracting ? 1.04 : 1})`
                  : undefined,
                transition: isInteracting && !isSuctioning ? "transform 0.08s ease-out" : "all 0.5s ease",
                boxShadow: isInteracting && !isSuctioning
                  ? `0 30px 60px -10px rgba(0, 0, 0, 0.45), ${rotate.y * -2}px ${rotate.x * 2}px 35px rgba(217, 119, 6, 0.4)`
                  : "0 20px 40px -8px rgba(0, 0, 0, 0.28)",
                border: "2.5px solid rgba(251, 191, 36, 0.85)",
              }}
            >
              {/* Capa 1: La Ilustracion Completa de la Carta */}
              {!imageError ? (
                <img
                  src={activeImgSrc}
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
                  <Gift size={64} color="#FBBF24" />
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF" }}>{title}</h3>
                  <p style={{ fontSize: "13px", color: "#94A3B8" }}>{subtitle}</p>
                </div>
              )}

              {/* Capa 2: Holograma Arcoiris Foil (Diffraction Sheen) */}
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

              {/* Capa 3: Destello Especular de Luz Blanca */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background: `radial-gradient(
                    circle at ${pointer.x}% ${pointer.y}%,
                    rgba(255, 255, 255, 0.8) 0%,
                    rgba(255, 255, 255, 0.2) 25%,
                    transparent 55%
                  )`,
                  mixBlendMode: "overlay",
                  opacity: isInteracting ? 0.9 : 0.25,
                  transition: "opacity 0.2s ease",
                }}
              />

              {/* Capa 4: Micro-Textura Holografica */}
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
                  boxShadow: "inset 0 0 15px rgba(255, 215, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.6)",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Tarjeta de Certificado y Numero de Serie Unico */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              backgroundColor: "var(--color-surface)",
              borderRadius: "14px",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
              marginBottom: "18px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={18} color="#16A34A" />
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--color-primary)" }}>
                Certificado Oficial Verificable
              </span>
            </div>

            <div
              style={{
                padding: "6px 12px",
                backgroundColor: "#F8FAFC",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>ID SERIAL:</span>
              <span
                style={{
                  fontFamily: "Consolas, monospace",
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#B45309",
                  letterSpacing: "0.5px",
                }}
              >
                {uniqueId}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "2px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#16A34A" }}>
                Precision: {accuracy}%
              </span>
              <span style={{ color: "#CBD5E1" }}>|</span>
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--color-accent)" }}>
                {score} pts
              </span>
              <span style={{ color: "#CBD5E1" }}>|</span>
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--color-primary)" }}>
                Rango S
              </span>
            </div>
          </div>

          {/* Botones de Accion con Efecto de Absorcion */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Boton Descargar con Succion, Canvas y Registro de Timestamp */}
            <div ref={downloadBtnRef} className={isSuctioning ? "btn-absorb-slow" : ""}>
              <Button
                variant="accent"
                icon={downloadSuccess ? CheckCircle2 : Download}
                onClick={handleCanvasDownload}
                disabled={isDownloading || isSuctioning}
                className="touch-btn"
              >
                {isSuctioning
                  ? "Succionando Carta..."
                  : isDownloading
                  ? "Generando PNG Ultra..."
                  : downloadSuccess
                  ? "Descargar Otra Vez (PNG)"
                  : "Descargar Carta (PNG)"}
              </Button>
            </div>

            {/* Enlace de contingencia para abrir en nueva pestaña */}
            {generatedBlobUrl && (
              <a
                href={generatedBlobUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  textDecoration: "underline",
                  padding: "8px 12px",
                }}
              >
                <ExternalLink size={15} />
                Abrir imagen PNG en pestana
              </a>
            )}

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
      )}
    </div>
  );
}
