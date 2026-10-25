import { describe, expect, it } from 'vitest';
import { BANKS, DAYS } from '@/data';
import { addDays } from './dates';
import {
  buildExam,
  buildReviewQuiz,
  EXAM_SIZE,
  EXAMS,
  scoreQuiz,
  selectReviewConcepts,
  type QuizQuestion,
} from './quiz';
import { cardKey, createCard } from './srs';
import { normalize } from './text';

const today = '2026-10-25';

function expectWellFormed(questions: QuizQuestion[]) {
  for (const q of questions) {
    expect(q.options, q.id).toContain(q.answer);
    expect(new Set(q.options.map(normalize)).size, `${q.id}: ${q.options.join(' / ')}`).toBe(
      q.options.length,
    );
    expect(q.options.length).toBeGreaterThanOrEqual(3);
  }
  expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
}

describe('test diario de repaso', () => {
  it('no tiene preguntas el día 0 (no hay días anteriores)', () => {
    expect(buildReviewQuiz({ days: DAYS, currentDay: 0, cards: {}, today })).toEqual([]);
  });

  it('solo usa palabras de días anteriores al actual', () => {
    const quiz = buildReviewQuiz({ days: DAYS, currentDay: 3, cards: {}, today });
    const previous = new Set(DAYS.slice(0, 3).flatMap((d) => d.concepts.map((c) => c.en)));
    expect(quiz).toHaveLength(10);
    for (const q of quiz) expect(previous.has(q.concept!.en)).toBe(true);
    expectWellFormed(quiz);
  });

  it('prioriza las tarjetas pendientes (las más atrasadas primero) y después las falladas', () => {
    const oldest = DAYS[2]!.concepts[4]!;
    const due = DAYS[0]!.concepts[7]!;
    const lapsed = DAYS[1]!.concepts[3]!;
    const future = DAYS[1]!.concepts[0]!;
    const cards = {
      [cardKey(due.en)]: createCard({ id: cardKey(due.en), front: due.en, back: due.es }, today),
      [cardKey(oldest.en)]: createCard(
        { id: cardKey(oldest.en), front: oldest.en, back: oldest.es },
        addDays(today, -5),
      ),
      [cardKey(lapsed.en)]: {
        ...createCard({ id: 'x', front: lapsed.en, back: lapsed.es }, addDays(today, 3)),
        lapses: 2,
      },
      [cardKey(future.en)]: createCard(
        { id: 'y', front: future.en, back: future.es },
        addDays(today, 30),
      ),
    };
    const picked = selectReviewConcepts({ days: DAYS, currentDay: 5, cards, today }).map(
      (p) => p.concept.en,
    );
    expect(picked.slice(0, 3)).toEqual([oldest.en, due.en, lapsed.en]);
    expect(picked).not.toContain(future.en);
  });

  it('si se repite el test el mismo día, trae palabras distintas a las ya repasadas', () => {
    const first = selectReviewConcepts({ days: DAYS, currentDay: 10, cards: {}, today });
    const cards = Object.fromEntries(
      first.map(({ concept }) => [
        cardKey(concept.en),
        {
          ...createCard(
            { id: cardKey(concept.en), front: concept.en, back: concept.es },
            addDays(today, 1),
          ),
          lastReview: today,
        },
      ]),
    );
    const second = selectReviewConcepts({ days: DAYS, currentDay: 10, cards, today });
    const overlap = second.filter((s) => first.some((f) => f.concept.en === s.concept.en));
    expect(overlap).toHaveLength(0);
  });

  it('cambia de un día a otro pero es estable dentro del mismo día', () => {
    const a = buildReviewQuiz({ days: DAYS, currentDay: 10, cards: {}, today });
    const b = buildReviewQuiz({ days: DAYS, currentDay: 10, cards: {}, today });
    const c = buildReviewQuiz({ days: DAYS, currentDay: 10, cards: {}, today: addDays(today, 1) });
    expect(a).toEqual(b);
    expect(a.map((q) => q.answer)).not.toEqual(c.map((q) => q.answer));
  });

  it('alterna tipos de pregunta: inglés→español, español→inglés y escucha', () => {
    const kinds = buildReviewQuiz({ days: DAYS, currentDay: 6, cards: {}, today }).map(
      (q) => q.kind,
    );
    expect(new Set(kinds)).toEqual(new Set(['en-es', 'es-en', 'listen-word']));
  });
});

describe('exámenes semanales', () => {
  it.each(EXAMS.map((e) => [e.title, e] as const))(
    '%s tiene 20 preguntas bien formadas',
    (_t, exam) => {
      const questions = buildExam(exam, DAYS, BANKS);
      expect(questions).toHaveLength(EXAM_SIZE);
      expectWellFormed(questions);
    },
  );

  it('solo pregunta vocabulario de los días que cubre', () => {
    const exam = EXAMS[1]!;
    const covered = new Set(
      DAYS.slice(exam.from, exam.to + 1).flatMap((d) => d.concepts.map((c) => c.en)),
    );
    for (const q of buildExam(exam, DAYS, BANKS))
      if (q.concept) expect(covered.has(q.concept.en)).toBe(true);
  });

  it('cubre las cuatro habilidades con la composición prevista', () => {
    const skills = buildExam(EXAMS[0]!, DAYS, BANKS).reduce<Record<string, number>>(
      (acc, q) => ({ ...acc, [q.skill]: (acc[q.skill] ?? 0) + 1 }),
      {},
    );
    expect(skills).toEqual({ vocabulario: 10, gramatica: 4, escucha: 3, comunicacion: 3 });
  });

  it('cada intento genera preguntas distintas', () => {
    const first = buildExam(EXAMS[2]!, DAYS, BANKS, 0).map((q) => q.answer);
    const second = buildExam(EXAMS[2]!, DAYS, BANKS, 1).map((q) => q.answer);
    expect(first).not.toEqual(second);
  });
});

describe('scoreQuiz', () => {
  const questions = buildExam(EXAMS[0]!, DAYS, BANKS);

  it('calcula nota, aprobado y desglose por habilidad', () => {
    const answers = Object.fromEntries(questions.map((q, i) => [q.id, i < 15 ? q.answer : 'mal']));
    const score = scoreQuiz(questions, answers);
    expect(score).toMatchObject({ correct: 15, total: 20, percent: 75, passed: true });
    expect(score.failed).toHaveLength(5);
    expect(score.bySkill.reduce((n, s) => n + s.total, 0)).toBe(20);
  });

  it('suspende por debajo del 70 %', () => {
    const answers = Object.fromEntries(questions.slice(0, 13).map((q) => [q.id, q.answer]));
    expect(scoreQuiz(questions, answers)).toMatchObject({ percent: 65, passed: false });
  });
});
