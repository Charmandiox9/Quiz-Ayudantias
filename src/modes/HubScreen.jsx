import React, { useEffect, useMemo, useRef, useState } from "react";
import { sileo } from "sileo";
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
  updateQuiz,
} from "../data/quizCatalog";
import { AYUDANTIAS } from "../data";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import MarkdownContent from "../components/common/MarkdownContent";
import Badge from "../components/common/Badge";
import PrivacyNotice from "../components/common/PrivacyNotice";
import { sanitizeNickname, sanitizeRoomCode, generateAnonymousAlias } from "../utils/sanitizers";
import { uploadImageToR2 } from "../utils/questionImages";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Archive,
  Check,
  CirclePlus,
  Monitor,
  Plus,
  RotateCcw,
  Smartphone,
  Upload,
  ImagePlus,
  Pencil,
  X,
} from "lucide-react";

const newQuestion = () => ({
  type: "single_choice",
  prompt: "",
  topic: "General",
  options: ["", "", "", ""],
  correctOption: "0",
  correctOptions: ["0"],
  acceptedAnswers: "",
  imageUrl: "",
  explanation: "",
});
const emptyQuizForm = () => ({ title: "", description: "", cardTitle: "", cardSubtitle: "", cardImage: "", questions: [newQuestion()] });

function quizToForm(quiz) {
  return {
    title: quiz.title || "",
    description: quiz.description || quiz.subtitle || "",
    cardTitle: quiz.cardTitle || "",
    cardSubtitle: quiz.cardSubtitle || "",
    cardImage: quiz.cardImage || "",
    questions: (quiz.questions || []).map((question) => ({
      type: question.type || "single_choice",
      prompt: question.q || "",
      topic: question.topic || "General",
      options: [...(question.opts || [])],
      correctOption: String(question.ans ?? "0"),
      correctOptions: Array.isArray(question.ans) ? question.ans.map(String) : ["0"],
      acceptedAnswers: Array.isArray(question.ans) ? question.ans.join("\n") : "",
      imageUrl: question.image || "",
      explanation: question.exp || "",
    })),
  };
}

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
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", description: "", sealLogoUrl: "" });
  const [quizForm, setQuizForm] = useState(emptyQuizForm);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [nickname, setNickname] = useState(() => (initialRoomCode ? generateAnonymousAlias() : ""));
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [joinError, setJoinError] = useState("");
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);
  const [uploadingSubjectSeal, setUploadingSubjectSeal] = useState(false);
  const [uploadingCardImage, setUploadingCardImage] = useState(false);
  const [failedSubjectSealUrl, setFailedSubjectSealUrl] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const selectedSubject = useMemo(
    () => catalog.subjects.find((subject) => subject.id === selectedSubjectId) || catalog.subjects[0],
    [catalog.subjects, selectedSubjectId]
  );
  const isSubjectSealPreviewFailed = Boolean(subjectForm.sealLogoUrl && failedSubjectSealUrl === subjectForm.sealLogoUrl);
  const subjectSealPreviewSrc = isSubjectSealPreviewFailed ? "/assets/seal_logo.jpg" : subjectForm.sealLogoUrl;

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

  const handleSaveSubject = async (event) => {
    event.preventDefault();
    setFormError("");
    try {
      if (!subjectForm.name.trim()) throw new Error("La asignatura necesita un nombre.");
      const nextCatalog = editingSubjectId
        ? {
            ...catalog,
            subjects: catalog.subjects.map((subject) => subject.id === editingSubjectId
              ? { ...subject, ...subjectForm, code: subjectForm.code.trim().toUpperCase(), name: subjectForm.name.trim(), description: subjectForm.description.trim() }
              : subject),
          }
        : addSubject(catalog, createSubject(subjectForm));
      await commitCatalog(nextCatalog);
      if (!editingSubjectId) setSelectedSubjectId(nextCatalog.subjects.at(-1).id);
      setSubjectForm({ name: "", code: "", description: "", sealLogoUrl: "" });
      setEditingSubjectId(null);
      setModal(null);
      sileo.success({ title: editingSubjectId ? "Asignatura actualizada" : "Asignatura creada" });
    } catch (error) {
      setFormError(error.message);
      sileo.error({ title: "No se pudo guardar la asignatura", description: error.message });
    }
  };

  const openSubjectEditor = (subject = null) => {
    setFormError("");
    setFailedSubjectSealUrl("");
    setEditingSubjectId(subject?.id || null);
    setSubjectForm(subject
      ? { name: subject.name, code: subject.code || "", description: subject.description || "", sealLogoUrl: subject.sealLogoUrl || "" }
      : { name: "", code: "", description: "", sealLogoUrl: "" });
    setModal("subject");
  };

  const handleSubjectSealUpload = async (file) => {
    if (!file) return;
    setFormError("");
    setUploadingSubjectSeal(true);
    setFailedSubjectSealUrl("");
    try {
      const sealLogoUrl = await uploadImageToR2(file, "subject-seal");
      setSubjectForm((current) => ({ ...current, sealLogoUrl }));
      sileo.success({ title: "Estampado cargado" });
    } catch (error) {
      const message = error.message || "No se pudo cargar el estampado.";
      setFormError(message);
      sileo.error({ title: "Error al cargar el estampado", description: message });
    } finally {
      setUploadingSubjectSeal(false);
    }
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    setFormError("");
    try {
      if (editingQuizId) {
        await commitCatalog(updateQuiz(catalog, editingQuizId, quizForm));
      } else {
        const quiz = createQuiz({ ...quizForm, subjectId: selectedSubject.id });
        await commitCatalog(addQuiz(catalog, selectedSubject.id, quiz));
      }
      setQuizForm(emptyQuizForm());
      setEditingQuizId(null);
      setModal(null);
      sileo.success({
        title: editingQuizId ? "Quiz actualizado" : "Quiz guardado",
        description: editingQuizId
          ? "Se conservaron su estado y código de acceso."
          : "Quedó guardado como borrador.",
      });
    } catch (error) {
      setFormError(error.message);
      sileo.error({ title: editingQuizId ? "No se pudo actualizar el quiz" : "No se pudo guardar el quiz", description: error.message });
    }
  };

  const handlePublishQuiz = async (quizId) => {
    try {
      await commitCatalog(publishQuiz(catalog, quizId));
      sileo.success({ title: "Quiz publicado", description: "Ya está disponible para iniciar o practicar." });
    } catch (error) {
      const message = `No se pudo publicar el quiz: ${error.message}`;
      setPageError(message);
      sileo.error({ title: "No se pudo publicar", description: error.message });
    }
  };

  const handleQuizStatusChange = async (quizId, transition) => {
    try {
      const nextCatalog = transition === "archive"
        ? archiveQuiz(catalog, quizId)
        : restoreQuiz(catalog, quizId);
      await commitCatalog(nextCatalog);
      sileo.success({ title: transition === "archive" ? "Quiz archivado" : "Quiz restaurado" });
    } catch (error) {
      const message = `No se pudo actualizar el quiz: ${error.message}`;
      setPageError(message);
      sileo.error({ title: "No se pudo actualizar el quiz", description: error.message });
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
    onStartHost({ ayudantia: { ...quiz, sealLogoUrl: selectedSubject.sealLogoUrl || "" }, roomCode });
  };

  const openQuizCreator = () => {
    setFormError("");
    setEditingQuizId(null);
    setQuizForm(emptyQuizForm());
    setModal("quiz");
  };

  const openQuizEditor = (quiz) => {
    setFormError("");
    setEditingQuizId(quiz.id);
    setQuizForm(quizToForm(quiz));
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

  const handleImageUpload = async (questionIndex, file) => {
    if (!file) return;
    setFormError("");
    setUploadingImageIndex(questionIndex);
    try {
      const imageUrl = await uploadImageToR2(file);
      updateQuestion(questionIndex, "imageUrl", imageUrl);
      sileo.success({ title: "Imagen agregada a la pregunta" });
    } catch (error) {
      const message = error.message || "No se pudo cargar la imagen.";
      setFormError(message);
      sileo.error({ title: "No se pudo cargar la imagen", description: message });
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleCardImageUpload = async (file) => {
    if (!file) return;
    setFormError("");
    setUploadingCardImage(true);
    try {
      const cardImage = await uploadImageToR2(file, "quiz-card");
      setQuizForm((current) => ({ ...current, cardImage }));
      sileo.success({ title: "Imagen de tarjeta cargada" });
    } catch (error) {
      const message = error.message || "No se pudo cargar la imagen de la tarjeta.";
      setFormError(message);
      sileo.error({ title: "No se pudo cargar la imagen de tarjeta", description: message });
    } finally {
      setUploadingCardImage(false);
    }
  };

  const moveOption = (questionIndex, optionIndex, direction) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;
        const targetIndex = optionIndex + direction;
        if (targetIndex < 0 || targetIndex >= question.options.length) return question;
        const options = [...question.options];
        [options[optionIndex], options[targetIndex]] = [options[targetIndex], options[optionIndex]];
        return { ...question, options };
      }),
    }));
  };

  const removeOrderingOption = (questionIndex, optionIndex) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => index === questionIndex
        ? { ...question, options: question.options.filter((_, itemIndex) => itemIndex !== optionIndex) }
        : question),
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
            <Button variant="primary" icon={CirclePlus} disabled={saving} onClick={() => openSubjectEditor()}>
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button variant="outline" size="sm" icon={Pencil} disabled={saving} onClick={() => openSubjectEditor(selectedSubject)}>Editar asignatura</Button>
                    <Button variant="accent" icon={Plus} onClick={openQuizCreator}>Crear quiz</Button>
                  </div>
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
                          <Button size="sm" variant="outline" icon={Pencil} disabled={saving} onClick={() => openQuizEditor(quiz)}>Editar</Button>
                          {quiz.status === "draft" ? (
                            <Button size="sm" variant="outline" icon={Upload} disabled={saving} onClick={() => handlePublishQuiz(quiz.id)}>Publicar</Button>
                          ) : quiz.status === "archived" ? (
                            <Button size="sm" variant="outline" icon={RotateCcw} disabled={saving} onClick={() => handleQuizStatusChange(quiz.id, "restore")}>Restaurar como borrador</Button>
                          ) : (
                            <>
                              <Button size="sm" variant="primary" icon={Monitor} onClick={() => startHost(quiz)}>Hostear</Button>
                              <Button size="sm" variant="secondary" icon={BookOpen} onClick={() => onStartSolo({ ayudantia: { ...quiz, sealLogoUrl: selectedSubject.sealLogoUrl || "" } })}>Practicar</Button>
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
        <Modal title={editingSubjectId ? "Editar asignatura" : "Nueva asignatura"} onClose={() => setModal(null)}>
          <form onSubmit={handleSaveSubject} style={{ display: "grid", gap: 14 }}>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Nombre *
              <input autoFocus required value={subjectForm.name} onChange={(event) => setSubjectForm({ ...subjectForm, name: event.target.value })} placeholder="Ej. Ingeniería de Software" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Código (opcional)
              <input value={subjectForm.code} onChange={(event) => setSubjectForm({ ...subjectForm, code: event.target.value })} placeholder="Ej. INF-220" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Descripción (opcional)
              <textarea value={subjectForm.description} onChange={(event) => setSubjectForm({ ...subjectForm, description: event.target.value })} rows={3} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
            </label>
            <fieldset style={{ border: "1px solid #CBD5E1", borderRadius: 12, padding: 14, display: "grid", gap: 10 }}>
              <legend style={{ padding: "0 7px", color: "#1E2761", fontWeight: 800 }}>Estampado de las tarjetas de logro</legend>
              <p style={{ margin: 0, color: "#64748B", fontSize: 12, lineHeight: 1.5 }}>Se usará en las tarjetas de logro de todos los quizzes de esta asignatura. Sube una imagen con fondo transparente para mejores resultados. La URL pública del bucket debe ser un dominio r2.dev o personalizado, no el endpoint S3.</p>
              {subjectForm.sealLogoUrl && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ width: 76, height: 76, display: "grid", placeItems: "center", borderRadius: "50%", background: "radial-gradient(circle at 30% 25%, #C83E36, #7F1D1D 72%)", border: "3px solid #FCD34D", boxShadow: "0 5px 14px #7F1D1D33" }}>
                    <img
                      src={subjectSealPreviewSrc}
                      alt={isSubjectSealPreviewFailed ? "Sello predeterminado; el personalizado no se pudo cargar" : "Vista previa del estampado"}
                      onLoad={() => {
                        if (!isSubjectSealPreviewFailed) setFailedSubjectSealUrl("");
                      }}
                      onError={() => {
                        if (!isSubjectSealPreviewFailed) setFailedSubjectSealUrl(subjectForm.sealLogoUrl);
                      }}
                      style={{ width: 46, height: 46, objectFit: "contain" }}
                    />
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => setSubjectForm((current) => ({ ...current, sealLogoUrl: "" }))}>Usar sello predeterminado</Button>
                  {isSubjectSealPreviewFailed && <p role="alert" style={{ flexBasis: "100%", margin: 0, color: "#B91C1C", fontSize: 12 }}>No se pudo cargar desde R2. Configura R2_PUBLIC_BASE_URL con la URL pública del bucket (r2.dev o dominio personalizado), guarda la variable en Vercel, vuelve a desplegar y carga el sello otra vez.</p>}
                </div>
              )}
              <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>{uploadingSubjectSeal ? "Subiendo estampado…" : subjectForm.sealLogoUrl ? "Reemplazar estampado" : "Subir estampado personalizado"}
                <input type="file" accept="image/*" disabled={uploadingSubjectSeal} onChange={(event) => { handleSubjectSealUpload(event.target.files?.[0]); event.target.value = ""; }} style={{ display: "block", maxWidth: "100%", marginTop: 5, fontSize: 12, fontWeight: 400 }} aria-label="Subir estampado para esta asignatura" />
              </label>
            </fieldset>
            {formError && <p role="alert" style={{ color: "#B91C1C", margin: 0 }}>{formError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
              <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
              <Button type="submit" icon={Check} disabled={saving || uploadingSubjectSeal}>{saving ? "Guardando…" : editingSubjectId ? "Guardar cambios" : "Crear asignatura"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "quiz" && selectedSubject && (
        <Modal title={`${editingQuizId ? "Editar" : "Crear"} quiz · ${selectedSubject.name}`} onClose={() => setModal(null)}>
          <form onSubmit={handleCreateQuiz} style={{ display: "grid", gap: 16 }}>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Título del quiz *
              <input autoFocus required value={quizForm.title} onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })} placeholder="Ej. Repaso de principios SOLID" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Descripción
              <textarea value={quizForm.description} onChange={(event) => setQuizForm({ ...quizForm, description: event.target.value })} rows={2} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
            </label>

            <fieldset style={{ border: "1px solid #CBD5E1", borderRadius: 12, padding: 15, display: "grid", gap: 12, background: "#F8FAFC" }}>
              <legend style={{ padding: "0 7px", color: "#1E2761", fontWeight: 800 }}>Tarjeta de logro del quiz</legend>
              <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>Esta tarjeta se desbloquea al responder correctamente todas las preguntas. Si dejas los textos vacíos, usaremos el título y la descripción del quiz.</p>
              <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Título de la tarjeta
                <input value={quizForm.cardTitle} onChange={(event) => setQuizForm({ ...quizForm, cardTitle: event.target.value })} placeholder={quizForm.title || "Ej. Maestría en Arquitectura de Software"} style={{ ...fieldStyle, marginTop: 5 }} />
              </label>
              <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Subtítulo
                <input value={quizForm.cardSubtitle} onChange={(event) => setQuizForm({ ...quizForm, cardSubtitle: event.target.value })} placeholder={quizForm.description || "Tarjeta de logro desbloqueada"} style={{ ...fieldStyle, marginTop: 5 }} />
              </label>
              {quizForm.cardImage && <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <img src={quizForm.cardImage} alt="Vista previa de la tarjeta" style={{ width: 92, height: 122, objectFit: "cover", borderRadius: 9, border: "1px solid #CBD5E1" }} />
                <Button type="button" size="sm" variant="outline" onClick={() => setQuizForm((current) => ({ ...current, cardImage: "" }))}>Quitar imagen</Button>
              </div>}
              <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>{uploadingCardImage ? "Subiendo imagen a R2…" : quizForm.cardImage ? "Reemplazar imagen de tarjeta" : "Diseño de la tarjeta (opcional)"}
                <input type="file" accept="image/*" disabled={uploadingCardImage} onChange={(event) => { handleCardImageUpload(event.target.files?.[0]); event.target.value = ""; }} style={{ display: "block", maxWidth: "100%", marginTop: 5, fontSize: 12, fontWeight: 400 }} aria-label="Cargar diseño de la tarjeta de logro" />
              </label>
              <span style={{ color: "#64748B", fontSize: 11 }}>Puedes personalizar cada quiz con una imagen propia; si no subes una, se usará el arte predeterminado.</span>
            </fieldset>

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
                    <option value="short_answer">Respuesta corta</option>
                    <option value="ordering">Ordenar elementos</option>
                  </select>
                </label>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Enunciado *
                  <textarea required value={question.prompt} onChange={(event) => updateQuestion(questionIndex, "prompt", event.target.value)} rows={2} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
                </label>
                {question.prompt.trim() && <details className="markdown-preview">
                  <summary>Vista previa del enunciado</summary>
                  <MarkdownContent>{question.prompt}</MarkdownContent>
                </details>}
                <div style={{ display: "grid", gap: 9 }}>
                  {question.imageUrl && (
                    <div style={{ position: "relative", width: "fit-content", maxWidth: "100%" }}>
                      <img src={question.imageUrl} alt={`Imagen de la pregunta ${questionIndex + 1}`} style={{ display: "block", maxWidth: "100%", maxHeight: 260, objectFit: "contain", border: "1px solid #CBD5E1", borderRadius: 10 }} />
                      <button type="button" onClick={() => updateQuestion(questionIndex, "imageUrl", "")} style={{ marginTop: 6, border: 0, background: "transparent", color: "#B91C1C", cursor: "pointer", padding: 0 }}>Quitar imagen</button>
                    </div>
                  )}
                  <label style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", alignItems: "center", gap: 8, color: "#475569", fontSize: 13, fontWeight: 700 }}>
                    <ImagePlus size={17} color="#1E2761" />
                    <span>{uploadingImageIndex === questionIndex ? "Subiendo imagen a R2…" : question.imageUrl ? "Reemplazar imagen" : "Agregar imagen (opcional)"}
                      <input type="file" accept="image/*" disabled={uploadingImageIndex !== null} onChange={(event) => { handleImageUpload(questionIndex, event.target.files?.[0]); event.target.value = ""; }} style={{ display: "block", maxWidth: "100%", marginTop: 5, fontSize: 12, fontWeight: 400 }} aria-label={`Cargar imagen para la pregunta ${questionIndex + 1}`} />
                    </span>
                  </label>
                  <span style={{ color: "#64748B", fontSize: 11 }}>Se optimiza y guarda en Cloudflare R2; máximo 8 MB por archivo original y 220 KB al comprimir.</span>
                </div>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Tema
                  <input value={question.topic} onChange={(event) => updateQuestion(questionIndex, "topic", event.target.value)} style={{ ...fieldStyle, marginTop: 5 }} />
                </label>
                {question.type === "short_answer" ? (
                  <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Respuestas aceptadas * (una por línea)
                    <textarea required value={question.acceptedAnswers} onChange={(event) => updateQuestion(questionIndex, "acceptedAnswers", event.target.value)} rows={3} placeholder={"Ej. encapsulamiento\nencapsulación"} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
                    <span style={{ display: "block", marginTop: 5, color: "#64748B", fontSize: 12 }}>Se ignoran mayúsculas, tildes y espacios repetidos al corregir.</span>
                  </label>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} style={{ display: "grid", gridTemplateColumns: question.type === "ordering" ? "auto minmax(0, 1fr) auto" : "auto minmax(0, 1fr)", gap: 9, alignItems: "center", color: "#475569", fontSize: 13 }}>
                        {question.type === "ordering" ? (
                          <span style={{ color: "#1E2761", fontWeight: 800, minWidth: 22 }}>{optionIndex + 1}.</span>
                        ) : (
                          <input
                            type={question.type === "multiple_select" ? "checkbox" : "radio"}
                            name={`correct-${questionIndex}`}
                            checked={question.type === "multiple_select" ? question.correctOptions.includes(String(optionIndex)) : question.correctOption === String(optionIndex)}
                            onChange={(event) => question.type === "multiple_select"
                              ? updateQuestion(questionIndex, "correctOptions", event.target.checked, optionIndex)
                              : updateQuestion(questionIndex, "correctOption", String(optionIndex))}
                            aria-label={`Marcar alternativa ${optionIndex + 1} correcta`}
                          />
                        )}
                        <input required readOnly={question.type === "true_false"} value={option} onChange={(event) => updateQuestion(questionIndex, "option", event.target.value, optionIndex)} placeholder={question.type === "ordering" ? `Elemento en posición ${optionIndex + 1}` : `Alternativa ${optionIndex + 1}`} style={{ ...fieldStyle, ...(question.type === "true_false" ? { background: "#F1F5F9" } : {}) }} />
                        {question.type === "ordering" && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button type="button" onClick={() => moveOption(questionIndex, optionIndex, -1)} disabled={optionIndex === 0} aria-label={`Subir elemento ${optionIndex + 1}`} style={{ border: "1px solid #CBD5E1", background: "#FFF", borderRadius: 6, padding: 6, cursor: optionIndex === 0 ? "not-allowed" : "pointer" }}><ArrowUp size={15} /></button>
                            <button type="button" onClick={() => moveOption(questionIndex, optionIndex, 1)} disabled={optionIndex === question.options.length - 1} aria-label={`Bajar elemento ${optionIndex + 1}`} style={{ border: "1px solid #CBD5E1", background: "#FFF", borderRadius: 6, padding: 6, cursor: optionIndex === question.options.length - 1 ? "not-allowed" : "pointer" }}><ArrowDown size={15} /></button>
                            {question.options.length > 2 && <button type="button" onClick={() => removeOrderingOption(questionIndex, optionIndex)} aria-label={`Eliminar elemento ${optionIndex + 1}`} style={{ border: "1px solid #FECACA", background: "#FFF", color: "#B91C1C", borderRadius: 6, padding: 6, cursor: "pointer" }}><X size={15} /></button>}
                          </div>
                        )}
                      </div>
                    ))}
                    {question.type === "ordering" && question.options.length < 8 && (
                      <button type="button" onClick={() => setQuizForm((current) => ({ ...current, questions: current.questions.map((item, index) => index === questionIndex ? { ...item, options: [...item.options, ""] } : item) }))} style={{ justifySelf: "start", border: "1px dashed #94A3B8", background: "#F8FAFC", color: "#1E2761", borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontWeight: 700 }}>+ Agregar elemento</button>
                    )}
                  </div>
                )}
                {question.type !== "short_answer" && <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>{question.type === "multiple_select" ? "Marca todas las alternativas correctas." : question.type === "ordering" ? "La lista está en el orden correcto; los estudiantes deberán reordenarla." : "Marca el círculo junto a la alternativa correcta."}</p>}
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Explicación (opcional)
                  <textarea value={question.explanation} onChange={(event) => updateQuestion(questionIndex, "explanation", event.target.value)} rows={2} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
                </label>
                {question.explanation.trim() && <details className="markdown-preview">
                  <summary>Vista previa de la explicación</summary>
                  <MarkdownContent>{question.explanation}</MarkdownContent>
                </details>}
                {quizForm.questions.length > 1 && (
                  <button type="button" onClick={() => setQuizForm((current) => ({ ...current, questions: current.questions.filter((_, index) => index !== questionIndex) }))} style={{ justifySelf: "start", border: 0, background: "transparent", color: "#B91C1C", padding: 0, cursor: "pointer" }}>Eliminar pregunta</button>
                )}
              </fieldset>
            ))}

            <Button type="button" variant="secondary" icon={Plus} onClick={() => setQuizForm((current) => ({ ...current, questions: [...current.questions, newQuestion()] }))}>Agregar pregunta</Button>
            <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>Las respuestas cortas aceptan variantes y se corrigen ignorando tildes y mayúsculas. La selección múltiple requiere todas las correctas y ninguna incorrecta. En enunciado y explicación puedes usar Markdown: **negrita**, *cursiva*, `código`, listas, citas y bloques de código; también se admiten tablas y tachado.</p>
            {formError && <p role="alert" style={{ color: "#B91C1C", margin: 0 }}>{formError}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
              <Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button>
              <Button type="submit" icon={Check} disabled={saving || uploadingCardImage || uploadingImageIndex !== null}>{saving ? "Guardando…" : editingQuizId ? "Guardar cambios" : "Guardar borrador"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
