/** Tipos centrales del dominio. No dependen de React ni del navegador. */

export type Level = 1 | 2 | 3;

export interface Concept {
  /** Palabra o expresión en inglés. */
  en: string;
  /** Traducción al español. */
  es: string;
  /** Frase de ejemplo natural que contiene `en`. */
  example: string;
}

export interface DayPlan {
  id: number;
  title: string;
  goal: string;
  /** Punto gramatical del día (enlaza con la teoría). */
  grammar: string;
  theoryId: string;
  level: Level;
  concepts: Concept[];
}

export interface GrammarError {
  wrong: string;
  right: string;
  /** Otras opciones incorrectas pero plausibles. */
  distractors: [string, string];
  explanation: string;
  level: Level;
}

export interface Dialogue {
  situation: string;
  line: string;
  answer: string;
  /** Respuestas poco naturales o incorrectas para esa situación. */
  distractors: [string, string];
  level: Level;
}

export const EXERCISE_KINDS = ['meaning', 'build', 'fix', 'dialogue', 'listen', 'produce'] as const;
export type ExerciseKind = (typeof EXERCISE_KINDS)[number];

export const KIND_LABELS: Record<ExerciseKind, string> = {
  meaning: 'Significado en contexto',
  build: 'Construir frases',
  fix: 'Corregir errores',
  dialogue: 'Responder en diálogo',
  listen: 'Escucha activa',
  produce: 'Producción personal',
};

interface BaseExercise {
  id: string;
  day: number;
  kind: ExerciseKind;
  /** Concepto que trabaja (si aplica) para alimentar el repaso espaciado. */
  concept?: Concept;
}

export interface ChoiceExercise extends BaseExercise {
  kind: 'meaning' | 'fix' | 'dialogue' | 'listen';
  prompt: string;
  /** Texto adicional: frase con hueco, frase incorrecta, intervención de A… */
  context?: string;
  /** Texto que se reproduce con síntesis de voz (escucha activa). */
  audio?: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface BuildExercise extends BaseExercise {
  kind: 'build';
  prompt: string;
  tokens: string[];
  answer: string;
  hint: string;
}

export interface ProduceExercise extends BaseExercise {
  kind: 'produce';
  prompt: string;
  minWords: number;
  target: string;
}

export type Exercise = ChoiceExercise | BuildExercise | ProduceExercise;

export type DayExercises = Record<ExerciseKind, Exercise[]>;
