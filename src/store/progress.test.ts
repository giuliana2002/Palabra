import { beforeEach, describe, expect, it } from 'vitest';
import {
  exportBackup,
  initialData,
  migrateProgress,
  parseBackup,
  useProgress,
  type RecordInput,
} from './progress';

const concept = { en: 'travel', es: 'viajar', example: 'I travel a lot.' };
const answer = (overrides: Partial<RecordInput> = {}): RecordInput => ({
  exerciseId: 'd0-meaning-0',
  kind: 'meaning',
  day: 0,
  ok: true,
  given: 'travel',
  correct: 'travel',
  prompt: '¿Qué significa?',
  concept,
  ...overrides,
});

describe('store de progreso', () => {
  beforeEach(() => useProgress.setState(initialData()));

  it('registra una respuesta una sola vez y suma actividad', () => {
    const { recordAnswer } = useProgress.getState();
    recordAnswer(answer(), '2026-05-01');
    recordAnswer(answer({ ok: false }), '2026-05-01');
    const state = useProgress.getState();
    expect(Object.keys(state.results)).toHaveLength(1);
    expect(state.results['d0-meaning-0']?.ok).toBe(true);
    expect(state.activity['2026-05-01']).toBe(1);
  });

  it('un acierto crea una tarjeta de repaso para mañana', () => {
    useProgress.getState().recordAnswer(answer(), '2026-05-01');
    expect(useProgress.getState().cards.travel).toMatchObject({
      due: '2026-05-02',
      front: 'travel',
    });
  });

  it('un fallo crea una tarjeta para hoy y guarda el error en el cuaderno', () => {
    useProgress.getState().recordAnswer(answer({ ok: false, given: 'trip' }), '2026-05-01');
    const state = useProgress.getState();
    expect(state.cards.travel?.due).toBe('2026-05-01');
    expect(state.mistakes[0]).toMatchObject({ given: 'trip', correct: 'travel' });
  });

  it('repasar una tarjeta aplica SM-2', () => {
    useProgress.getState().addCard(concept, '2026-05-01');
    useProgress.getState().review('travel', 4, '2026-05-01');
    expect(useProgress.getState().cards.travel).toMatchObject({
      repetitions: 1,
      due: '2026-05-02',
    });
  });

  it('reiniciar un día borra solo sus resultados', () => {
    const { recordAnswer, resetDay } = useProgress.getState();
    recordAnswer(answer(), '2026-05-01');
    recordAnswer(answer({ exerciseId: 'd1-meaning-0', day: 1 }), '2026-05-01');
    resetDay(0);
    expect(Object.keys(useProgress.getState().results)).toEqual(['d1-meaning-0']);
  });
});

describe('copias de seguridad', () => {
  it('exporta e importa sin pérdida', () => {
    const data = { ...initialData(), currentDay: 7, activity: { '2026-05-01': 12 } };
    expect(parseBackup(exportBackup(data))).toEqual(data);
  });

  it('rechaza archivos que no son de Palabra', () => {
    expect(() => parseBackup('{"hello":"world"}')).toThrow(/copia de seguridad/);
  });

  it('corrige valores fuera de rango', () => {
    const parsed = parseBackup({ app: 'palabra', data: { currentDay: 99 } });
    expect(parsed.currentDay).toBe(0);
    expect(parsed.settings.rate).toBe(0.9);
  });
});

describe('test de repaso, exámenes y sesión (v2)', () => {
  beforeEach(() => useProgress.setState(initialData()));

  it('un acierto en el test de repaso aleja la tarjeta; un fallo la trae mañana', () => {
    const { answerReview } = useProgress.getState();
    answerReview(concept, true, '2026-05-01');
    expect(useProgress.getState().cards.travel).toMatchObject({
      repetitions: 1,
      due: '2026-05-02',
    });
    answerReview(concept, true, '2026-05-02');
    expect(useProgress.getState().cards.travel).toMatchObject({
      repetitions: 2,
      due: '2026-05-08',
    });
    answerReview(concept, false, '2026-05-08');
    expect(useProgress.getState().cards.travel).toMatchObject({
      repetitions: 0,
      lapses: 1,
      due: '2026-05-09',
    });
  });

  it('guarda la mejor nota del examen y manda las palabras falladas al repaso de hoy', () => {
    const { recordExam } = useProgress.getState();
    recordExam('semana-1', 80, true, [concept], '2026-05-01');
    recordExam('semana-1', 55, false, [], '2026-05-02');
    const state = useProgress.getState();
    expect(state.exams['semana-1']).toMatchObject({
      best: 80,
      last: 55,
      attempts: 2,
      passed: true,
    });
    expect(state.cards.travel?.due).toBe('2026-05-01');
  });

  it('completar la sesión guarda el resumen y avanza al día siguiente (sin pasar del 30)', () => {
    const { completeSession } = useProgress.getState();
    completeSession({ day: 0, correct: 20, total: 25, minutes: 24 }, '2026-05-01');
    expect(useProgress.getState()).toMatchObject({
      currentDay: 1,
      sessions: { '2026-05-01': { correct: 20 } },
    });
    useProgress.setState({ currentDay: 30 });
    completeSession({ day: 30, correct: 1, total: 1, minutes: 1 }, '2026-05-02');
    expect(useProgress.getState().currentDay).toBe(30);
  });
});

describe('migraciones', () => {
  it('v1 → v2 conserva el progreso y añade sesiones y exámenes', () => {
    const v1 = {
      currentDay: 5,
      results: { a: { ok: true } },
      cards: {},
      mistakes: [],
      activity: { '2026-01-01': 3 },
      settings: { theme: 'dark' },
    };
    const migrated = migrateProgress(v1, 1);
    expect(migrated).toMatchObject({
      currentDay: 5,
      activity: { '2026-01-01': 3 },
      sessions: {},
      exams: {},
    });
    expect(migrated.settings).toMatchObject({ theme: 'dark', rate: 0.9 });
  });
});
