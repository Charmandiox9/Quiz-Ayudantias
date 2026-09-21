import React, { useState } from "react";
import { BookOpen, Mail, Smartphone } from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { sanitizeNickname, sanitizeRoomCode, generateAnonymousAlias } from "../utils/sanitizers";

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  font: "inherit",
};

export default function TeacherAccessScreen({ onSendLink, onJoinPlayer, busy = false, notice = "", errorNotice = "" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState(generateAnonymousAlias());
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmail = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await onSendLink(email.trim());
      setMessage("Si la cuenta está habilitada, recibirás un enlace para entrar.");
    } catch (sendError) {
      setError(sendError.message || "No se pudo enviar el enlace. Inténtalo de nuevo.");
    }
  };

  const handleJoin = (event) => {
    event.preventDefault();
    const cleanName = sanitizeNickname(name);
    const cleanCode = sanitizeRoomCode(roomCode);
    if (!cleanName || cleanName.trim().length < 2 || !cleanCode) {
      setError("Ingresa un apodo válido y el código de la sala.");
      return;
    }
    onJoinPlayer({ name: cleanName, roomCode: cleanCode });
  };

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", padding: "32px 18px", display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(100%, 520px)", display: "grid", gap: 16 }}>
        <header style={{ textAlign: "center", padding: "8px 12px" }}>
          <BookOpen size={30} color="#1E2761" />
          <h1 style={{ margin: "8px 0 4px", color: "#1E2761" }}>Quiz Ayudantías</h1>
          <p style={{ margin: 0, color: "#64748B" }}>Entra como profesor o únete a una sala como estudiante.</p>
        </header>

        <Card title="Espacio docente" subtitle="Acceso privado para profesores habilitados">
          <form onSubmit={handleEmail} style={{ display: "grid", gap: 12 }}>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Correo institucional
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="profesor@universidad.cl" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <Button type="submit" icon={Mail} disabled={busy} fullWidth>{busy ? "Enviando…" : "Enviar enlace de acceso"}</Button>
            <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>No hay registro público. Solo las cuentas habilitadas por el administrador pueden administrar asignaturas y quizzes.</p>
          </form>
        </Card>

        <Card title="Unirse a una sala" subtitle="Los estudiantes no necesitan una cuenta">
          <form onSubmit={handleJoin} style={{ display: "grid", gap: 12 }}>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Apodo
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={15} style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Código de sala
              <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} maxLength={12} placeholder="Ej. Q7AC92F1" style={{ ...fieldStyle, marginTop: 5, fontFamily: "Consolas, monospace" }} />
            </label>
            <Button type="submit" variant="accent" icon={Smartphone} fullWidth>Entrar a la sala</Button>
          </form>
        </Card>

        {(message || notice) && <p role="status" style={{ margin: 0, color: "#166534", textAlign: "center", fontSize: 13 }}>{message || notice}</p>}
        {errorNotice && <p role="alert" style={{ margin: 0, color: "#B91C1C", textAlign: "center", fontSize: 13 }}>{errorNotice}</p>}
        {error && <p role="alert" style={{ margin: 0, color: "#B91C1C", textAlign: "center", fontSize: 13 }}>{error}</p>}
      </div>
    </main>
  );
}
