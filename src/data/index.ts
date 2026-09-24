import { ay03Solid } from "./ay03_solid";
import { ay02Uml } from "./ay02_uml";
import type { QuizDefinition } from "../types";

export const AYUDANTIAS: QuizDefinition[] = [
  ay03Solid,
  ay02Uml,
];

export function getAyudantiaById(id: string): QuizDefinition {
  return AYUDANTIAS.find((a) => a.id === id) || AYUDANTIAS[0];
}

export function getAyudantiaByCode(code: string | null | undefined): QuizDefinition {
  if (!code) return AYUDANTIAS[0];
  const normalized = code.trim().toUpperCase();
  return (
    AYUDANTIAS.find(
      (a) =>
        a.code === normalized ||
        (Array.isArray(a.altCodes) && a.altCodes.includes(normalized))
    ) || AYUDANTIAS[0]
  );
}
