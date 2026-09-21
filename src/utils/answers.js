import { OPTION_LABELS } from "../config/constants";

export function isMultipleSelect(question) {
  return question?.type === "multiple_select";
}

export function getAnswerIndices(answer) {
  if (Array.isArray(answer)) return answer.map(Number).filter(Number.isInteger).sort((a, b) => a - b);
  if (Number.isInteger(answer)) return [answer];
  if (typeof answer === "string") {
    const index = OPTION_LABELS.indexOf(answer.toUpperCase());
    return index >= 0 ? [index] : [];
  }
  return [];
}

export function isAnswerCorrect(question, answer) {
  const expected = getAnswerIndices(question?.ans);
  const actual = getAnswerIndices(answer);
  if (expected.length !== actual.length) return false;
  return expected.every((index, itemIndex) => index === actual[itemIndex]);
}

export function answerLabels(answer) {
  return getAnswerIndices(answer).map((index) => OPTION_LABELS[index] || String(index + 1));
}

export function responseToOptionIndices(question, response) {
  if (response !== undefined && response !== null) return getAnswerIndices(response);
  return [];
}
