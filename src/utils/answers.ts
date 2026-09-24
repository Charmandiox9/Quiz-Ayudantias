import { OPTION_LABELS } from "../config/constants";
import type { AnswerQuestion, AnswerValue } from "../types";

export function isMultipleSelect(question: AnswerQuestion | null | undefined): boolean {
  return question?.type === "multiple_select";
}

export function isShortAnswer(question: AnswerQuestion | null | undefined): boolean {
  return question?.type === "short_answer";
}

export function isOrdering(question: AnswerQuestion | null | undefined): boolean {
  return question?.type === "ordering";
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es");
}

export function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, index) => index);
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[randomIndex]] = [indices[randomIndex], indices[index]];
  }
  return indices;
}

export function getAnswerIndices(answer: AnswerValue | null | undefined): number[] {
  if (Array.isArray(answer)) return answer.map(Number).filter(Number.isInteger).sort((a, b) => a - b);
  if (typeof answer === "number" && Number.isInteger(answer)) return [answer];
  if (typeof answer === "string") {
    const index = OPTION_LABELS.indexOf(answer.toUpperCase());
    return index >= 0 ? [index] : [];
  }
  return [];
}

export function isAnswerCorrect(question: AnswerQuestion | null | undefined, answer: AnswerValue | null | undefined): boolean {
  if (isShortAnswer(question)) {
    const expectedAnswers = Array.isArray(question?.ans) ? question.ans : [question?.ans];
    const normalizedAnswer = normalizeText(answer);
    return Boolean(normalizedAnswer) && expectedAnswers.some(
      (expected) => normalizeText(expected) === normalizedAnswer
    );
  }

  if (isOrdering(question)) {
    const expected = Array.isArray(question?.ans) ? question.ans.map(Number) : [];
    const actual = Array.isArray(answer) ? answer.map(Number) : [];
    return expected.length > 1 && actual.length === expected.length &&
      expected.every((index, itemIndex) => index === actual[itemIndex]);
  }

  const expected = getAnswerIndices(question?.ans);
  const actual = getAnswerIndices(answer);
  if (expected.length !== actual.length) return false;
  return expected.every((index, itemIndex) => index === actual[itemIndex]);
}

export function answerLabels(answer: AnswerValue | null | undefined): string[] {
  return getAnswerIndices(answer).map((index) => OPTION_LABELS[index] || String(index + 1));
}

export function responseToOptionIndices(question: AnswerQuestion | null | undefined, response: AnswerValue | null | undefined): number[] {
  if (isShortAnswer(question)) return [];
  if (isOrdering(question) && Array.isArray(response)) return response.map(Number).filter(Number.isInteger);
  if (response !== undefined && response !== null) return getAnswerIndices(response);
  return [];
}

export function formatAnswerText(question: AnswerQuestion | null | undefined, response: AnswerValue | null | undefined): string {
  if (isShortAnswer(question)) {
    return (Array.isArray(response) ? response : [response])
      .map((answer) => String(answer ?? "").trim())
      .filter(Boolean)
      .join(" · ");
  }
  const indices = isOrdering(question) && Array.isArray(response)
    ? response.map(Number).filter(Number.isInteger)
    : getAnswerIndices(response);
  const options = question?.opts || question?.optionTexts || [];
  const texts = indices.map((index) => options[index]).filter(Boolean);
  return isOrdering(question) ? texts.join(" → ") : texts.join(", ");
}
