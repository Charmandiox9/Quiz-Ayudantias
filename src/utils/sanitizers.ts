export function sanitizeNickname(input: string | null | undefined): string {
  if (!input || typeof input !== "string") {
    return generateAnonymousAlias();
  }

  // Eliminar etiquetas HTML y caracteres potencialmente daninos
  const stripped = input.replace(/<[^>]*>?/gm, "").trim();

  // Permitir letras, numeros, guiones y espacios controlados
  const sanitized = stripped.replace(/[^a-zA-Z0-9_ -]/g, "");

  if (sanitized.length < 2) {
    return generateAnonymousAlias();
  }

  return sanitized.slice(0, 15);
}

export function sanitizeRoomCode(input: string | null | undefined): string {
  if (!input || typeof input !== "string") {
    return "AYUDANTIA2";
  }
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

export function generateAnonymousAlias() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `Estudiante-${randomSuffix}`;
}
