import { supabase } from "./supabaseClient";
import type { PlayerScore, QuizDefinition, SessionHistoryEntry, SessionHistoryResult, SessionQuestionStat } from "../types";

interface SessionHistoryRow {
  id: string;
  quiz_id: string;
  quiz_title: string;
  subject_label: string;
  room_code: string;
  started_at: string;
  finished_at: string;
  results: SessionHistoryResult[];
  question_stats: SessionQuestionStat[] | null;
}

function requireSupabase(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error("Supabase no está configurado.");
  return supabase;
}

export async function saveCompletedSession({
  ownerId,
  quiz,
  roomCode,
  startedAt,
  players,
  questionStats,
}: {
  ownerId: string;
  quiz: QuizDefinition;
  roomCode: string;
  startedAt: string;
  players: PlayerScore[];
  questionStats: SessionQuestionStat[];
}): Promise<void> {
  const results = [...players]
    .sort((left, right) => right.score - left.score || right.correctAnswersCount - left.correctAnswersCount)
    .map(({ name, score, correctAnswersCount }) => ({ name, score, correctAnswersCount }));
  const { error } = await requireSupabase().from("quiz_sessions").insert({
    owner_id: ownerId,
    quiz_id: quiz.id,
    quiz_title: quiz.title,
    subject_label: quiz.courseLabel || quiz.course || "",
    room_code: roomCode,
    started_at: startedAt,
    results,
    question_stats: questionStats,
  });
  if (error) throw error;
}

export async function loadSessionHistory(ownerId: string): Promise<SessionHistoryEntry[]> {
  const { data, error } = await requireSupabase()
    .from("quiz_sessions")
    .select("id,quiz_id,quiz_title,subject_label,room_code,started_at,finished_at,results,question_stats")
    .eq("owner_id", ownerId)
    .order("finished_at", { ascending: false });
  if (error) throw error;

  return ((data || []) as SessionHistoryRow[]).map((row) => ({
    id: row.id,
    quizId: row.quiz_id,
    quizTitle: row.quiz_title,
    subjectLabel: row.subject_label || "",
    roomCode: row.room_code,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    results: Array.isArray(row.results) ? row.results : [],
    questionStats: Array.isArray(row.question_stats) ? row.question_stats : [],
  }));
}

export async function deleteSessionHistoryEntry(ownerId: string, sessionId: string): Promise<void> {
  const { error } = await requireSupabase()
    .from("quiz_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("owner_id", ownerId);
  if (error) throw error;
}
