import { supabase } from "./supabaseClient";
import type { QuizCatalog, QuizDefinition, QuizStatus } from "../types";

interface SubjectRow { id: string; name: string; code: string | null; description: string | null; seal_logo_url: string | null }
interface QuizRow { id: string; subject_id: string; title: string; description: string | null; status: QuizStatus; practice_enabled: boolean; questions: QuizDefinition["questions"] | null; version: number | null; metadata: Record<string, unknown> | null }

function requireSupabase(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error("Supabase no está configurado.");
  return supabase;
}

export async function hasTeacherAccess(userId: string): Promise<boolean> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("teacher_access")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function loadTeacherCatalog(userId: string): Promise<QuizCatalog> {
  const client = requireSupabase();
  const [{ data: subjects, error: subjectsError }, { data: quizzes, error: quizzesError }] =
    await Promise.all([
      client.from("subjects").select("*").eq("owner_id", userId).order("created_at"),
      client.from("quizzes").select("*").eq("owner_id", userId).order("created_at"),
    ]);
  if (subjectsError) throw subjectsError;
  if (quizzesError) throw quizzesError;

  const subjectRows = (subjects || []) as SubjectRow[];
  const quizRows = (quizzes || []) as QuizRow[];
  return {
    version: 1,
    subjects: subjectRows.map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
      sealLogoUrl: subject.seal_logo_url || "",
      quizzes: quizRows
        .filter((quiz) => quiz.subject_id === subject.id)
        .map((quiz) => ({
          ...quiz.metadata,
          id: quiz.id,
          subjectId: quiz.subject_id,
          code: typeof quiz.metadata?.code === "string" ? quiz.metadata.code : "",
          title: quiz.title,
          subtitle: quiz.description || "",
          description: quiz.description || "",
          status: quiz.status,
          practiceEnabled: Boolean(quiz.practice_enabled),
          version: quiz.version || (typeof quiz.metadata?.version === "number" ? quiz.metadata.version : 1),
          questions: quiz.questions || [],
        })),
    })),
  };
}

export async function saveTeacherCatalog(catalog: QuizCatalog, userId: string): Promise<void> {
  const client = requireSupabase();
  const subjects = catalog.subjects.map((subject) => ({
    id: subject.id,
    owner_id: userId,
    name: subject.name,
    code: subject.code || "",
    description: subject.description || "",
    seal_logo_url: subject.sealLogoUrl || null,
  }));

  if (subjects.length) {
    const { error } = await client.from("subjects").upsert(subjects, { onConflict: "id" });
    if (error) throw error;
  }

  const quizzes = catalog.subjects.flatMap((subject) => subject.quizzes.map((quiz) => ({
    id: quiz.id,
    owner_id: userId,
    subject_id: subject.id,
    title: quiz.title || quiz.subtitle || "Quiz sin título",
    description: quiz.description || quiz.subtitle || "",
    status: quiz.status || "draft",
    practice_enabled: Boolean(quiz.practiceEnabled),
    questions: quiz.questions || [],
    version: quiz.version || 1,
    metadata: {
      code: quiz.code || "",
      course: quiz.course || "",
      defaultTimerSeconds: quiz.defaultTimerSeconds || 60,
      pointsPerQuestion: quiz.pointsPerQuestion || 1000,
      cardTitle: quiz.cardTitle || "",
      cardSubtitle: quiz.cardSubtitle || "",
      cardImage: quiz.cardImage || "",
      version: quiz.version || 1,
    },
  })));

  if (quizzes.length) {
    const { error } = await client.from("quizzes").upsert(quizzes, { onConflict: "id" });
    if (error) throw error;
  }
}

export async function loadPublicPracticeCatalog(): Promise<QuizCatalog> {
  const client = requireSupabase();
  const [{ data: subjects, error: subjectsError }, { data: quizzes, error: quizzesError }] =
    await Promise.all([
      client.from("subjects").select("id,name,code,description,seal_logo_url").order("created_at"),
      client.from("quizzes").select("id,subject_id,title,description,questions,metadata,version").order("created_at"),
    ]);
  if (subjectsError) throw subjectsError;
  if (quizzesError) throw quizzesError;

  const subjectRows = (subjects || []) as SubjectRow[];
  const quizRows = (quizzes || []) as QuizRow[];
  return {
    version: 1,
    subjects: subjectRows.map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
      sealLogoUrl: subject.seal_logo_url || "",
      quizzes: quizRows
        .filter((quiz) => quiz.subject_id === subject.id)
        .map((quiz) => ({
          ...quiz.metadata,
          id: quiz.id,
          subjectId: quiz.subject_id,
          code: typeof quiz.metadata?.code === "string" ? quiz.metadata.code : "",
          title: quiz.title,
          subtitle: quiz.description || "",
          description: quiz.description || "",
          status: "published" as const,
          practiceEnabled: true,
          version: quiz.version || (typeof quiz.metadata?.version === "number" ? quiz.metadata.version : 1),
          questions: quiz.questions || [],
        })),
    })).filter((subject) => subject.quizzes.length > 0),
  };
}
