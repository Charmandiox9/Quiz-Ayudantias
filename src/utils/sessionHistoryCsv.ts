import type { SessionHistoryEntry } from "../types";

type CsvValue = string | number;

function escapeCsvValue(value: CsvValue): string {
  const text = String(value);
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: CsvValue[][]): void {
  const contents = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${contents}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportDateSuffix(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportSessionResultsCsv(entries: SessionHistoryEntry[]): void {
  const rows: CsvValue[][] = entries.flatMap((entry) => {
    const metadata = [new Date(entry.finishedAt).toLocaleString("es-CL"), entry.subjectLabel, entry.quizTitle, entry.roomCode];
    if (!entry.results.length) return [[...metadata, "", "", "", ""]];
    return entry.results.map((result, index) => [
      ...metadata,
      index + 1,
      result.name,
      result.score,
      result.correctAnswersCount,
    ]);
  });
  downloadCsv(`resultados-sesiones-${exportDateSuffix()}.csv`, [
    "Fecha",
    "Asignatura",
    "Quiz",
    "Sala",
    "Puesto",
    "Apodo",
    "Puntaje",
    "Aciertos",
  ], rows);
}

export function exportSessionQuestionStatsCsv(entries: SessionHistoryEntry[]): void {
  const rows: CsvValue[][] = entries.flatMap((entry) => {
    const metadata = [new Date(entry.finishedAt).toLocaleString("es-CL"), entry.subjectLabel, entry.quizTitle, entry.roomCode];
    if (!entry.questionStats.length) return [[...metadata, "", "", "", "", ""]];
    return entry.questionStats.map((stat) => [
      ...metadata,
      stat.questionNumber,
      stat.question,
      stat.responseCount,
      stat.correctCount,
      stat.responseCount ? Math.round((stat.correctCount / stat.responseCount) * 100) : 0,
    ]);
  });
  downloadCsv(`estadisticas-preguntas-${exportDateSuffix()}.csv`, [
    "Fecha",
    "Asignatura",
    "Quiz",
    "Sala",
    "N° pregunta",
    "Pregunta",
    "Respuestas recibidas",
    "Respuestas correctas",
    "% acierto",
  ], rows);
}
