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
import { MAX_ANSWER_OPTIONS, MAX_QUESTION_TIME_SECONDS, MIN_QUESTION_TIME_SECONDS, OPTION_LABELS } from "../config/constants";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import MarkdownContent from "../components/common/MarkdownContent";
import Badge from "../components/common/Badge";
import PrivacyNotice from "../components/common/PrivacyNotice";
import { sanitizeNickname, sanitizeRoomCode, generateAnonymousAlias } from "../utils/sanitizers";
import { uploadImageToR2 } from "../utils/questionImages";
import { deleteSessionHistoryEntry, loadSessionHistory } from "../services/sessionHistoryService";
import { exportSessionQuestionStatsCsv, exportSessionResultsCsv } from "../utils/sessionHistoryCsv";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import type { CatalogSubject, EditorQuestion, QuestionType, QuizCatalog, QuizDefinition, QuizForm, SessionHistoryEntry } from "../types";
import {
  ArrowLeft,
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
  History,
  Download,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

const newQuestion = (): EditorQuestion => ({
  type: "single_choice",
  prompt: "",
  topic: "General",
  options: ["", "", "", ""],
  correctOption: "0",
  correctOptions: ["0"],
  acceptedAnswers: "",
  timeLimitSeconds: "",
  imageUrl: "",
  explanation: "",
});
const emptyQuizForm = (): QuizForm => ({ title: "", description: "", cardTitle: "", cardSubtitle: "", cardImage: "", practiceEnabled: false, questions: [newQuestion()] });

function quizToForm(quiz: QuizDefinition): QuizForm {
  return {
    title: quiz.title || "",
    description: quiz.description || quiz.subtitle || "",
    cardTitle: quiz.cardTitle || "",
    cardSubtitle: quiz.cardSubtitle || "",
    cardImage: quiz.cardImage || "",
    practiceEnabled: Boolean(quiz.practiceEnabled),
    questions: (quiz.questions || []).map((question) => ({
      type: question.type || "single_choice",
      prompt: question.q || "",
      topic: question.topic || "General",
      options: [...(question.opts || [])],
      correctOption: String(question.ans ?? "0"),
      correctOptions: Array.isArray(question.ans) ? question.ans.map(String) : ["0"],
      acceptedAnswers: Array.isArray(question.ans) ? question.ans.join("\n") : "",
      timeLimitSeconds: Number.isInteger(question.timeLimitSeconds) ? String(question.timeLimitSeconds) : "",
      imageUrl: question.image || "",
      explanation: question.exp || "",
    })),
  };
}

const fieldStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #CBD5E1",
  borderRadius: "8px",
  font: "inherit",
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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

interface HubScreenProps {
  onStartHost: (session: { ayudantia: QuizDefinition; roomCode: string }) => void;
  onJoinPlayer: (player: { name: string; roomCode: string; ayudantia?: QuizDefinition }) => void;
  onStartSolo: (session: { ayudantia: QuizDefinition }) => void;
  initialRoomCode?: string;
  catalog?: QuizCatalog;
  onCatalogChange?: (catalog: QuizCatalog) => Promise<void>;
  teacherEmail?: string;
  teacherUserId?: string;
  onSignOut?: () => void;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function SessionHistoryPanel({ entries, loading, error, onBack, onDelete }: { entries: SessionHistoryEntry[]; loading: boolean; error: string; onBack: () => void; onDelete: (entry: SessionHistoryEntry) => void }) {
  return (
    <Card title="Historial de sesiones" subtitle="Quizzes en vivo que ya finalizaron">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Button variant="outline" size="sm" icon={Download} disabled={loading || entries.length === 0} onClick={() => exportSessionResultsCsv(entries)}>Exportar resultados CSV</Button>
          <Button variant="outline" size="sm" icon={Download} disabled={loading || entries.length === 0} onClick={() => exportSessionQuestionStatsCsv(entries)}>Exportar estadísticas CSV</Button>
        </div>
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>Volver a asignaturas</Button>
      </div>
      {loading && <p role="status" style={{ color: "#64748B" }}>Cargando historial…</p>}
      {error && <p role="alert" style={{ color: "#B91C1C" }}>{error}</p>}
      {!loading && !error && entries.length === 0 && (
        <p style={{ margin: 0, padding: "20px 0", color: "#64748B", textAlign: "center" }}>Todavía no hay sesiones completadas.</p>
      )}
      <div style={{ display: "grid", gap: 10 }}>
        {entries.map((entry) => (
          <details key={entry.id} style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", background: "#FFFFFF" }}>
            <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, cursor: "pointer" }}>
              <span>
                <strong style={{ display: "block", color: "#1E2761" }}>{entry.quizTitle}</strong>
                <span style={{ display: "block", color: "#64748B", fontSize: 12, marginTop: 4 }}>
                  {[entry.subjectLabel, new Date(entry.finishedAt).toLocaleString("es-CL"), `Sala ${entry.roomCode}`, `${entry.results.length} participantes`].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span style={{ color: "#1E2761", fontSize: 13, fontWeight: 700 }}>Ver clasificación</span>
            </summary>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(entry)}>Eliminar sesión</Button>
            </div>
            {entry.results.length ? (
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead><tr style={{ color: "#64748B" }}><th style={{ padding: 8 }}>#</th><th style={{ padding: 8 }}>Apodo</th><th style={{ padding: 8 }}>Puntaje</th><th style={{ padding: 8 }}>Aciertos</th></tr></thead>
                  <tbody>{entry.results.map((result, index) => (
                    <tr key={`${entry.id}-${index}`} style={{ borderTop: "1px solid #E2E8F0" }}>
                      <td style={{ padding: 8 }}>{index + 1}</td><td style={{ padding: 8, fontWeight: 700 }}>{result.name}</td><td style={{ padding: 8 }}>{result.score}</td><td style={{ padding: 8 }}>{result.correctAnswersCount}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <p style={{ margin: "12px 0 0", color: "#64748B", fontSize: 13 }}>La sesión terminó sin participantes.</p>}
            <section style={{ marginTop: 16 }}>
              <h4 style={{ margin: "0 0 8px", color: "#1E2761" }}>Estadísticas por pregunta</h4>
              {entry.questionStats.length ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                    <thead><tr style={{ color: "#64748B" }}><th style={{ padding: 8 }}>Pregunta</th><th style={{ padding: 8 }}>Respuestas</th><th style={{ padding: 8 }}>Correctas</th><th style={{ padding: 8 }}>% acierto</th></tr></thead>
                    <tbody>{entry.questionStats.map((stat) => (
                      <tr key={`${entry.id}-question-${stat.questionNumber}`} style={{ borderTop: "1px solid #E2E8F0" }}>
                        <td style={{ padding: 8, minWidth: 220 }}>{stat.questionNumber}. {stat.question}</td>
                        <td style={{ padding: 8 }}>{stat.responseCount}</td>
                        <td style={{ padding: 8 }}>{stat.correctCount}</td>
                        <td style={{ padding: 8 }}>{stat.responseCount ? `${Math.round((stat.correctCount / stat.responseCount) * 100)}%` : "—"}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>Esta sesión no tiene estadísticas por pregunta guardadas.</p>}
            </section>
          </details>
        ))}
      </div>
    </Card>
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
  teacherUserId,
  onSignOut,
}: HubScreenProps) {
  const [localCatalog, setLocalCatalog] = useState(loadQuizCatalog);
  const catalog = remoteCatalog || localCatalog;
  const [selectedSubjectId, setSelectedSubjectId] = useState(catalog.subjects[0]?.id || "");
  const [modal, setModal] = useState<"subject" | "quiz" | null>(null);
  const [formError, setFormError] = useState("");
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", description: "", sealLogoUrl: "" });
  const [quizForm, setQuizForm] = useState(emptyQuizForm);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [nickname, setNickname] = useState(() => (initialRoomCode ? generateAnonymousAlias() : ""));
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [joinError, setJoinError] = useState("");
  const [pageError, setPageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  const [uploadingSubjectSeal, setUploadingSubjectSeal] = useState(false);
  const [uploadingCardImage, setUploadingCardImage] = useState(false);
  const [failedSubjectSealUrl, setFailedSubjectSealUrl] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [quizSearch, setQuizSearch] = useState("");
  const [quizStatusFilter, setQuizStatusFilter] = useState("all");
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const selectedSubject = useMemo(
    () => catalog.subjects.find((subject) => subject.id === selectedSubjectId) || catalog.subjects[0],
    [catalog.subjects, selectedSubjectId]
  );
  const visibleQuizzes = useMemo(() => {
    const query = quizSearch.trim().toLocaleLowerCase("es");
    return (selectedSubject?.quizzes || []).filter((quiz) => {
      const matchesSearch = !query || `${quiz.title} ${quiz.description || quiz.subtitle || ""}`.toLocaleLowerCase("es").includes(query);
      const matchesStatus = quizStatusFilter === "all" || (quiz.status || "published") === quizStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [selectedSubject, quizSearch, quizStatusFilter]);
  const quizCounts = useMemo(() => {
    const quizzes = catalog.subjects.flatMap((subject) => subject.quizzes);
    return {
      total: quizzes.length,
      published: quizzes.filter((quiz) => !quiz.status || quiz.status === "published").length,
      drafts: quizzes.filter((quiz) => quiz.status === "draft").length,
    };
  }, [catalog.subjects]);
  const isSubjectSealPreviewFailed = Boolean(subjectForm.sealLogoUrl && failedSubjectSealUrl === subjectForm.sealLogoUrl);
  const subjectSealPreviewSrc = isSubjectSealPreviewFailed ? "/assets/seal_logo.jpg" : subjectForm.sealLogoUrl;

  const handleOpenHistory = async () => {
    if (!teacherUserId) return;
    setShowHistory(true);
    setHistoryLoading(true);
    setHistoryError("");
    try {
      setSessionHistory(await loadSessionHistory(teacherUserId));
    } catch (error) {
      const message = errorMessage(error, "No se pudo cargar el historial.");
      setHistoryError(message);
      sileo.error({ title: "No se pudo cargar el historial", description: message });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistoryEntry = async (entry: SessionHistoryEntry) => {
    if (!teacherUserId || !window.confirm(`¿Eliminar del historial la sesión “${entry.quizTitle}” del ${new Date(entry.finishedAt).toLocaleString("es-CL")}?`)) return;
    try {
      await deleteSessionHistoryEntry(teacherUserId, entry.id);
      setSessionHistory((current) => current.filter((session) => session.id !== entry.id));
      sileo.success({ title: "Sesión eliminada del historial" });
    } catch (error) {
      const message = errorMessage(error, "No se pudo eliminar la sesión.");
      sileo.error({ title: "No se pudo eliminar la sesión", description: message });
    }
  };

  const commitCatalog = async (nextCatalog: QuizCatalog): Promise<void> => {
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

  const handleSaveSubject = async (event: FormEvent<HTMLFormElement>) => {
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
      if (!editingSubjectId) setSelectedSubjectId(nextCatalog.subjects.at(-1)?.id || "");
      setSubjectForm({ name: "", code: "", description: "", sealLogoUrl: "" });
      setEditingSubjectId(null);
      setModal(null);
      sileo.success({ title: editingSubjectId ? "Asignatura actualizada" : "Asignatura creada" });
    } catch (error) {
      const message = errorMessage(error, "No se pudo guardar la asignatura.");
      setFormError(message);
      sileo.error({ title: "No se pudo guardar la asignatura", description: message });
    }
  };

  const openSubjectEditor = (subject: CatalogSubject | null = null) => {
    setFormError("");
    setFailedSubjectSealUrl("");
    setEditingSubjectId(subject?.id || null);
    setSubjectForm(subject
      ? { name: subject.name, code: subject.code || "", description: subject.description || "", sealLogoUrl: subject.sealLogoUrl || "" }
      : { name: "", code: "", description: "", sealLogoUrl: "" });
    setModal("subject");
  };

  const handleSubjectSealUpload = async (file?: File) => {
    if (!file) return;
    setFormError("");
    setUploadingSubjectSeal(true);
    setFailedSubjectSealUrl("");
    try {
      const sealLogoUrl = await uploadImageToR2(file, "subject-seal");
      setSubjectForm((current) => ({ ...current, sealLogoUrl }));
      sileo.success({ title: "Estampado cargado" });
    } catch (error) {
      const message = errorMessage(error, "No se pudo cargar el estampado.");
      setFormError(message);
      sileo.error({ title: "Error al cargar el estampado", description: message });
    } finally {
      setUploadingSubjectSeal(false);
    }
  };

  const handleCreateQuiz = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    try {
      if (!selectedSubject) throw new Error("Crea una asignatura antes de agregar quizzes.");
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
      const message = errorMessage(error, "No se pudo guardar el quiz.");
      setFormError(message);
      sileo.error({ title: editingQuizId ? "No se pudo actualizar el quiz" : "No se pudo guardar el quiz", description: message });
    }
  };

  const handlePublishQuiz = async (quizId: string) => {
    try {
      await commitCatalog(publishQuiz(catalog, quizId));
      sileo.success({ title: "Quiz publicado", description: "Ya está disponible para iniciar o practicar." });
    } catch (error) {
      const message = `No se pudo publicar el quiz: ${errorMessage(error, "Error desconocido")}`;
      setPageError(message);
      sileo.error({ title: "No se pudo publicar", description: errorMessage(error, "Error desconocido") });
    }
  };

  const handleQuizStatusChange = async (quizId: string, transition: "archive" | "restore") => {
    try {
      const nextCatalog = transition === "archive"
        ? archiveQuiz(catalog, quizId)
        : restoreQuiz(catalog, quizId);
      await commitCatalog(nextCatalog);
      sileo.success({ title: transition === "archive" ? "Quiz archivado" : "Quiz restaurado" });
    } catch (error) {
      const message = `No se pudo actualizar el quiz: ${errorMessage(error, "Error desconocido")}`;
      setPageError(message);
      sileo.error({ title: "No se pudo actualizar el quiz", description: errorMessage(error, "Error desconocido") });
    }
  };

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
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

  const withSubjectContext = (quiz: QuizDefinition): QuizDefinition => selectedSubject ? ({
    ...quiz,
    courseLabel: [selectedSubject.name, selectedSubject.code].filter(Boolean).join(" • "),
    sealLogoUrl: selectedSubject.sealLogoUrl || "",
  }) : quiz;

  const startHost = (quiz: QuizDefinition) => {
    const roomCode = `Q${crypto.randomUUID().replaceAll("-", "").slice(0, 7).toUpperCase()}`;
    onStartHost({ ayudantia: withSubjectContext(quiz), roomCode });
  };

  const openQuizCreator = () => {
    setFormError("");
    setEditingQuizId(null);
    setQuizForm(emptyQuizForm());
    setModal("quiz");
  };

  const openQuizEditor = (quiz: QuizDefinition) => {
    setFormError("");
    setEditingQuizId(quiz.id);
    setQuizForm(quizToForm(quiz));
    setModal("quiz");
  };

  const updateQuestion = (questionIndex: number, field: keyof EditorQuestion | "option", value: string | boolean, optionIndex?: number) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;
        if (field === "option") {
          return {
            ...question,
          options: question.options.map((option, itemIndex) =>
              itemIndex === optionIndex && typeof value === "string" ? value : option
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
        const patch = { [field]: value } as Partial<EditorQuestion>;
        return { ...question, ...patch };
      }),
    }));
  };

  const handleImageUpload = async (questionIndex: number, file?: File) => {
    if (!file) return;
    if (uploadingImageIndex !== null) {
      sileo.warning({ title: "Ya se está cargando una imagen" });
      return;
    }
    setFormError("");
    setUploadingImageIndex(questionIndex);
    try {
      const imageUrl = await uploadImageToR2(file);
      updateQuestion(questionIndex, "imageUrl", imageUrl);
      sileo.success({ title: "Imagen agregada a la pregunta" });
    } catch (error) {
      const message = errorMessage(error, "No se pudo cargar la imagen.");
      setFormError(message);
      sileo.error({ title: "No se pudo cargar la imagen", description: message });
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleQuestionPaste = (event: React.ClipboardEvent<HTMLFieldSetElement>, questionIndex: number) => {
    const imageItem = Array.from(event.clipboardData?.items || []).find(
      (item) => item.kind === "file" && item.type.startsWith("image/")
    );
    if (!imageItem) return;

    const imageFile = imageItem.getAsFile();
    if (!imageFile) return;

    event.preventDefault();
    handleImageUpload(questionIndex, imageFile);
  };

  const handleCardImageUpload = async (file?: File) => {
    if (!file) return;
    setFormError("");
    setUploadingCardImage(true);
    try {
      const cardImage = await uploadImageToR2(file, "quiz-card");
      setQuizForm((current) => ({ ...current, cardImage }));
      sileo.success({ title: "Imagen de tarjeta cargada" });
    } catch (error) {
      const message = errorMessage(error, "No se pudo cargar la imagen de la tarjeta.");
      setFormError(message);
      sileo.error({ title: "No se pudo cargar la imagen de tarjeta", description: message });
    } finally {
      setUploadingCardImage(false);
    }
  };

  const moveOption = (questionIndex: number, optionIndex: number, direction: number) => {
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

  const removeOrderingOption = (questionIndex: number, optionIndex: number) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => index === questionIndex
        ? { ...question, options: question.options.filter((_, itemIndex) => itemIndex !== optionIndex) }
        : question),
    }));
  };

  const addChoiceOption = (questionIndex: number) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => index === questionIndex && question.options.length < MAX_ANSWER_OPTIONS
        ? { ...question, options: [...question.options, ""] }
        : question),
    }));
  };

  const removeChoiceOption = (questionIndex: number, optionIndex: number) => {
    setQuizForm((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex || question.options.length <= 2) return question;
        const options = question.options.filter((_, itemIndex) => itemIndex !== optionIndex);
        const correctOptions = question.correctOptions
          .filter((item) => Number(item) !== optionIndex)
          .map((item) => String(Number(item) > optionIndex ? Number(item) - 1 : Number(item)));
        const hasCorrectOption = question.correctOption !== "" && question.correctOption != null;
        const correctIndex = hasCorrectOption ? Number(question.correctOption) : -1;
        const correctOption = !hasCorrectOption || correctIndex === optionIndex
          ? ""
          : String(correctIndex > optionIndex ? correctIndex - 1 : correctIndex);
        return { ...question, options, correctOptions, correctOption };
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
            {teacherUserId && <Button variant="outline" size="sm" icon={History} onClick={handleOpenHistory}>Historial</Button>}
            {onSignOut && <Button variant="secondary" size="sm" onClick={onSignOut}>Cerrar sesión</Button>}
            <Button variant="primary" icon={CirclePlus} disabled={saving} onClick={() => openSubjectEditor()}>
              Nueva asignatura
            </Button>
          </div>
        </header>

        {pageError && <p role="alert" style={{ padding: 12, background: "#FEF2F2", color: "#B91C1C", borderRadius: 8 }}>{pageError}</p>}
        {saving && <p role="status" style={{ color: "#64748B", fontSize: 13 }}>Guardando cambios en la nube…</p>}

        {showHistory ? (
          <SessionHistoryPanel entries={sessionHistory} loading={historyLoading} error={historyError} onBack={() => setShowHistory(false)} onDelete={handleDeleteHistoryEntry} />
        ) : (
          <>
        <div className="teacher-overview" aria-label="Resumen de tu biblioteca">
          <div><span>Asignaturas</span><strong>{catalog.subjects.length}</strong></div>
          <div><span>Quizzes en total</span><strong>{quizCounts.total}</strong></div>
          <div><span>Quizzes publicados</span><strong>{quizCounts.published}</strong></div>
          <div><span>Borradores</span><strong>{quizCounts.drafts}</strong></div>
        </div>

        <div className="teacher-library-layout">
          <aside className="teacher-subjects-panel">
          <Card title="Mis asignaturas" subtitle={`${catalog.subjects.length} asignatura${catalog.subjects.length === 1 ? "" : "s"}`}>
            <nav className="teacher-subject-list" aria-label="Asignaturas">
              {catalog.subjects.map((subject) => {
                const selected = subject.id === selectedSubject?.id;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subject.id)}
                    aria-pressed={selected}
                    className={`teacher-subject-item${selected ? " is-selected" : ""}`}
                  >
                    <span style={{ display: "block", color: "#1E2761", fontWeight: 750 }}>{subject.name}</span>
                    <span style={{ display: "block", color: "#64748B", fontSize: 12, marginTop: 4 }}>
                      {subject.quizzes.length} quizzes{subject.code ? ` · ${subject.code}` : ""}
                    </span>
                  </button>
                );
              })}
              {catalog.subjects.length === 0 && <p style={{ color: "#64748B", fontSize: 14 }}>Aún no hay asignaturas.</p>}
            </nav>
          </Card>
          </aside>

          <section className="teacher-quiz-library" aria-label="Biblioteca de quizzes">
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

                <div className="teacher-quiz-toolbar">
                  <label className="teacher-search-field">Buscar quiz
                    <input type="search" value={quizSearch} onChange={(event) => setQuizSearch(event.target.value)} placeholder="Título o descripción" />
                  </label>
                  <label className="teacher-filter-field">Estado
                    <select value={quizStatusFilter} onChange={(event) => setQuizStatusFilter(event.target.value)}>
                      <option value="all">Todos ({selectedSubject.quizzes.length})</option>
                      <option value="published">Publicados</option>
                      <option value="draft">Borradores</option>
                      <option value="archived">Archivados</option>
                    </select>
                  </label>
                  <span className="teacher-result-count">{visibleQuizzes.length} de {selectedSubject.quizzes.length} quizzes</span>
                </div>

                <div className="teacher-quiz-list">
                  {visibleQuizzes.map((quiz) => (
                    <Card key={quiz.id} style={{ overflow: "visible" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 220, flex: "1 1 300px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 7 }}>
                            <h3 style={{ margin: 0, color: "#0F172A", fontSize: 17 }}>{quiz.title}</h3>
                            <Badge variant={quiz.status === "published" ? "success" : quiz.status === "archived" ? "neutral" : "amber"}>
                              {quiz.status === "published" ? "Publicado" : quiz.status === "archived" ? "Archivado" : "Borrador"}
                            </Badge>
                            {quiz.practiceEnabled && <Badge variant="navy">Práctica pública</Badge>}
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
                              <Button size="sm" variant="secondary" icon={BookOpen} onClick={() => onStartSolo({ ayudantia: withSubjectContext(quiz) })}>Practicar</Button>
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
                  {selectedSubject.quizzes.length > 0 && visibleQuizzes.length === 0 && (
                    <div className="teacher-filter-empty">
                      <p>No encontramos quizzes con esos filtros.</p>
                      <button type="button" onClick={() => { setQuizSearch(""); setQuizStatusFilter("all"); }}>Limpiar filtros</button>
                    </div>
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

        <details className="teacher-join-details">
          <summary>¿Necesitas entrar a una sala manualmente?</summary>
          <div className="teacher-join-content"><p>Ingresa tu apodo y el código de la sala para unirte como participante.</p>
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
          </div>
        </details>
        <div style={{ marginTop: 18 }}><PrivacyNotice /></div>
          </>
        )}
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
        <Modal title={`${editingQuizId ? "Editar" : "Crear"} quiz · ${selectedSubject?.name || "Asignatura"}`} onClose={() => setModal(null)}>
          <form onSubmit={handleCreateQuiz} style={{ display: "grid", gap: 16 }}>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Título del quiz *
              <input autoFocus required value={quizForm.title} onChange={(event) => setQuizForm({ ...quizForm, title: event.target.value })} placeholder="Ej. Repaso de principios SOLID" style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Descripción
              <textarea value={quizForm.description} onChange={(event) => setQuizForm({ ...quizForm, description: event.target.value })} rows={2} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
            </label>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 14, border: "1px solid #CBD5E1", borderRadius: 10, color: "#334155", cursor: "pointer" }}>
              <input type="checkbox" checked={quizForm.practiceEnabled} onChange={(event) => setQuizForm({ ...quizForm, practiceEnabled: event.target.checked })} style={{ marginTop: 3 }} />
              <span><strong style={{ display: "block", color: "#1E2761" }}>Permitir práctica pública</strong><span style={{ display: "block", marginTop: 3, color: "#64748B", fontSize: 12 }}>Cuando el quiz esté publicado, aparecerá en la portada dentro de su asignatura.</span></span>
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
              <fieldset key={questionIndex} onPaste={(event) => handleQuestionPaste(event, questionIndex)} style={{ border: "1px solid #CBD5E1", borderRadius: 12, padding: 15, display: "grid", gap: 12 }}>
                <legend style={{ padding: "0 7px", color: "#1E2761", fontWeight: 800 }}>Pregunta {questionIndex + 1}</legend>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Tipo de pregunta
                  <select
                    value={question.type}
                    onChange={(event) => {
                      const type = event.target.value as QuestionType;
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
                  <span style={{ color: "#64748B", fontSize: 12 }}>También puedes enfocar un campo de esta pregunta y pegar una imagen copiada con Ctrl+V (⌘+V en Mac).</span>
                </div>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Tema
                  <input value={question.topic} onChange={(event) => updateQuestion(questionIndex, "topic", event.target.value)} style={{ ...fieldStyle, marginTop: 5 }} />
                </label>
                <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Tiempo límite (segundos)
                  <input
                    type="number"
                    min={MIN_QUESTION_TIME_SECONDS}
                    max={MAX_QUESTION_TIME_SECONDS}
                    step="1"
                    inputMode="numeric"
                    value={question.timeLimitSeconds}
                    onChange={(event) => updateQuestion(questionIndex, "timeLimitSeconds", event.target.value)}
                    placeholder="60"
                    style={{ ...fieldStyle, marginTop: 5 }}
                    aria-label={`Tiempo límite para la pregunta ${questionIndex + 1} en segundos`}
                  />
                  <span style={{ display: "block", marginTop: 5, color: "#64748B", fontSize: 12 }}>
                    Deja vacío para usar 60 segundos. Puedes definir entre {MIN_QUESTION_TIME_SECONDS} y {MAX_QUESTION_TIME_SECONDS} segundos.
                  </span>
                </label>
                {question.type === "short_answer" ? (
                  <label style={{ color: "#475569", fontSize: 13, fontWeight: 700 }}>Respuestas aceptadas * (una por línea)
                    <textarea required value={question.acceptedAnswers} onChange={(event) => updateQuestion(questionIndex, "acceptedAnswers", event.target.value)} rows={3} placeholder={"Ej. encapsulamiento\nencapsulación"} style={{ ...fieldStyle, marginTop: 5, resize: "vertical" }} />
                    <span style={{ display: "block", marginTop: 5, color: "#64748B", fontSize: 12 }}>Se ignoran mayúsculas, tildes y espacios repetidos al corregir.</span>
                  </label>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} style={{ display: "grid", gridTemplateColumns: question.type === "ordering" ? "auto minmax(0, 1fr) auto" : question.type === "true_false" ? "auto minmax(0, 1fr)" : "auto minmax(0, 1fr) auto", gap: 9, alignItems: "center", color: "#475569", fontSize: 13 }}>
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
                        <textarea required readOnly={question.type === "true_false"} rows={2} value={option} onChange={(event) => updateQuestion(questionIndex, "option", event.target.value, optionIndex)} placeholder={question.type === "ordering" ? `Elemento en posición ${optionIndex + 1}` : `Alternativa ${optionIndex + 1}`} style={{ ...fieldStyle, resize: "vertical", ...(question.type === "true_false" ? { background: "#F1F5F9" } : {}) }} />
                        {question.type === "ordering" && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button type="button" onClick={() => moveOption(questionIndex, optionIndex, -1)} disabled={optionIndex === 0} aria-label={`Subir elemento ${optionIndex + 1}`} style={{ border: "1px solid #CBD5E1", background: "#FFF", borderRadius: 6, padding: 6, cursor: optionIndex === 0 ? "not-allowed" : "pointer" }}><ArrowUp size={15} /></button>
                            <button type="button" onClick={() => moveOption(questionIndex, optionIndex, 1)} disabled={optionIndex === question.options.length - 1} aria-label={`Bajar elemento ${optionIndex + 1}`} style={{ border: "1px solid #CBD5E1", background: "#FFF", borderRadius: 6, padding: 6, cursor: optionIndex === question.options.length - 1 ? "not-allowed" : "pointer" }}><ArrowDown size={15} /></button>
                            {question.options.length > 2 && <button type="button" onClick={() => removeOrderingOption(questionIndex, optionIndex)} aria-label={`Eliminar elemento ${optionIndex + 1}`} style={{ border: "1px solid #FECACA", background: "#FFF", color: "#B91C1C", borderRadius: 6, padding: 6, cursor: "pointer" }}><X size={15} /></button>}
                          </div>
                        )}
                        {(question.type === "single_choice" || question.type === "multiple_select") && (
                          <button type="button" onClick={() => removeChoiceOption(questionIndex, optionIndex)} disabled={question.options.length <= 2} aria-label={`Eliminar alternativa ${OPTION_LABELS[optionIndex] || optionIndex + 1}`} title="Eliminar alternativa" style={{ width: 36, height: 36, border: "1px solid #FECACA", background: "#FFF", color: "#B91C1C", borderRadius: 7, display: "grid", placeItems: "center", cursor: question.options.length <= 2 ? "not-allowed" : "pointer", opacity: question.options.length <= 2 ? 0.45 : 1 }}><X size={16} /></button>
                        )}
                      </div>
                    ))}
                    {(question.type === "single_choice" || question.type === "multiple_select") && question.options.length < MAX_ANSWER_OPTIONS && (
                      <button type="button" onClick={() => addChoiceOption(questionIndex)} style={{ justifySelf: "start", border: "1px dashed #94A3B8", background: "#F8FAFC", color: "#1E2761", borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontWeight: 700 }}>+ Agregar alternativa ({question.options.length}/{MAX_ANSWER_OPTIONS})</button>
                    )}
                    {question.type === "ordering" && question.options.length < MAX_ANSWER_OPTIONS && (
                      <button type="button" onClick={() => setQuizForm((current) => ({ ...current, questions: current.questions.map((item, index) => index === questionIndex ? { ...item, options: [...item.options, ""] } : item) }))} style={{ justifySelf: "start", border: "1px dashed #94A3B8", background: "#F8FAFC", color: "#1E2761", borderRadius: 7, padding: "7px 10px", cursor: "pointer", fontWeight: 700 }}>+ Agregar elemento</button>
                    )}
                  </div>
                )}
                {question.type !== "short_answer" && question.options.some((option) => option.trim()) && <details className="markdown-preview">
                  <summary>Vista previa de alternativas con Markdown</summary>
                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {question.options.map((option, optionIndex) => <div key={optionIndex} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <strong style={{ flex: "0 0 auto", color: "#1E2761" }}>{question.type === "ordering" ? `${optionIndex + 1}.` : `${OPTION_LABELS[optionIndex] || optionIndex + 1}.`}</strong>
                      <MarkdownContent>{option || "*(vacía)*"}</MarkdownContent>
                    </div>)}
                  </div>
                </details>}
                {question.type !== "short_answer" && <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>{question.type === "multiple_select" ? "Marca todas las alternativas correctas. Puedes agregar hasta 8 y darles formato Markdown." : question.type === "ordering" ? "La lista está en el orden correcto; los estudiantes deberán reordenarla." : question.type === "true_false" ? "Marca el círculo junto a la alternativa correcta." : "Marca la alternativa correcta. Puedes agregar hasta 8 opciones y usar Markdown."}</p>}
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
            <p style={{ margin: 0, color: "#64748B", fontSize: 12 }}>Las respuestas cortas aceptan variantes y se corrigen ignorando tildes y mayúsculas. La selección múltiple requiere todas las correctas y ninguna incorrecta. Enunciados, explicaciones y alternativas admiten Markdown, como **negrita**, *cursiva*, `código`, listas, citas, bloques de código, tablas y tachado.</p>
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
