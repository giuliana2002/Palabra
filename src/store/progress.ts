/**
 * Estado global del progreso con Zustand + persistencia en localStorage.
 * Toda la lógica de negocio vive en `src/domain`; aquí solo se orquesta y se guarda.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addDays, toDayKey, type DayKey } from '@/domain/dates';
import { createCard, reviewCard, type Quality, type ReviewCard } from '@/domain/srs';
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

export interface ProgressData {
  currentDay: number;
  results: Record<string, ExerciseResult & { answer?: string }>;
  cards: Record<string, ReviewCard>;
  mistakes: Mistake[];
  activity: Record<DayKey, number>;
  settings: Settings;
}

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
  importData: (data: unknown) => void;
  resetAll: () => void;
}

export type ProgressState = ProgressData & Actions;

const MAX_MISTAKES = 200;

export const initialData = (): ProgressData => ({
  currentDay: 0,
  results: {},
  cards: {},
  mistakes: [],
  activity: {},
  settings: { theme: 'system', voiceURI: null, rate: 0.9, dailyGoal: 30 },
});

export const cardId = (concept: Pick<Concept, 'en'>) => concept.en.toLowerCase();

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

      importData: (data) => set(() => ({ ...parseBackup(data) })),

      resetAll: () => set(() => initialData()),
    }),
    {
      name: 'palabra-progress',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): ProgressData => ({
        currentDay: state.currentDay,
        results: state.results,
        cards: state.cards,
        mistakes: state.mistakes,
        activity: state.activity,
        settings: state.settings,
      }),
    },
  ),
);

function newCard(concept: Concept, due: DayKey): ReviewCard {
  return createCard(
    { id: cardId(concept), front: concept.en, back: concept.es, example: concept.example },
    due,
  );
}

/** Exporta solo los datos (sin funciones) en un formato versionado. */
export function exportBackup(state: ProgressData): string {
  const data: ProgressData = {
    currentDay: state.currentDay,
    results: state.results,
    cards: state.cards,
    mistakes: state.mistakes,
    activity: state.activity,
    settings: state.settings,
  };
  return JSON.stringify(
    { app: 'palabra', version: 1, exportedAt: new Date().toISOString(), data },
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
    settings: {
      ...defaults.settings,
      ...(isObject(data.settings) ? (data.settings as Partial<Settings>) : {}),
    },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
