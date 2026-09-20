import React, { useState } from "react";
import { AYUDANTIAS, getAyudantiaByCode } from "../data";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import PrivacyNotice from "../components/common/PrivacyNotice";
import { sanitizeNickname, sanitizeRoomCode, generateAnonymousAlias } from "../utils/sanitizers";
import { Monitor, Smartphone, BookOpen, QrCode, Shuffle } from "lucide-react";

export default function HubScreen({ onStartHost, onJoinPlayer, onStartSolo, initialRoomCode = "" }) {
  const matchingAyudantia = initialRoomCode ? getAyudantiaByCode(initialRoomCode) : null;

  const [selectedAyudantiaId, setSelectedAyudantiaId] = useState(
    matchingAyudantia ? matchingAyudantia.id : AYUDANTIAS[0].id
  );
  const [nickname, setNickname] = useState(() => (initialRoomCode ? generateAnonymousAlias() : ""));
  const [roomCode, setRoomCode] = useState(initialRoomCode || AYUDANTIAS[0].code);
  const [validationError, setValidationError] = useState("");

  const activeAyudantia = AYUDANTIAS.find((a) => a.id === selectedAyudantiaId) || AYUDANTIAS[0];



  const handlePlayerJoin = (e) => {
    e.preventDefault();
    setValidationError("");
    const cleanNick = sanitizeNickname(nickname);
    const cleanCode = sanitizeRoomCode(roomCode);

    if (!cleanNick || cleanNick.trim().length < 2) {
      setValidationError("Por favor ingresa un apodo valido de al menos 2 caracteres.");
      return;
    }

    if (!cleanCode) {
      setValidationError("El codigo de sala no puede estar vacio.");
      return;
    }

    onJoinPlayer({ name: cleanNick, roomCode: cleanCode, ayudantia: activeAyudantia });
  };

  const handleHostStart = () => {
    onStartHost({ ayudantia: activeAyudantia, roomCode: activeAyudantia.code });
  };

  const handleSoloStart = () => {
    onStartSolo({ ayudantia: activeAyudantia });
  };

  const handleRandomAlias = () => {
    setNickname(generateAnonymousAlias());
    setValidationError("");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 20px" }}>
      <header style={{ textAlign: "center", marginBottom: "36px" }}>
        <Badge variant="navy" style={{ marginBottom: "12px" }}>
          Ingenieria de Software 2026-02
        </Badge>
        <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#1E2761", letterSpacing: "-0.5px" }}>
          Plataforma de Quizzes de Ayudantia
        </h1>
        <p style={{ color: "#64748B", fontSize: "16px", maxWidth: "640px", margin: "8px auto 0" }}>
          Actividades interactivas en tiempo real para sesiones de ayudantia, con soporte para proyeccion en aula y practica individual.
        </p>
      </header>

      {initialRoomCode && (
        <div style={{ marginBottom: "24px", padding: "16px 20px", backgroundColor: "#FEF3C7", borderRadius: "12px", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: "12px" }}>
          <QrCode size={24} color="#D97706" />
          <div>
            <span style={{ fontWeight: 800, color: "#92400E", fontSize: "15px", display: "block" }}>
              Te estas uniendo mediante Codigo QR a la Sala: {initialRoomCode}
            </span>
            <span style={{ fontSize: "13px", color: "#B45309" }}>
              Verifica o personaliza tu apodo a continuacion y presiona Entrar a la Sala.
            </span>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "28px" }}>
        <Card title="Seleccionar Ayudantia" subtitle="Elige el modulo tematico sobre el cual se realizara el quiz">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginTop: "10px" }}>
            {AYUDANTIAS.map((ay) => {
              const isSelected = ay.id === selectedAyudantiaId;
              return (
                <div
                  key={ay.id}
                  onClick={() => {
                    setSelectedAyudantiaId(ay.id);
                    setRoomCode(ay.code);
                  }}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid #1E2761" : "1px solid #E2E8F0",
                    backgroundColor: isSelected ? "#F8FAFC" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 700, color: "#1E2761", fontSize: "15px" }}>
                      Ayudantia N° {ay.number}
                    </span>
                    <Badge variant={isSelected ? "navy" : "neutral"}>
                      {ay.questions.length} preguntas
                    </Badge>
                  </div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
                    {ay.title}
                  </h4>
                  <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.4 }}>
                    {ay.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {/* Modo 1: Host / Proyector */}
        <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "4px", flex: 1 }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <Monitor size={22} color="#1E2761" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", marginBottom: "6px" }}>
              Modo Docente / Proyector
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: 1.5, marginBottom: "20px" }}>
              Crea la sala en pantalla grande con temporizador animado, recepcion de votos en vivo y podio de clasificacion.
            </p>
          </div>
          <Button variant="primary" fullWidth icon={Monitor} onClick={handleHostStart}>
            Iniciar como Host
          </Button>
        </Card>

        {/* Modo 2: Unirse como Estudiante */}
        <Card style={{ display: "flex", flexDirection: "column", height: "100%", border: initialRoomCode ? "2px solid #D97706" : "1px solid #E2E8F0" }}>
          <div style={{ padding: "4px", flex: 1 }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <Smartphone size={22} color="#D97706" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", marginBottom: "6px" }}>
              Unirse desde el Celular
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: 1.5, marginBottom: "16px" }}>
              Ingresa tu apodo o usa uno aleatorio, y entra a la sala para responder en vivo.
            </p>

            {validationError && (
              <div style={{ padding: "8px 12px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "6px", fontSize: "12px", marginBottom: "10px", fontWeight: 600 }}>
                {validationError}
              </div>
            )}

            <form onSubmit={handlePlayerJoin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Tu Apodo o Alias:
                </label>
                <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setValidationError("");
                    }}
                    placeholder="Ej: Estudiante-1234"
                    maxLength={15}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      boxSizing: "border-box",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRandomAlias}
                    style={{
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      padding: "0 14px",
                      backgroundColor: "#F1F5F9",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxSizing: "border-box",
                    }}
                    title="Generar alias anonimo aleatorio"
                  >
                    <Shuffle size={14} />
                    <span>Aleatorio</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Codigo de Sala:
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="AYUDANTIA2"
                  maxLength={12}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "14px",
                    fontFamily: "Consolas, monospace",
                    fontWeight: 700,
                    outline: "none",
                  }}
                />
              </div>

              <Button type="submit" variant="accent" fullWidth icon={Smartphone} style={{ marginTop: "8px" }}>
                Entrar a la Sala
              </Button>
            </form>
          </div>
        </Card>

        {/* Modo 3: Practica Individual */}
        <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "4px", flex: 1 }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <BookOpen size={22} color="#16A34A" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A", marginBottom: "6px" }}>
              Modo Practica Individual
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748B", lineHeight: 1.5, marginBottom: "20px" }}>
              Estudia y ejercita las 16 preguntas a tu propio ritmo con retroalimentacion inmediata y justificacion teorica.
            </p>
          </div>
          <Button variant="success" fullWidth icon={BookOpen} onClick={handleSoloStart}>
            Iniciar Practica Solo
          </Button>
        </Card>
      </div>

      <PrivacyNotice />
    </div>
  );
}
