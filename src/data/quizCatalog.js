import { AYUDANTIAS } from "./index";

const STORAGE_KEY = "quiz-ayudantias-catalog-v1";
const DEFAULT_SUBJECT_ID = "subject-ingenieria-software";

function createInitialCatalog() {
  return {
    version: 1,
    subjects: [
      {
        id: DEFAULT_SUBJECT_ID,
        name: "Ingeniería de Software",
        code: "ING-SOFT",
        description: "Ayudantías y actividades del curso.",
        quizzes: AYUDANTIAS.map((ayudantia) => ({
          ...ayudantia,
          id: `quiz-${ayudantia.id}`,
          subjectId: DEFAULT_SUBJECT_ID,
          status: "published",
          version: 1,
          questions: ayudantia.questions.map((question) => ({
            ...question,
            type: question.type || "single_choice",
          })),
        })),
      },
    ],
  };
}

function isCatalog(value) {
  return (
    value &&
    value.version === 1 &&
    Array.isArray(value.subjects) &&
    value.subjects.every((subject) => Array.isArray(subject.quizzes))
  );
}

export function loadQuizCatalog() {
  if (typeof window === "undefined") return createInitialCatalog();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createInitialCatalog();
    const parsed = JSON.parse(stored);
    return isCatalog(parsed) ? parsed : createInitialCatalog();
  } catch {
    return createInitialCatalog();
  }
}

export function saveQuizCatalog(catalog) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
}

export function createSubject({ name, code = "", description = "" }) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("La asignatura necesita un nombre.");

  return {
    id: `subject-${crypto.randomUUID()}`,
    name: cleanName,
    code: code.trim().toUpperCase(),
    description: description.trim(),
    quizzes: [],
  };
}

export function createQuiz({ subjectId, title, description = "", questions }) {
  const cleanTitle = title.trim();
  const cleanQuestions = questions.map((question) => ({
    ...question,
    prompt: question.prompt.trim(),
    options: (question.options || []).map((option) => option.trim()),
    correctOptions: (question.correctOptions || []).map(Number),
    acceptedAnswers: (Array.isArray(question.acceptedAnswers)
      ? question.acceptedAnswers
      : String(question.acceptedAnswers || "").split(/\r?\n/)
    ).map((answer) => answer.trim()).filter(Boolean),
  }));

  const invalidQuestion = cleanQuestions.find((question) => {
    if (!question.prompt) return true;
    if (question.type === "short_answer") return question.acceptedAnswers.length === 0;
    if (question.type === "ordering") {
      return question.options.length < 2 || question.options.some((option) => !option);
    }
    return question.options.length < 2 || question.options.some((option) => !option) ||
      (question.type === "multiple_select" && question.correctOptions.length === 0);
  });

  if (!subjectId || !cleanTitle || cleanQuestions.length === 0) {
    throw new Error("Completa el título del quiz y agrega al menos una pregunta.");
  }
  if (invalidQuestion) {
    if (!invalidQuestion.prompt) throw new Error("Escribe el enunciado de cada pregunta.");
    if (invalidQuestion.type === "short_answer") {
      throw new Error("Agrega al menos una respuesta aceptada en cada pregunta corta.");
    }
    if (invalidQuestion.type === "ordering") {
      throw new Error("Completa al menos dos elementos para ordenar.");
    }
    if (invalidQuestion.type === "multiple_select" && invalidQuestion.correctOptions.length === 0) {
      throw new Error("Marca al menos una alternativa correcta en cada pregunta de selección múltiple.");
    }
    throw new Error("Completa todas las alternativas de cada pregunta.");
  }

  return {
    id: `quiz-${crypto.randomUUID()}`,
    subjectId,
    code: `Q${crypto.randomUUID().replaceAll("-", "").slice(0, 7).toUpperCase()}`,
    title: cleanTitle,
    subtitle: description.trim() || "Quiz creado por el profesor",
    description: description.trim(),
    course: "",
    status: "draft",
    version: 1,
    defaultTimerSeconds: 60,
    pointsPerQuestion: 1000,
    questions: cleanQuestions.map((question) => ({
      id: crypto.randomUUID(),
      type: question.type || "single_choice",
      topic: question.topic?.trim() || "General",
      q: question.prompt,
      opts: question.options,
      image: question.imageUrl || question.image || question.imageData || "",
      ans:
        question.type === "short_answer"
          ? question.acceptedAnswers
          : question.type === "ordering"
            ? question.options.map((_, index) => index)
            : question.type === "multiple_select"
              ? question.correctOptions.sort((a, b) => a - b)
              : Number(question.correctOption),
      exp: question.explanation?.trim() || "",
    })),
  };
}

export function findQuiz(catalog, quizId) {
  for (const subject of catalog.subjects) {
    const quiz = subject.quizzes.find((item) => item.id === quizId);
    if (quiz) return { subject, quiz };
  }
  return null;
}

export function publishQuiz(catalog, quizId) {
  return {
    ...catalog,
    subjects: catalog.subjects.map((subject) => ({
      ...subject,
      quizzes: subject.quizzes.map((quiz) =>
        quiz.id === quizId && quiz.status !== "archived"
          ? { ...quiz, status: "published" }
          : quiz
      ),
    })),
  };
}

export function archiveQuiz(catalog, quizId) {
  return {
    ...catalog,
    subjects: catalog.subjects.map((subject) => ({
      ...subject,
      quizzes: subject.quizzes.map((quiz) =>
        quiz.id === quizId ? { ...quiz, status: "archived" } : quiz
      ),
    })),
  };
}

export function restoreQuiz(catalog, quizId) {
  return {
    ...catalog,
    subjects: catalog.subjects.map((subject) => ({
      ...subject,
      quizzes: subject.quizzes.map((quiz) =>
        quiz.id === quizId && quiz.status === "archived"
          ? { ...quiz, status: "draft", version: (quiz.version || 1) + 1 }
          : quiz
      ),
    })),
  };
}

export function addSubject(catalog, subject) {
  return { ...catalog, subjects: [...catalog.subjects, subject] };
}

export function addQuiz(catalog, subjectId, quiz) {
  return {
    ...catalog,
    subjects: catalog.subjects.map((subject) =>
      subject.id === subjectId
        ? { ...subject, quizzes: [...subject.quizzes, quiz] }
        : subject
    ),
  };
}
