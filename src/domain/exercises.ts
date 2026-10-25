/**
 * Generación de las 90 actividades de un día (6 tipos × 15).
 * Es una función pura: mismo día ⇒ mismos ejercicios, gracias al RNG con semilla.
 */
import { createRng, sample, seedFrom, shuffle, type Rng } from './random';
import { normalize, tokenize, usesConcept, words } from './text';
import {
  EXERCISE_KINDS,
  type BuildExercise,
  type ChoiceExercise,
  type Concept,
  type DayExercises,
  type DayPlan,
  type Dialogue,
  type GrammarError,
  type ProduceExercise,
} from './types';

export const EXERCISES_PER_KIND = 15;
export const EXERCISES_PER_DAY = EXERCISES_PER_KIND * EXERCISE_KINDS.length;

export interface ContentBanks {
  errors: readonly GrammarError[];
  dialogues: readonly Dialogue[];
}

export function generateDay(plan: DayPlan, banks: ContentBanks): DayExercises {
  const rng = createRng(seedFrom(`palabra-day-${plan.id}`));
  const concepts = plan.concepts.slice(0, EXERCISES_PER_KIND);
  return {
    meaning: concepts.map((c, i) => meaningExercise(plan, c, i, rng)),
    build: concepts.map((c, i) => buildExercise(plan, c, i, rng)),
    fix: pickByLevel(banks.errors, plan.level, rng).map((e, i) => fixExercise(plan, e, i, rng)),
    dialogue: pickByLevel(banks.dialogues, plan.level, rng).map((d, i) =>
      dialogueExercise(plan, d, i, rng),
    ),
    listen: concepts.map((c, i) => listenExercise(plan, c, i, rng)),
    produce: concepts.map((c, i) => produceExercise(plan, c, i)),
  };
}

const id = (plan: DayPlan, kind: string, index: number) => `d${plan.id}-${kind}-${index}`;

/** Sustituye el concepto por un hueco respetando límites de palabra. */
export function blankOut(sentence: string, target: string): string | null {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]");
  const regex = new RegExp(`(^|[^A-Za-z])${escaped}(?=[^A-Za-z]|$)`, 'i');
  if (!regex.test(sentence)) return null;
  return sentence.replace(regex, (_m, before: string) => `${before}_____`);
}

function meaningExercise(plan: DayPlan, concept: Concept, index: number, rng: Rng): ChoiceExercise {
  const blanked = blankOut(concept.example, concept.en);
  const others = plan.concepts.filter((c) => normalize(c.en) !== normalize(concept.en));
  const distractors = sample(others, 3, rng).map((c) => c.en);
  return {
    id: id(plan, 'meaning', index),
    day: plan.id,
    kind: 'meaning',
    concept,
    prompt: blanked
      ? `Completa la frase con la expresión que significa «${concept.es}».`
      : `¿Qué expresión significa «${concept.es}»?`,
    context: blanked ?? concept.example,
    options: shuffle([concept.en, ...distractors], rng),
    answer: concept.en,
    explanation: `«${concept.en}» = ${concept.es}. Ejemplo: ${concept.example}`,
  };
}

function buildExercise(plan: DayPlan, concept: Concept, index: number, rng: Rng): BuildExercise {
  const tokens = tokenize(concept.example);
  let shuffled = shuffle(tokens, rng);
  for (
    let attempt = 0;
    attempt < 5 && tokens.length > 1 && shuffled.join() === tokens.join();
    attempt++
  ) {
    shuffled = shuffle(tokens, rng);
  }
  return {
    id: id(plan, 'build', index),
    day: plan.id,
    kind: 'build',
    concept,
    prompt: 'Ordena las palabras para formar una frase correcta.',
    tokens: shuffled,
    answer: concept.example,
    hint: `Usa «${concept.en}» (${concept.es}).`,
  };
}

function fixExercise(plan: DayPlan, error: GrammarError, index: number, rng: Rng): ChoiceExercise {
  return {
    id: id(plan, 'fix', index),
    day: plan.id,
    kind: 'fix',
    prompt: 'Esta frase tiene un error. ¿Cuál es la versión correcta?',
    context: error.wrong,
    options: shuffle([error.right, ...error.distractors], rng),
    answer: error.right,
    explanation: error.explanation,
  };
}

function dialogueExercise(
  plan: DayPlan,
  dialogue: Dialogue,
  index: number,
  rng: Rng,
): ChoiceExercise {
  return {
    id: id(plan, 'dialogue', index),
    day: plan.id,
    kind: 'dialogue',
    prompt: `Situación: ${dialogue.situation}. ¿Qué responde B de forma más natural?`,
    context: `A: ${dialogue.line}`,
    options: shuffle([dialogue.answer, ...dialogue.distractors], rng),
    answer: dialogue.answer,
  };
}

function listenExercise(plan: DayPlan, concept: Concept, index: number, rng: Rng): ChoiceExercise {
  const distractors = listeningDistractors(concept.example, concept, plan.concepts, rng);
  return {
    id: id(plan, 'listen', index),
    day: plan.id,
    kind: 'listen',
    concept,
    prompt: 'Escucha la frase y elige exactamente lo que oyes.',
    audio: concept.example,
    options: shuffle([concept.example, ...distractors], rng),
    answer: concept.example,
  };
}

function produceExercise(plan: DayPlan, concept: Concept, index: number): ProduceExercise {
  return {
    id: id(plan, 'produce', index),
    day: plan.id,
    kind: 'produce',
    concept,
    prompt: `Escribe una frase propia de al menos 5 palabras con «${concept.en}» (${concept.es}).`,
    minWords: 5,
    target: concept.en,
  };
}

/** Selecciona 15 elementos priorizando el nivel del día y completando con niveles inferiores. */
function pickByLevel<T extends { level: number }>(
  bank: readonly T[],
  level: number,
  rng: Rng,
): T[] {
  const same = shuffle(
    bank.filter((x) => x.level === level),
    rng,
  );
  const easier = shuffle(
    bank.filter((x) => x.level < level),
    rng,
  );
  const rest = shuffle(
    bank.filter((x) => x.level > level),
    rng,
  );
  const pool = [...same, ...easier, ...rest];
  return Array.from({ length: EXERCISES_PER_KIND }, (_, i) => pool[i % pool.length] as T);
}

/**
 * Pares mínimos para la escucha: frases que se diferencian en una sola palabra
 * (pronombre, tiempo, determinante…), para entrenar el oído de verdad.
 */
const MINIMAL_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['I', 'you'],
  ['you', 'we'],
  ['he', 'she'],
  ['she', 'he'],
  ['we', 'they'],
  ['they', 'we'],
  ['my', 'your'],
  ['your', 'my'],
  ['his', 'her'],
  ['her', 'his'],
  ['our', 'their'],
  ['is', 'was'],
  ['are', 'were'],
  ['was', 'is'],
  ['were', 'are'],
  ['am', 'was'],
  ['can', "can't"],
  ['can', 'could'],
  ['will', 'would'],
  ["don't", "doesn't"],
  ['do', 'did'],
  ['a', 'the'],
  ['the', 'a'],
  ['this', 'that'],
  ['that', 'this'],
  ['these', 'those'],
  ['today', 'tomorrow'],
  ['tomorrow', 'today'],
  ['yesterday', 'today'],
  ['now', 'later'],
  ['in', 'on'],
  ['on', 'in'],
  ['at', 'in'],
  ['to', 'for'],
  ['some', 'any'],
  ['every', 'very'],
  ['want', 'went'],
  ['live', 'leave'],
  ['ship', 'sheep'],
  ['it', 'eat'],
  ['three', 'tree'],
  ['thirteen', 'thirty'],
  ['fifteen', 'fifty'],
  ['always', 'usually'],
];

export function listeningDistractors(
  sentence: string,
  own: Concept | null,
  concepts: readonly Concept[],
  rng: Rng,
): string[] {
  const results = new Set<string>();
  const key = normalize(sentence);
  const tokens = sentence.split(' ');

  for (const [from, to] of shuffle(MINIMAL_PAIRS, rng)) {
    if (results.size >= 2) break;
    const index = tokens.findIndex((t) => normalize(t) === from.toLowerCase());
    if (index === -1) continue;
    const original = tokens[index] as string;
    const replaced =
      matchCase(original, to) + original.slice(original.replace(/[.,!?]+$/, '').length);
    const variant = [...tokens.slice(0, index), replaced, ...tokens.slice(index + 1)].join(' ');
    if (normalize(variant) !== key) results.add(variant);
  }

  // Si no hay pares mínimos suficientes, cambia el concepto por otro del día.
  const blanked = own ? blankOut(sentence, own.en) : null;
  if (blanked) {
    for (const other of shuffle(concepts, rng)) {
      if (results.size >= 2) break;
      const variant = blanked.replace('_____', other.en);
      if (normalize(variant) !== key) results.add(variant);
    }
  }

  // Último recurso: quitar una palabra para que la diferencia siga siendo sutil.
  const plain = sentence.split(' ');
  for (let i = 1; results.size < 2 && i < plain.length; i++) {
    const variant = [...plain.slice(0, i), ...plain.slice(i + 1)].join(' ');
    if (normalize(variant) !== key && words(variant).length > 1) results.add(variant);
  }
  return [...results].slice(0, 2);
}

function matchCase(original: string, replacement: string): string {
  if (
    original[0] &&
    original[0] === original[0].toUpperCase() &&
    original[0] !== original[0].toLowerCase()
  ) {
    return replacement[0]?.toUpperCase() + replacement.slice(1);
  }
  return replacement === 'I' ? 'I' : replacement.toLowerCase();
}

/** Revisión de producción libre: no es corrección completa, pero detecta lo básico. */
export interface ProductionFeedback {
  ok: boolean;
  issues: string[];
  tips: string[];
}

export function checkProduction(
  text: string,
  target: string,
  minWords: number,
): ProductionFeedback {
  const trimmed = text.trim();
  const issues: string[] = [];
  const tips: string[] = [];
  const count = words(trimmed).length;
  if (count < minWords) issues.push(`Escribe al menos ${minWords} palabras (llevas ${count}).`);
  if (!usesConcept(trimmed, target)) issues.push(`Incluye «${target}» en tu frase.`);
  if (trimmed && trimmed[0] !== trimmed[0]?.toUpperCase()) tips.push('Empieza con mayúscula.');
  if (trimmed && !/[.!?]$/.test(trimmed))
    tips.push('Termina con un punto o signo de interrogación.');
  if (/(^|\s)i(\s|'|’)/.test(trimmed)) tips.push('El pronombre «I» siempre va en mayúscula.');
  if (/\b(\w+)\s+\1\b/i.test(trimmed)) tips.push('Hay una palabra repetida seguida.');
  return { ok: issues.length === 0, issues, tips };
}
