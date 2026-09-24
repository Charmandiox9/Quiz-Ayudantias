import React, { useState } from "react";
import { BookOpen, Mail, Play, Smartphone } from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { sanitizeNickname, sanitizeRoomCode, generateAnonymousAlias } from "../utils/sanitizers";
import type { CSSProperties, FormEvent } from "react";
import type { QuizCatalog, QuizDefinition } from "../types";

const fieldStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  font: "inherit",
};

interface TeacherAccessScreenProps {
  onSendLink: (email: string) => Promise<void>;
  onJoinPlayer: (player: { name: string; roomCode: string }) => void;
  onStartSolo: (session: { ayudantia: QuizDefinition }) => void;
  publicCatalog: QuizCatalog | null;
  publicCatalogError?: string;
  busy?: boolean;
  notice?: string;
  errorNotice?: string;
}

export default function TeacherAccessScreen({ onSendLink, onJoinPlayer, onStartSolo, publicCatalog, publicCatalogError = "", busy = false, notice = "", errorNotice = "" }: TeacherAccessScreenProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState(generateAnonymousAlias());
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await onSendLink(email.trim());
      setMessage("Si la cuenta está habilitada, recibirás un enlace para entrar.");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "No se pudo enviar el enlace. Inténtalo de nuevo.");
    }
  };

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
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
      <div style={{ width: "min(100%, 920px)", display: "grid", gap: 16 }}>
        <header style={{ textAlign: "center", padding: "8px 12px" }}>
          <BookOpen size={30} color="#1E2761" />
          <h1 style={{ margin: "8px 0 4px", color: "#1E2761" }}>Quiz Ayudantías</h1>
          <p style={{ margin: 0, color: "#64748B" }}>Practica por asignatura o únete a una sala en vivo.</p>
        </header>

        <Card title="Practicar quizzes" subtitle="Elige una asignatura y luego un quiz disponible">
          {!publicCatalog && !publicCatalogError && <p role="status" style={{ margin: 0, color: "#64748B" }}>Cargando prácticas…</p>}
          {publicCatalogError && <p role="alert" style={{ margin: 0, color: "#B91C1C" }}>{publicCatalogError}</p>}
          {publicCatalog?.subjects.length === 0 && <p style={{ margin: 0, color: "#64748B" }}>Todavía no hay quizzes publicados para practicar.</p>}
          <div style={{ display: "grid", gap: 18 }}>
            {publicCatalog?.subjects.map((subject) => (
              <section key={subject.id} aria-labelledby={`practice-subject-${subject.id}`}>
                <div style={{ marginBottom: 9 }}>
                  <h2 id={`practice-subject-${subject.id}`} style={{ margin: 0, color: "#1E2761", fontSize: 18 }}>{subject.name}</h2>
                  <p style={{ margin: "3px 0 0", color: "#64748B", fontSize: 12 }}>{[subject.code, subject.description].filter(Boolean).join(" · ")}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
                  {subject.quizzes.map((quiz) => (
                    <article key={quiz.id} style={{ padding: 14, border: "1px solid #E2E8F0", borderRadius: 10, background: "#F8FAFC", display: "grid", gap: 10 }}>
                      <div>
                        <h3 style={{ margin: 0, color: "#0F172A", fontSize: 15 }}>{quiz.title}</h3>
                        <p style={{ margin: "5px 0 0", color: "#64748B", fontSize: 12 }}>{quiz.description || `${quiz.questions.length} preguntas`}</p>
                      </div>
                      <Button variant="secondary" size="sm" icon={Play} onClick={() => onStartSolo({ ayudantia: { ...quiz, courseLabel: [subject.name, subject.code].filter(Boolean).join(" • "), sealLogoUrl: subject.sealLogoUrl || "" } })}>Practicar</Button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
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

        <Card title="Espacio docente" subtitle="Acceso privado para profesores habilitados">
          <form onSubmit={handleEmail} style={{ display: "grid", gap: 12 }}>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Correo institucional
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="profesor@universidad.cl" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <Button type="submit" icon={Mail} disabled={busy} fullWidth>{busy ? "Enviando…" : "Enviar enlace de acceso"}</Button>
            <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>No hay registro público. Solo las cuentas habilitadas por el administrador pueden administrar asignaturas y quizzes.</p>
          </form>
        </Card>
        </div>

        {(message || notice) && <p role="status" style={{ margin: 0, color: "#166534", textAlign: "center", fontSize: 13 }}>{message || notice}</p>}
        {errorNotice && <p role="alert" style={{ margin: 0, color: "#B91C1C", textAlign: "center", fontSize: 13 }}>{errorNotice}</p>}
        {error && <p role="alert" style={{ margin: 0, color: "#B91C1C", textAlign: "center", fontSize: 13 }}>{error}</p>}
      </div>
    </main>
  );
}
