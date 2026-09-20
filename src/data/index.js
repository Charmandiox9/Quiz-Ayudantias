import { ay03Solid } from "./ay03_solid.js";
import { ay02Uml } from "./ay02_uml.js";

export const AYUDANTIAS = [
  ay03Solid,
  ay02Uml,
];

export function getAyudantiaById(id) {
  return AYUDANTIAS.find((a) => a.id === id) || AYUDANTIAS[0];
}

export function getAyudantiaByCode(code) {
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
