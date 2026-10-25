/**
 * Tests de una pregunta cada vez: el test diario de repaso y los exámenes semanales.
 * Todo es puro y determinista (RNG con semilla) para poder testearlo y repetirlo.
 */
import { addDays, type DayKey } from './dates';
import { blankOut, listeningDistractors, type ContentBanks } from './exercises';
import { createRng, sample, seedFrom, shuffle, type Rng } from './random';
import { cardKey, type ReviewCard } from './srs';
import { normalize } from './text';
import type { Concept, DayPlan, Dialogue, GrammarError } from './types';

export type Skill = 'vocabulario' | 'gramatica' | 'escucha' | 'comunicacion';

export const SKILL_LABELS: Record<Skill, string> = {
  vocabulario: 'Vocabulario',
  gramatica: 'Gramática',
  escucha: 'Comprensión oral',
  comunicacion: 'Comunicación',
};

export type QuestionKind =
  'en-es' | 'es-en' | 'listen-word' | 'blank' | 'fix' | 'listen' | 'dialogue';

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  skill: Skill;
  prompt: string;
  /** Texto destacado (frase con hueco, frase incorrecta, intervención de A…). */
  context?: string;
  /** Texto que se reproduce con síntesis de voz. */
  audio?: string;
  /** Si es true, el contexto solo se escucha (no se muestra). */
  audioOnly?: boolean;
  options: string[];
  answer: string;
  explanation?: string;
  concept?: Concept;
}

/* ------------------------------------------------------------------ */
/* Constructores de preguntas                                          */
/* ------------------------------------------------------------------ */

function distinctOptions(answer: string, candidates: string[], count: number, rng: Rng): string[] {
  const seen = new Set([normalize(answer)]);
  const picked: string[] = [];
  for (const candidate of shuffle(candidates, rng)) {
    const key = normalize(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    picked.push(candidate);
    if (picked.length === count) break;
  }
  return shuffle([answer, ...picked], rng);
}

export function vocabularyQuestion(
  id: string,
  concept: Concept,
  pool: readonly Concept[],
  kind: 'en-es' | 'es-en' | 'listen-word',
  rng: Rng,
): QuizQuestion {
  const others = pool.filter((c) => normalize(c.en) !== normalize(concept.en));
  if (kind === 'en-es') {
    return {
      id,
      kind,
      skill: 'vocabulario',
      concept,
      prompt: '¿Qué significa esta palabra?',
      context: concept.en,
      audio: concept.en,
      options: distinctOptions(
        concept.es,
        others.map((c) => c.es),
        3,
        rng,
      ),
      answer: concept.es,
      explanation: `${concept.en} = ${concept.es}. ${concept.example}`,
    };
  }
  if (kind === 'es-en') {
    return {
      id,
      kind,
      skill: 'vocabulario',
      concept,
      prompt: `¿Cómo se dice «${concept.es}» en inglés?`,
      options: distinctOptions(
        concept.en,
        others.map((c) => c.en),
        3,
        rng,
      ),
      answer: concept.en,
      explanation: concept.example,
    };
  }
  return {
    id,
    kind,
    skill: 'escucha',
    concept,
    prompt: 'Escucha y elige la palabra que oyes.',
    audio: concept.en,
    audioOnly: true,
    options: distinctOptions(
      concept.en,
      others.map((c) => c.en),
      3,
      rng,
    ),
    answer: concept.en,
    explanation: `${concept.en} = ${concept.es}`,
  };
}

function blankQuestion(
  id: string,
  concept: Concept,
  pool: readonly Concept[],
  rng: Rng,
): QuizQuestion {
  const others = pool.filter((c) => normalize(c.en) !== normalize(concept.en));
  return {
    id,
    kind: 'blank',
    skill: 'vocabulario',
    concept,
    prompt: 'Completa la frase.',
    context: blankOut(concept.example, concept.en) ?? concept.example,
    options: distinctOptions(
      concept.en,
      others.map((c) => c.en),
      3,
      rng,
    ),
    answer: concept.en,
    explanation: `${concept.example} (${concept.en} = ${concept.es})`,
  };
}

function fixQuestion(id: string, error: GrammarError, rng: Rng): QuizQuestion {
  return {
    id,
    kind: 'fix',
    skill: 'gramatica',
    prompt: 'Esta frase tiene un error. ¿Cuál es la correcta?',
    context: error.wrong,
    options: shuffle([error.right, ...error.distractors], rng),
    answer: error.right,
    explanation: error.explanation,
  };
}

function listenQuestion(
  id: string,
  concept: Concept,
  pool: readonly Concept[],
  rng: Rng,
): QuizQuestion {
  return {
    id,
    kind: 'listen',
    skill: 'escucha',
    concept,
    prompt: 'Escucha la frase y elige exactamente lo que oyes.',
    audio: concept.example,
    audioOnly: true,
    options: shuffle(
      [concept.example, ...listeningDistractors(concept.example, concept, pool, rng)],
      rng,
    ),
    answer: concept.example,
  };
}

function dialogueQuestion(id: string, dialogue: Dialogue, rng: Rng): QuizQuestion {
  return {
    id,
    kind: 'dialogue',
    skill: 'comunicacion',
    prompt: `Situación: ${dialogue.situation}. ¿Qué responde B?`,
    context: `A: ${dialogue.line}`,
    options: shuffle([dialogue.answer, ...dialogue.distractors], rng),
    answer: dialogue.answer,
  };
}

/* ------------------------------------------------------------------ */
/* Test diario de repaso                                               */
/* ------------------------------------------------------------------ */

export const REVIEW_QUIZ_SIZE = 10;

export interface ReviewQuizInput {
  days: readonly DayPlan[];
  /** Solo entran palabras de días anteriores a este. */
  currentDay: number;
  cards: Record<string, ReviewCard>;
  today: DayKey;
  size?: number;
}

/**
 * Elige palabras de días anteriores priorizando:
 * 1) las que el repaso espaciado marca como pendientes (las más atrasadas primero),
 * 2) las que se han fallado alguna vez,
 * 3) el resto, al azar (distinto cada día).
 */
export function selectReviewConcepts(
  input: ReviewQuizInput,
): Array<{ concept: Concept; day: DayPlan }> {
  const { days, currentDay, cards, today, size = REVIEW_QUIZ_SIZE } = input;
  const rng = createRng(seedFrom(`review-${today}`));
  const seen = new Set<string>();
  const pool: Array<{ concept: Concept; day: DayPlan }> = [];
  for (const day of days.filter((d) => d.id < currentDay)) {
    for (const concept of day.concepts) {
      const key = cardKey(concept.en);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ concept, day });
    }
  }

  const cardOf = (c: Concept) => cards[cardKey(c.en)];
  const due = pool
    .filter(({ concept }) => {
      const card = cardOf(concept);
      return card && card.due <= today;
    })
    .sort((a, b) => (cardOf(a.concept)?.due ?? '').localeCompare(cardOf(b.concept)?.due ?? ''));
  const lapsed = shuffle(
    pool.filter(
      ({ concept }) =>
        !due.some((d) => d.concept === concept) && (cardOf(concept)?.lapses ?? 0) > 0,
    ),
    rng,
  );
  // Al final: lo ya repasado hoy y lo que no vence hasta dentro de mucho.
  const rank = (c: Concept) => {
    const card = cardOf(c);
    if (card?.lastReview === today) return 2;
    return isFarAway(card, today) ? 1 : 0;
  };
  const rest = shuffle(
    pool.filter(
      ({ concept }) =>
        !due.some((d) => d.concept === concept) && !lapsed.some((l) => l.concept === concept),
    ),
    rng,
  ).sort((a, b) => rank(a.concept) - rank(b.concept));

  return [...due, ...lapsed, ...rest].slice(0, size);
}

function isFarAway(card: ReviewCard | undefined, today: DayKey): boolean {
  return Boolean(card && card.due > addDays(today, 7));
}

export function buildReviewQuiz(input: ReviewQuizInput): QuizQuestion[] {
  const rng = createRng(seedFrom(`review-quiz-${input.today}`));
  const kinds = ['en-es', 'es-en', 'listen-word'] as const;
  return selectReviewConcepts(input).map(({ concept, day }, i) =>
    vocabularyQuestion(
      `review-${input.today}-${i}`,
      concept,
      day.concepts,
      kinds[i % kinds.length] ?? 'en-es',
      rng,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Exámenes semanales                                                  */
/* ------------------------------------------------------------------ */

export interface ExamDefinition {
  id: string;
  week: number;
  title: string;
  /** Días que cubre (inclusive). */
  from: number;
  to: number;
}

export const EXAMS: ExamDefinition[] = [
  { id: 'semana-1', week: 1, title: 'Examen de la semana 1', from: 0, to: 7 },
  { id: 'semana-2', week: 2, title: 'Examen de la semana 2', from: 8, to: 14 },
  { id: 'semana-3', week: 3, title: 'Examen de la semana 3', from: 15, to: 21 },
  { id: 'semana-4', week: 4, title: 'Examen final', from: 22, to: 30 },
];

export const EXAM_SIZE = 20;
export const PASS_MARK = 70;

/** Composición: 6 vocabulario + 4 frase con hueco + 4 gramática + 3 escucha + 3 diálogo = 20. */
export function buildExam(
  exam: ExamDefinition,
  days: readonly DayPlan[],
  banks: ContentBanks,
  attempt = 0,
): QuizQuestion[] {
  const rng = createRng(seedFrom(`${exam.id}-${attempt}`));
  const covered = days.filter((d) => d.id >= exam.from && d.id <= exam.to);
  const level = Math.max(...covered.map((d) => d.level));
  const concepts = covered.flatMap((d) => d.concepts.map((concept) => ({ concept, day: d })));
  const picked = sample(concepts, 13, rng);
  const id = (n: number) => `${exam.id}-${attempt}-${n}`;
  let n = 0;

  const vocab = picked
    .slice(0, 6)
    .map(({ concept, day }, i) =>
      vocabularyQuestion(id(n++), concept, day.concepts, i % 2 ? 'en-es' : 'es-en', rng),
    );
  const blanks = picked
    .slice(6, 10)
    .map(({ concept, day }) => blankQuestion(id(n++), concept, day.concepts, rng));
  const listening = picked
    .slice(10, 13)
    .map(({ concept, day }) => listenQuestion(id(n++), concept, day.concepts, rng));
  const errors = sample(
    banks.errors.filter((e) => e.level <= level),
    4,
    rng,
  ).map((e) => fixQuestion(id(n++), e, rng));
  const dialogues = sample(
    banks.dialogues.filter((d) => d.level <= level),
    3,
    rng,
  ).map((d) => dialogueQuestion(id(n++), d, rng));

  // Se intercalan para que no salgan todas las de un tipo seguidas.
  return shuffle([...vocab, ...blanks, ...errors, ...listening, ...dialogues], rng);
}

/* ------------------------------------------------------------------ */
/* Corrección                                                          */
/* ------------------------------------------------------------------ */

export interface QuizScore {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  bySkill: Array<{ skill: Skill; correct: number; total: number; percent: number }>;
  failed: QuizQuestion[];
}

export function scoreQuiz(
  questions: readonly QuizQuestion[],
  answers: Record<string, string>,
): QuizScore {
  const isRight = (q: QuizQuestion) => answers[q.id] === q.answer;
  const correct = questions.filter(isRight).length;
  const total = questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  const skills = [...new Set(questions.map((q) => q.skill))];
  return {
    correct,
    total,
    percent,
    passed: percent >= PASS_MARK,
    bySkill: skills.map((skill) => {
      const qs = questions.filter((q) => q.skill === skill);
      const ok = qs.filter(isRight).length;
      return { skill, correct: ok, total: qs.length, percent: Math.round((ok / qs.length) * 100) };
    }),
    failed: questions.filter((q) => !isRight(q)),
  };
}
