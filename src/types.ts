export type QuestionType =
  | "single_choice"
  | "multiple_select"
  | "true_false"
  | "short_answer"
  | "ordering";

export type AnswerValue = number | string | number[] | string[];
export type SelectedAnswer = number | string | number[] | null;
export type QuizStatus = "draft" | "published" | "archived";
export type ImageAssetType = "question" | "subject-seal" | "quiz-card";
export type GamePhase =
  | "lobby"
  | "question"
  | "votes"
  | "reveal"
  | "leaderboard"
  | "finished";

export interface QuizQuestion {
  id: number | string;
  type?: QuestionType;
  topic?: string;
  q: string;
  opts: string[];
  ans: AnswerValue;
  exp?: string;
  diagramSnippet?: string;
  image?: string;
  timeLimitSeconds?: number | null;
}

export interface AnswerQuestion {
  type?: QuestionType;
  ans?: AnswerValue | null;
  opts?: string[];
  optionTexts?: string[];
}

export interface QuizDefinition {
  id: string;
  code: string;
  altCodes?: string[];
  number?: number;
  title: string;
  subtitle?: string;
  description?: string;
  course?: string;
  courseLabel?: string;
  semester?: string;
  cardImage?: string;
  cardImageLegacy?: string;
  cardTitle?: string;
  cardSubtitle?: string;
  sealLogoUrl?: string;
  defaultTimerSeconds?: number;
  pointsPerQuestion?: number;
  subjectId?: string;
  version?: number;
  status?: QuizStatus;
  practiceEnabled?: boolean;
  questions: QuizQuestion[];
}

export interface CatalogSubject {
  id: string;
  name: string;
  code: string;
  description: string;
  sealLogoUrl?: string;
  quizzes: QuizDefinition[];
}

export interface QuizCatalog {
  version: number;
  subjects: CatalogSubject[];
}

export interface EditorQuestion {
  type: QuestionType;
  prompt: string;
  topic: string;
  options: string[];
  correctOption: string;
  correctOptions: string[];
  acceptedAnswers: string;
  timeLimitSeconds: string;
  imageUrl: string;
  explanation: string;
  image?: string;
  imageData?: string;
}

export interface QuizForm {
  title: string;
  description: string;
  cardTitle: string;
  cardSubtitle: string;
  cardImage: string;
  practiceEnabled: boolean;
  questions: EditorQuestion[];
}

export interface PlayerInfo {
  name: string;
  roomCode: string;
  playerId: string;
  ayudantia: QuizDefinition;
}

export interface StoredPlayerSession {
  name: string;
  roomCode: string;
  role: "player";
  playerId?: string;
  ayudantiaId?: string;
}

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
  lastEarnedPoints: number;
  correctAnswersCount: number;
  lastOption?: string;
}

export interface SessionHistoryResult {
  name: string;
  score: number;
  correctAnswersCount: number;
}

export interface SessionHistoryEntry {
  id: string;
  quizId: string;
  quizTitle: string;
  subjectLabel: string;
  roomCode: string;
  startedAt: string;
  finishedAt: string;
  results: SessionHistoryResult[];
}

export interface LiveGameState {
  phase: GamePhase;
  questionIndex: number;
  totalQuestions: number;
  correctAnswerIndex: AnswerValue | null;
  answerType: QuestionType;
  prompt: string;
  image: string;
  optionTexts: string[];
  optionOrder: number[];
  players: PlayerScore[];
  perfectPlayerIds?: string[];
  rewardCard?: RewardCardInfo;
}

export interface LivePlayer {
  id?: string;
  role?: "host" | "player";
  name: string;
  score?: number;
  lastEarnedPoints?: number;
  correctAnswersCount?: number;
  lastOption?: string;
}

export interface LiveQuestionPayload {
  questionIndex: number;
  totalQuestions: number;
  answerType: QuestionType;
  prompt: string;
  image: string;
  optionTexts: string[];
  optionOrder: number[];
  timerSeconds?: number;
}

export interface LiveVotePayload {
  playerId?: string;
  playerName: string;
  optionLabel?: string;
  answer?: AnswerValue;
}

export type RealtimeEventName =
  | "player:join"
  | "player:vote"
  | "game:state"
  | "game:next"
  | "game:end"
  | "game:closed"
  | "player:reject";

export interface RewardCardInfo {
  title: string;
  subtitle: string;
  image: string;
  sealLogoSrc: string;
  courseLabel: string;
  quizTitle: string;
}

export interface AnswerHistoryEntry {
  questionId: number | string;
  questionIndex: number;
  question: QuizQuestion;
  selectedOption: SelectedAnswer;
  correctOption: AnswerValue;
  isCorrect: boolean;
}
