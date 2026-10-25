/**
 * Estado global del progreso con Zustand + persistencia en localStorage.
 * Toda la lógica de negocio vive en `src/domain`; aquí solo se orquesta y se guarda.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addDays, toDayKey, type DayKey } from '@/domain/dates';
import { cardKey, createCard, reviewCard, type Quality, type ReviewCard } from '@/domain/srs';
import type { ExerciseResult } from '@/domain/stats';
import type { Concept, ExerciseKind } from '@/domain/types';

export interface Mistake {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  given: string;
  correct: string;
  explanation?: string;
  at: DayKey;
}

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  voiceURI: string | null;
  rate: number;
  dailyGoal: number;
}

export interface SessionRecord {
  day: number;
  correct: number;
  total: number;
  minutes: number;
}

export interface ExamRecord {
  best: number;
  last: number;
  attempts: number;
  passed: boolean;
  at: DayKey;
}

export interface ProgressData {
  currentDay: number;
  results: Record<string, ExerciseResult & { answer?: string }>;
  cards: Record<string, ReviewCard>;
  mistakes: Mistake[];
  activity: Record<DayKey, number>;
  /** v2: sesiones guiadas completadas, por fecha. */
  sessions: Record<DayKey, SessionRecord>;
  /** v2: resultados de los exámenes semanales, por id de examen. */
  exams: Record<string, ExamRecord>;
  settings: Settings;
}

export const STORE_VERSION = 2;

export interface RecordInput {
  exerciseId: string;
  kind: ExerciseKind;
  day: number;
  ok: boolean;
  given: string;
  correct: string;
  prompt: string;
  explanation?: string;
  concept?: Concept;
}

interface Actions {
  setCurrentDay: (day: number) => void;
  recordAnswer: (input: RecordInput, today?: DayKey) => void;
  resetDay: (day: number) => void;
  addCard: (concept: Concept, today?: DayKey) => void;
  review: (cardId: string, quality: Quality, today?: DayKey) => void;
  removeCard: (cardId: string) => void;
  clearMistakes: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  logActivity: (count?: number, today?: DayKey) => void;
  /** Respuesta del test de repaso: actualiza la tarjeta con SM-2 (acierto = "bien", fallo = "otra vez"). */
  answerReview: (concept: Concept, ok: boolean, today?: DayKey) => void;
  /** Guarda la nota de un examen y manda las palabras falladas al repaso de hoy. */
  recordExam: (
    examId: string,
    percent: number,
    passed: boolean,
    failed: Concept[],
    today?: DayKey,
  ) => void;
  /** Cierra la sesión guiada del día y avanza la ruta al día siguiente. */
  completeSession: (record: SessionRecord, today?: DayKey) => void;
  importData: (data: unknown) => void;
  resetAll: () => void;
}

export type ProgressState = ProgressData & Actions;

const MAX_MISTAKES = 200;
const LAST_DAY = 30;

export const initialData = (): ProgressData => ({
  currentDay: 0,
  results: {},
  cards: {},
  mistakes: [],
  activity: {},
  sessions: {},
  exams: {},
  settings: { theme: 'system', voiceURI: null, rate: 0.9, dailyGoal: 30 },
});

export const cardId = (concept: Pick<Concept, 'en'>) => cardKey(concept.en);

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...initialData(),

      setCurrentDay: (day) => set({ currentDay: day }),

      recordAnswer: (input, today = toDayKey()) =>
        set((state) => {
          if (state.results[input.exerciseId]) return state;
          const results = {
            ...state.results,
            [input.exerciseId]: {
              ok: input.ok,
              kind: input.kind,
              day: input.day,
              at: today,
              answer: input.given,
            },
          };
          const activity = { ...state.activity, [today]: (state.activity[today] ?? 0) + 1 };

          // Cada concepto trabajado entra en el repaso espaciado.
          // Si se falla, vence hoy mismo; si se acierta, mañana.
          let cards = state.cards;
          if (input.concept) {
            const id = cardId(input.concept);
            const existing = cards[id];
            if (!existing) {
              cards = {
                ...cards,
                [id]: newCard(input.concept, input.ok ? addDays(today, 1) : today),
              };
            } else if (!input.ok) {
              cards = { ...cards, [id]: { ...reviewCard(existing, 1, today), due: today } };
            }
          }

          const mistakes = input.ok
            ? state.mistakes
            : [
                {
                  id: input.exerciseId,
                  kind: input.kind,
                  prompt: input.prompt,
                  given: input.given,
                  correct: input.correct,
                  explanation: input.explanation,
                  at: today,
                },
                ...state.mistakes,
              ].slice(0, MAX_MISTAKES);

          return { results, activity, cards, mistakes };
        }),

      resetDay: (day) =>
        set((state) => ({
          results: Object.fromEntries(
            Object.entries(state.results).filter(([, r]) => r.day !== day),
          ),
        })),

      addCard: (concept, today = toDayKey()) =>
        set((state) => {
          const id = cardId(concept);
          if (state.cards[id]) return state;
          return { cards: { ...state.cards, [id]: newCard(concept, today) } };
        }),

      review: (id, quality, today = toDayKey()) =>
        set((state) => {
          const card = state.cards[id];
          if (!card) return state;
          return {
            cards: { ...state.cards, [id]: reviewCard(card, quality, today) },
            activity: { ...state.activity, [today]: (state.activity[today] ?? 0) + 1 },
          };
        }),

      removeCard: (id) =>
        set((state) => {
          const { [id]: _removed, ...cards } = state.cards;
          return { cards };
        }),

      clearMistakes: () => set({ mistakes: [] }),

      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

      logActivity: (count = 1, today = toDayKey()) =>
        set((state) => ({
          activity: { ...state.activity, [today]: (state.activity[today] ?? 0) + count },
        })),

      answerReview: (concept, ok, today = toDayKey()) =>
        set((state) => {
          const id = cardId(concept);
          const card = state.cards[id] ?? newCard(concept, today);
          return {
            cards: { ...state.cards, [id]: reviewCard(card, ok ? 4 : 1, today) },
            activity: { ...state.activity, [today]: (state.activity[today] ?? 0) + 1 },
          };
        }),

      recordExam: (examId, percent, passed, failed, today = toDayKey()) =>
        set((state) => {
          const previous = state.exams[examId];
          const cards = { ...state.cards };
          for (const concept of failed) {
            const id = cardId(concept);
            const card = cards[id] ?? newCard(concept, today);
            cards[id] = { ...card, repetitions: 0, interval: 0, due: today };
          }
          return {
            cards,
            exams: {
              ...state.exams,
              [examId]: {
                best: Math.max(percent, previous?.best ?? 0),
                last: percent,
                attempts: (previous?.attempts ?? 0) + 1,
                passed: passed || Boolean(previous?.passed),
                at: today,
              },
            },
          };
        }),

      completeSession: (record, today = toDayKey()) =>
        set((state) => ({
          sessions: { ...state.sessions, [today]: record },
          currentDay: Math.min(LAST_DAY, Math.max(state.currentDay, record.day + 1)),
        })),

      importData: (data) => set(() => ({ ...parseBackup(data) })),

      resetAll: () => set(() => initialData()),
    }),
    {
      name: 'palabra-progress',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => migrateProgress(persisted, version),
      partialize: (state): ProgressData => pickData(state),
    },
  ),
);

function newCard(concept: Concept, due: DayKey): ReviewCard {
  return createCard(
    { id: cardId(concept), front: concept.en, back: concept.es, example: concept.example },
    due,
  );
}

function pickData(state: ProgressData): ProgressData {
  return {
    currentDay: state.currentDay,
    results: state.results,
    cards: state.cards,
    mistakes: state.mistakes,
    activity: state.activity,
    sessions: state.sessions,
    exams: state.exams,
    settings: state.settings,
  };
}

/**
 * Migraciones del estado guardado. Cada versión añade lo que falta sin tocar lo existente,
 * para que nadie pierda su progreso al actualizar la app.
 * v1 → v2: se añaden `sessions` y `exams`.
 */
export function migrateProgress(persisted: unknown, version: number): ProgressData {
  const state = (isObject(persisted) ? persisted : {}) as Partial<ProgressData>;
  const defaults = initialData();
  if (version < 2) {
    return {
      ...defaults,
      ...state,
      sessions: {},
      exams: {},
      settings: { ...defaults.settings, ...state.settings },
    };
  }
  return { ...defaults, ...state };
}

/** Exporta solo los datos (sin funciones) en un formato versionado. */
export function exportBackup(state: ProgressData): string {
  const data = pickData(state);
  return JSON.stringify(
    { app: 'palabra', version: STORE_VERSION, exportedAt: new Date().toISOString(), data },
    null,
    2,
  );
}

/** Valida una copia de seguridad antes de cargarla para no corromper el estado. */
export function parseBackup(raw: unknown): ProgressData {
  const backup = typeof raw === 'string' ? (JSON.parse(raw) as unknown) : raw;
  if (!isObject(backup) || backup.app !== 'palabra' || !isObject(backup.data)) {
    throw new Error('El archivo no es una copia de seguridad de Palabra.');
  }
  const data = backup.data;
  const defaults = initialData();
  const currentDay =
    typeof data.currentDay === 'number' && data.currentDay >= 0 && data.currentDay <= 30
      ? data.currentDay
      : 0;
  return {
    currentDay,
    results: isObject(data.results) ? (data.results as ProgressData['results']) : {},
    cards: isObject(data.cards) ? (data.cards as ProgressData['cards']) : {},
    mistakes: Array.isArray(data.mistakes) ? (data.mistakes as Mistake[]) : [],
    activity: isObject(data.activity) ? (data.activity as ProgressData['activity']) : {},
    sessions: isObject(data.sessions) ? (data.sessions as ProgressData['sessions']) : {},
    exams: isObject(data.exams) ? (data.exams as ProgressData['exams']) : {},
    settings: {
      ...defaults.settings,
      ...(isObject(data.settings) ? (data.settings as Partial<Settings>) : {}),
    },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
