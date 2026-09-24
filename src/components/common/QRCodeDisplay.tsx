import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Copy, Check } from "lucide-react";

interface QRCodeDisplayProps {
  value?: string;
  url?: string;
  pin?: string;
  size?: number;
  showCopy?: boolean;
  showUrl?: boolean;
}

export default function QRCodeDisplay({
  value,
  url,
  pin,
  size = 200,
  showCopy = false,
  showUrl = false,
}: QRCodeDisplayProps) {
  const targetUrl = value || url;
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!targetUrl) return;

    QRCode.toDataURL(targetUrl, {
      width: size * 2,
      margin: 1,
      color: {
        dark: "#1E2761",
        light: "#FFFFFF",
      },
    })
      .then((dataUri) => {
        setQrDataUrl(dataUri);
      })
      .catch((err) => {
        console.error("Error al generar codigo QR:", err);
      });
  }, [targetUrl, size]);

  const handleCopy = async () => {
    if (!targetUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = targetUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar enlace:", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
      }}
    >
      <div
        style={{
          width: size + "px",
          height: size + "px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #1E2761",
          padding: "8px",
          marginBottom: "14px",
        }}
      >
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Codigo QR para unirse a la sala de quiz"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ fontSize: "12px", color: "#64748B" }}>Generando QR...</div>
        )}
      </div>

      {pin && (
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", display: "block" }}>
            Codigo PIN
          </span>
          <span style={{ fontFamily: "Consolas, monospace", fontSize: "28px", fontWeight: 900, color: "#1E2761", letterSpacing: "2px" }}>
            {pin}
          </span>
        </div>
      )}

      {showUrl && (
        <div
          style={{
            maxWidth: "280px",
            fontSize: "12px",
            color: "#475569",
            backgroundColor: "#F8FAFC",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
            wordBreak: "break-all",
            textAlign: "center",
            fontFamily: "Consolas, monospace",
            marginBottom: "12px",
          }}
        >
          {targetUrl}
        </div>
      )}

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: copied ? "1px solid #10B981" : "1px solid #CBD5E1",
            backgroundColor: copied ? "#ECFDF5" : "#F1F5F9",
            color: copied ? "#047857" : "#1E2761",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {copied ? <Check size={15} color="#047857" /> : <Copy size={15} color="#1E2761" />}
          <span>{copied ? "Enlace Copiado" : "Copiar Enlace Directo"}</span>
        </button>
      )}
    </div>
  );
}
