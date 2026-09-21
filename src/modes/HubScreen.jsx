import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addQuiz,
  addSubject,
  archiveQuiz,
  createQuiz,
  createSubject,
  loadQuizCatalog,
  publishQuiz,
  restoreQuiz,
  saveQuizCatalog,
} from "../data/quizCatalog";
import { AYUDANTIAS } from "../data";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import PrivacyNotice from "../components/common/PrivacyNotice";
import { sanitizeNickname, sanitizeRoomCode, generateAnonymousAlias } from "../utils/sanitizers";
import {
  BookOpen,
  Archive,
  Check,
  CirclePlus,
  Monitor,
  Plus,
  RotateCcw,
  Smartphone,
  Upload,
  X,
} from "lucide-react";

const newQuestion = () => ({
  type: "single_choice",
  prompt: "",
  topic: "General",
  options: ["", "", "", ""],
  correctOption: "0",
  correctOptions: ["0"],
  explanation: "",
});

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #CBD5E1",
  borderRadius: "8px",
  font: "inherit",
};

function Modal({ title, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      style={{
        width: "min(760px, calc(100% - 36px))",
        maxHeight: "min(90vh, 900px)",
        margin: "auto",
        padding: 0,
        overflow: "auto",
        background: "#FFFFFF",
        border: 0,
        borderRadius: "16px",
        boxShadow: "0 24px 80px rgb(15 23 42 / 24%)",
      }}
    >
      <header
        style={{
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <h2 style={{ margin: 0, color: "#1E2761", fontSize: "20px" }}>{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{ border: 0, background: "transparent", cursor: "pointer", padding: 6 }}
        >
          <X size={20} />
        </button>
      </header>
      <div style={{ padding: "22px" }}>{children}</div>
    </dialog>
  );
}

export default function HubScreen({
  onStartHost,
  onJoinPlayer,
  onStartSolo,
  initialRoomCode = "",
  catalog: remoteCatalog,
  onCatalogChange,
  teacherEmail = "",
  onSignOut,
}) {
  const [localCatalog, setLocalCatalog] = useState(loadQuizCatalog);
  const catalog = remoteCatalog || localCatalog;
  const [selectedSubjectId, setSelectedSubjectId] = useState(catalog.subjects[0]?.id || "");
  const [modal, setModal] = useState(null);
  const [formError, setFormError] = useState("");
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", description: "" });
  const [quizForm, setQuizForm] = useState({ title: "", description: "", questions: [newQuestion()] });
  const [nickname, setNickname] = useState(() => (initialRoomCode ? generateAnonymousAlias() : ""));
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [joinError, setJoinError] = useState("");
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedSubject = useMemo(
    () => catalog.subjects.find((subject) => subject.id === selectedSubjectId) || catalog.subjects[0],
    [catalog.subjects, selectedSubjectId]
  );

  const commitCatalog = async (nextCatalog) => {
    setPageError("");
    setSaving(true);
    try {
      if (onCatalogChange) await onCatalogChange(nextCatalog);
      else {
        setLocalCatalog(nextCatalog);
        saveQuizCatalog(nextCatalog);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubject = async (event) => {
    event.preventDefault();
    setFormError("");
    try {
      const subject = createSubject(subjectForm);
      const nextCatalog = addSubject(catalog, subject);
      await commitCatalog(nextCatalog);
      setSelectedSubjectId(subject.id);
      setSubjectForm({ name: "", code: "", description: "" });
      setModal(null);
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    setFormError("");
    try {
      const quiz = createQuiz({ ...quizForm, subjectId: selectedSubject.id });
      await commitCatalog(addQuiz(catalog, selectedSubject.id, quiz));
      setQuizForm({ title: "", description: "", questions: [newQuestion()] });
      setModal(null);
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handlePublishQuiz = async (quizId) => {
    try {
      await commitCatalog(publishQuiz(catalog, quizId));
    } catch (error) {
      setPageError(`No se pudo publicar el quiz: ${error.message}`);
    }
  };

  const handleQuizStatusChange = async (quizId, transition) => {
    try {
      const nextCatalog = transition === "archive"
        ? archiveQuiz(catalog, quizId)
        : restoreQuiz(catalog, quizId);
      await commitCatalog(nextCatalog);
    } catch (error) {
      setPageError(`No se pudo actualizar el quiz: ${error.message}`);
    }
  };

  const handleJoin = (event) => {
    event.preventDefault();
    setJoinError("");
    const cleanNick = sanitizeNickname(nickname);
    const cleanCode = sanitizeRoomCode(roomCode);
    if (!cleanCode || !cleanNick || cleanNick.trim().length < 2) {
      setJoinError("Ingresa un código de sala y un apodo válido.");
      return;
    }
    const matchingQuiz = AYUDANTIAS.find(
      (quiz) => quiz.code === cleanCode || quiz.altCodes?.includes(cleanCode)
    );
    onJoinPlayer({ name: cleanNick, roomCode: cleanCode, ayudantia: matchingQuiz || AYUDANTIAS[0] });
  };

  const startHost = (quiz) => {
    const roomCode = `Q${crypto.randomUUID().replaceAll("-", "").slice(0, 7).toUpperCase()}`;
    onStartHost({ ayudantia: quiz, roomCode });
  };

  const openQuizCreator = () => {
    setFormError("");
    setQuizForm({ title: "", description: "", questions: [newQuestion()] });
    setModal("quiz");
  };

  const updateQuestion = (questionIndex, field, value, optionIndex = null) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;
        if (field === "option") {
          return {
            ...question,
            options: question.options.map((option, itemIndex) =>
              itemIndex === optionIndex ? value : option
            ),
          };
        }
        if (field === "correctOptions") {
          const option = String(optionIndex);
          const correctOptions = value
            ? [...question.correctOptions.filter((item) => item !== option), option]
            : question.correctOptions.filter((item) => item !== option);
          return { ...question, correctOptions };
        }
        return { ...question, [field]: value };
      }),
    }));
  };

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", padding: "32px 18px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 26,
          }}
        >
          <div>
            <Badge variant="navy" style={{ marginBottom: 10 }}>Espacio docente</Badge>
            <h1 style={{ margin: 0, color: "#1E2761", fontSize: "clamp(27px, 4vw, 36px)" }}>
              Asignaturas y quizzes
            </h1>
            <p style={{ color: "#64748B", margin: "8px 0 0", maxWidth: 620 }}>
              Organiza tus asignaturas, prepara quizzes y publícalos para iniciar una sesión o dejar que tus estudiantes practiquen.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {teacherEmail && <span style={{ color: "#64748B", fontSize: 12 }}>{teacherEmail}</span>}
            {onSignOut && <Button variant="secondary" size="sm" onClick={onSignOut}>Cerrar sesión</Button>}
            <Button variant="primary" icon={CirclePlus} disabled={saving} onClick={() => { setFormError(""); setModal("subject"); }}>
              Nueva asignatura
            </Button>
          </div>
        </header>

        {pageError && <p role="alert" style={{ padding: 12, background: "#FEF2F2", color: "#B91C1C", borderRadius: 8 }}>{pageError}</p>}
        {saving && <p role="status" style={{ color: "#64748B", fontSize: 13 }}>Guardando cambios en la nube…</p>}

        <div className="teacher-library-layout">
          <Card title="Mis asignaturas" subtitle={`${catalog.subjects.length} asignatura${catalog.subjects.length === 1 ? "" : "s"}`}>
            <div style={{ display: "grid", gap: 8 }}>
              {catalog.subjects.map((subject) => {
                const selected = subject.id === selectedSubject?.id;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subject.id)}
                    aria-pressed={selected}
                    style={{
                      padding: "13px 14px",
                      textAlign: "left",
                      borderRadius: 10,
                      border: selected ? "1.5px solid #1E2761" : "1px solid #E2E8F0",
                      background: selected ? "#EEF2FF" : "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ display: "block", color: "#1E2761", fontWeight: 750 }}>{subject.name}</span>
                    <span style={{ display: "block", color: "#64748B", fontSize: 12, marginTop: 4 }}>
                      {subject.quizzes.length} quizzes{subject.code ? ` · ${subject.code}` : ""}
                    </span>
                  </button>
                );
              })}
              {catalog.subjects.length === 0 && <p style={{ color: "#64748B", fontSize: 14 }}>Aún no hay asignaturas.</p>}
            </div>
          </Card>

          <section>
            {selectedSubject ? (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap", margin: "4px 0 16px" }}>
                  <div>
                    <p style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 5px" }}>Asignatura</p>
                    <h2 style={{ color: "#0F172A", fontSize: 23, margin: 0 }}>{selectedSubject.name}</h2>
                    {selectedSubject.description && <p style={{ color: "#64748B", margin: "5px 0 0" }}>{selectedSubject.description}</p>}
                  </div>
                  <Button variant="accent" icon={Plus} onClick={openQuizCreator}>Crear quiz</Button>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {selectedSubject.quizzes.map((quiz) => (
                    <Card key={quiz.id} style={{ overflow: "visible" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 220, flex: "1 1 300px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 7 }}>
                            <h3 style={{ margin: 0, color: "#0F172A", fontSize: 17 }}>{quiz.title}</h3>
                            <Badge variant={quiz.status === "published" ? "success" : quiz.status === "archived" ? "neutral" : "amber"}>
                              {quiz.status === "published" ? "Publicado" : quiz.status === "archived" ? "Archivado" : "Borrador"}
                            </Badge>
                          </div>
                          <p style={{ margin: "0 0 7px", color: "#64748B", fontSize: 14 }}>{quiz.description || quiz.subtitle || "Sin descripción"}</p>
                          <span style={{ color: "#64748B", fontSize: 12 }}>
                            {quiz.questions.length} preguntas{quiz.version ? ` · versión ${quiz.version}` : ""}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {quiz.status === "draft" ? (
                            <Button size="sm" variant="outline" icon={Upload} disabled={saving} onClick={() => handlePublishQuiz(quiz.id)}>Publicar</Button>
                          ) : quiz.status === "archived" ? (
                            <Button size="sm" variant="outline" icon={RotateCcw} disabled={saving} onClick={() => handleQuizStatusChange(quiz.id, "restore")}>Restaurar como borrador</Button>
                          ) : (
                            <>
                              <Button size="sm" variant="primary" icon={Monitor} onClick={() => startHost(quiz)}>Hostear</Button>
                              <Button size="sm" variant="secondary" icon={BookOpen} onClick={() => onStartSolo({ ayudantia: quiz })}>Practicar</Button>
                              <Button size="sm" variant="outline" icon={Archive} disabled={saving} onClick={() => handleQuizStatusChange(quiz.id, "archive")}>Archivar</Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {selectedSubject.quizzes.length === 0 && (
                    <Card style={{ textAlign: "center", padding: "28px 18px" }}>
                      <BookOpen size={30} color="#94A3B8" />
                      <h3 style={{ color: "#1E2761", margin: "10px 0 4px" }}>Todavía no hay quizzes</h3>
                      <p style={{ color: "#64748B", margin: "0 0 16px" }}>Crea el primero para esta asignatura.</p>
                      <Button variant="accent" icon={Plus} onClick={openQuizCreator}>Crear quiz</Button>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card style={{ textAlign: "center", padding: 34 }}>
                <BookOpen size={34} color="#64748B" />
                <h2 style={{ color: "#1E2761" }}>Crea tu primera asignatura</h2>
                <Button icon={Plus} onClick={() => setModal("subject")}>Nueva asignatura</Button>
              </Card>
            )}
          </section>
        </div>

        <Card title="Unirse a una sala" subtitle="Para estudiantes que ingresan manualmente con un código" style={{ marginTop: 22 }}>
          <form onSubmit={handleJoin} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
            <label style={{ flex: "1 1 190px", color: "#475569", fontSize: 12, fontWeight: 700 }}>
              Apodo
              <input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Estudiante-1234" maxLength={15} style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ flex: "1 1 190px", color: "#475569", fontSize: 12, fontWeight: 700 }}>
              Código de sala
              <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} placeholder="Ej. Q7AC92F1" maxLength={12} style={{ ...fieldStyle, marginTop: 5, fontFamily: "Consolas, monospace" }} />
            </label>
            <Button type="submit" variant="accent" icon={Smartphone}>Entrar</Button>
            {joinError && <span role="alert" style={{ flexBasis: "100%", color: "#B91C1C", fontSize: 13 }}>{joinError}</span>}
          </form>
        </Card>
        <div style={{ marginTop: 18 }}><PrivacyNotice /></div>
      </div>

      {modal === "subject" && (
        <Modal title="Nueva asignatura" onClose={() => setModal(null)}>
          <form onSubmit={handleCreateSubject} style={{ display: "grid", gap: 14 }}>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Nombre *
              <input autoFocus required value={subjectForm.name} onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })} placeholder="Ej. Ingeniería de Software" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Código (opcional)
              <input value={subjectForm.code} onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value })} placeholder="Ej. INF-220" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Descripción (opcional)
              <textarea value={subjectForm.description} onChange={(event) => setSubjectForm({ ...subjectForm, description: event.target.value })} rows={3} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
            </label>
            {formError && <p role="alert" style={{ color: "#B91C1C", margin: 0 }}>{formError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
              <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
              <Button type="submit" icon={Check} disabled={saving}>{saving ? "Guardando…" : "Crear asignatura"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "quiz" && selectedSubject && (
        <Modal title={`Crear quiz · ${selectedSubject.name}`} onClose={() => setModal(null)}>
          <form onSubmit={handleCreateQuiz} style={{ display: "grid", gap: 16 }}>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Título del quiz *
              <input autoFocus required value={quizForm.title} onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })} placeholder="Ej. Repaso de principios SOLID" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Descripción
              <textarea value={quizForm.description} onChange={(event) => setQuizForm({ ...quizForm, description: event.target.value })} rows={2} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
            </label>

            {quizForm.questions.map((question, questionIndex) => (
              <fieldset key={questionIndex} style={{ border: "1px solid #CBD5E1", borderRadius: 12, padding: 15, display: "grid", gap: 12 }}>
                <legend style={{ padding: "0 7px", color: "#1E2761", fontWeight: 800 }}>Pregunta {questionIndex + 1}</legend>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Tipo de pregunta
                  <select
                    value={question.type}
                    onChange={(event) => {
                      const type = event.target.value;
                      setQuizForm((current) => ({
                        ...current,
                        questions: current.questions.map((item, index) => index !== questionIndex ? item : ({
                          ...item,
                          type,
                          options: type === "true_false" ? ["Verdadero", "Falso"] : item.type === "true_false" ? ["", "", "", ""] : item.options,
                          correctOption: "0",
                          correctOptions: ["0"],
                        })),
                      }));
                    }}
                    style={{ ...fieldStyle, marginTop: 5, background: "#F8FAFC" }}
                  >
                    <option value="single_choice">Selección única</option>
                    <option value="true_false">Verdadero / Falso</option>
                    <option value="multiple_select">Selección múltiple</option>
                  </select>
                </label>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Enunciado *
                  <textarea required value={question.prompt} onChange={(event) => updateQuestion(questionIndex, "prompt", event.target.value)} rows={2} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
                </label>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Tema
                  <input value={question.topic} onChange={(event) => updateQuestion(questionIndex, "topic", event.target.value)} style={{ ...fieldStyle, marginTop: 5 }} />
                </label>
                <div style={{ display: "grid", gap: 8 }}>
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 9, alignItems: "center", color: "#475569", fontSize: 13 }}>
                      <input
                        type={question.type === "multiple_select" ? "checkbox" : "radio"}
                        name={`correct-${questionIndex}`}
                        checked={question.type === "multiple_select" ? question.correctOptions.includes(String(optionIndex)) : question.correctOption === String(optionIndex)}
                        onChange={(event) => question.type === "multiple_select"
                          ? updateQuestion(questionIndex, "correctOptions", event.target.checked, optionIndex)
                          : updateQuestion(questionIndex, "correctOption", String(optionIndex))}
                        aria-label={`Marcar alternativa ${optionIndex + 1} correcta`}
                      />
                      <input required readOnly={question.type === "true_false"} value={option} onChange={(event) => updateQuestion(questionIndex, "option", event.target.value, optionIndex)} placeholder={`Alternativa ${optionIndex + 1}`} style={{ ...fieldStyle, ...(question.type === "true_false" ? { background: "#F1F5F9" } : {}) }} />
                    </label>
                  ))}
                </div>
                <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>{question.type === "multiple_select" ? "Marca todas las alternativas correctas." : "Marca el círculo junto a la alternativa correcta."}</p>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Explicación (opcional)
                  <textarea value={question.explanation} onChange={(event) => updateQuestion(questionIndex, "explanation", event.target.value)} rows={2} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
                </label>
                {quizForm.questions.length > 1 && (
                  <button type="button" onClick={() => setQuizForm((current) => ({ ...current, questions: current.questions.filter((_, index) => index !== questionIndex) }))} style={{ justifySelf: "start", border: 0, background: "transparent", color: "#B91C1C", padding: 0, cursor: "pointer" }}>Eliminar pregunta</button>
                )}
              </fieldset>
            ))}

            <Button type="button" variant="secondary" icon={Plus} onClick={() => setQuizForm((current) => ({ ...current, questions: [...current.questions, newQuestion()] }))}>Agregar pregunta</Button>
            <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>La selección múltiple se corrige con puntaje completo solo cuando se eligen todas las respuestas correctas y ninguna incorrecta.</p>
            {formError && <p role="alert" style={{ color: "#B91C1C", margin: 0 }}>{formError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
              <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
              <Button type="submit" icon={Check} disabled={saving}>{saving ? "Guardando…" : "Guardar borrador"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
