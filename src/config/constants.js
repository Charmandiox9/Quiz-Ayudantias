export const APP_CONFIG = {
  appName: "Quiz Ayudantia Ingenieria de Software",
  defaultTimerSeconds: 60,
  minPointsPerCorrectAnswer: 500,
  maxPointsPerCorrectAnswer: 1000,
  maxNicknameLength: 15,
  minNicknameLength: 2,
  defaultRoomCode: "AYUDANTIA2",
};

export const GAME_PHASES = {
  LOBBY: "lobby",
  QUESTION: "question",
  VOTES: "votes",
  REVEAL: "reveal",
  LEADERBOARD: "leaderboard",
  FINISHED: "finished",
};

export const MAX_ANSWER_OPTIONS = 8;
export const MIN_QUESTION_TIME_SECONDS = 5;
export const MAX_QUESTION_TIME_SECONDS = 600;
export const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const OPTION_COLORS = {
  A: "#DC2626", // Rojo cardinal
  B: "#2563EB", // Azul real
  C: "#D97706", // Ambar
  D: "#059669", // Esmeralda
  E: "#7C3AED", // Violeta
  F: "#0E7490", // Cian oscuro
  G: "#BE185D", // Frambuesa
  H: "#4D7C0F", // Oliva
};

export const THEME = {
  primary: "#1E2761",
  primaryHover: "#2A367D",
  accent: "#D97706",
  accentHover: "#B45309",
  background: "#F8FAFC",
  cardBackground: "#FFFFFF",
  cardBorder: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  success: "#16A34A",
  error: "#DC2626",
  warning: "#EA580C",
};
