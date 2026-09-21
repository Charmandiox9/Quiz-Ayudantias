import { supabase } from "./supabaseClient";

function requireSupabase() {
  if (!supabase) throw new Error("Supabase no está configurado.");
}

export async function hasTeacherAccess(userId) {
  requireSupabase();
  const { data, error } = await supabase
    .from("teacher_access")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function loadTeacherCatalog(userId) {
  requireSupabase();
  const [{ data: subjects, error: subjectsError }, { data: quizzes, error: quizzesError }] =
    await Promise.all([
      supabase.from("subjects").select("*").eq("owner_id", userId).order("created_at"),
      supabase.from("quizzes").select("*").eq("owner_id", userId).order("created_at"),
    ]);
  if (subjectsError) throw subjectsError;
  if (quizzesError) throw quizzesError;

  return {
    version: 1,
    subjects: (subjects || []).map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
      sealLogoUrl: subject.seal_logo_url || "",
      quizzes: (quizzes || [])
        .filter((quiz) => quiz.subject_id === subject.id)
        .map((quiz) => ({
          ...quiz.metadata,
          id: quiz.id,
          subjectId: quiz.subject_id,
          title: quiz.title,
          subtitle: quiz.description || "",
          description: quiz.description || "",
          status: quiz.status,
          version: quiz.version || quiz.metadata?.version || 1,
          questions: quiz.questions || [],
        })),
    })),
  };
}

export async function saveTeacherCatalog(catalog, userId) {
  requireSupabase();
  const subjects = catalog.subjects.map((subject) => ({
    id: subject.id,
    owner_id: userId,
    name: subject.name,
    code: subject.code || "",
    description: subject.description || "",
    seal_logo_url: subject.sealLogoUrl || null,
  }));

  if (subjects.length) {
    const { error } = await supabase.from("subjects").upsert(subjects, { onConflict: "id" });
    if (error) throw error;
  }

  const quizzes = catalog.subjects.flatMap((subject) => subject.quizzes.map((quiz) => ({
    id: quiz.id,
    owner_id: userId,
    subject_id: subject.id,
    title: quiz.title || quiz.subtitle || "Quiz sin título",
    description: quiz.description || quiz.subtitle || "",
    status: quiz.status || "draft",
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
    const { error } = await supabase.from("quizzes").upsert(quizzes, { onConflict: "id" });
    if (error) throw error;
  }
}
