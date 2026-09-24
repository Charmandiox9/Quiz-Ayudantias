import { MAX_QUESTION_TIME_SECONDS, MIN_QUESTION_TIME_SECONDS } from "../config/constants";
import type { QuizQuestion } from "../types";

export function isValidQuestionTimeLimitSeconds(seconds: number | null | undefined): boolean {
  return seconds == null || (
    Number.isInteger(seconds)
    && seconds >= MIN_QUESTION_TIME_SECONDS
    && seconds <= MAX_QUESTION_TIME_SECONDS
  );
}

export function getQuestionTimeLimitSeconds(question: Pick<QuizQuestion, "timeLimitSeconds"> | null | undefined, defaultSeconds = 60): number {
  const questionSeconds = Number(question?.timeLimitSeconds);
  if (isValidQuestionTimeLimitSeconds(questionSeconds) && questionSeconds !== null) return questionSeconds;

  const fallbackSeconds = Number(defaultSeconds);
  return Number.isInteger(fallbackSeconds) && fallbackSeconds > 0 ? fallbackSeconds : 60;
}
