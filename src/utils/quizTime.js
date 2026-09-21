import { MAX_QUESTION_TIME_SECONDS, MIN_QUESTION_TIME_SECONDS } from "../config/constants.js";

export function isValidQuestionTimeLimitSeconds(seconds) {
  return seconds == null || (
    Number.isInteger(seconds)
    && seconds >= MIN_QUESTION_TIME_SECONDS
    && seconds <= MAX_QUESTION_TIME_SECONDS
  );
}

export function getQuestionTimeLimitSeconds(question, defaultSeconds = 60) {
  const questionSeconds = Number(question?.timeLimitSeconds);
  if (isValidQuestionTimeLimitSeconds(questionSeconds) && questionSeconds !== null) return questionSeconds;

  const fallbackSeconds = Number(defaultSeconds);
  return Number.isInteger(fallbackSeconds) && fallbackSeconds > 0 ? fallbackSeconds : 60;
}
