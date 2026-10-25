import { describe, expect, it } from 'vitest';
import { blankOut } from '@/domain/exercises';
import { normalize } from '@/domain/text';
import { DAYS, DIALOGUES, ERRORS } from './index';
import { PHRASES } from './phrases';
import { THEORY } from './theory';
import { VOCABULARY } from './vocabulary';

describe('ruta de 31 días', () => {
  it('tiene 31 días numerados de 0 a 30', () => {
    expect(DAYS).toHaveLength(31);
    DAYS.forEach((day, i) => expect(day.id).toBe(i));
  });

  it.each(DAYS.map((d) => [d.id, d] as const))(
    'el día %i tiene 15 conceptos distintos',
    (_id, day) => {
      expect(day.concepts).toHaveLength(15);
      expect(new Set(day.concepts.map((c) => normalize(c.en))).size).toBe(15);
    },
  );

  it('cada frase de ejemplo contiene su concepto', () => {
    for (const day of DAYS)
      for (const c of day.concepts)
        expect(blankOut(c.example, c.en), `Día ${day.id}: ${c.en}`).not.toBeNull();
  });

  it('las frases de ejemplo son cortas para poder ordenarlas', () => {
    for (const day of DAYS)
      for (const c of day.concepts)
        expect(c.example.split(' ').length, c.example).toBeLessThanOrEqual(10);
  });

  it('ningún día repite el vocabulario de otro (como ocurría en la versión anterior)', () => {
    const signatures = DAYS.map((d) => d.concepts.map((c) => c.en).join('|'));
    expect(new Set(signatures).size).toBe(DAYS.length);
  });

  it('cada día enlaza con una sección de teoría existente', () => {
    const ids = new Set(THEORY.map((t) => t.id));
    for (const day of DAYS) expect(ids.has(day.theoryId), day.title).toBe(true);
  });
});

describe('bancos de contenido', () => {
  it('los errores tienen tres opciones diferentes y la frase incorrecta no es una opción', () => {
    for (const e of ERRORS) {
      const options = [e.right, ...e.distractors].map(normalize);
      expect(new Set(options).size, e.wrong).toBe(3);
      expect(options).not.toContain(normalize(e.wrong));
      expect(e.explanation.length).toBeGreaterThan(10);
    }
  });

  it('hay al menos 15 errores y 15 diálogos por nivel', () => {
    for (const level of [1, 2, 3]) {
      expect(ERRORS.filter((e) => e.level <= level).length).toBeGreaterThanOrEqual(15);
      expect(DIALOGUES.filter((d) => d.level <= level).length).toBeGreaterThanOrEqual(15);
    }
  });

  it('los diálogos tienen respuestas distintas', () => {
    for (const d of DIALOGUES) expect(new Set([d.answer, ...d.distractors]).size, d.line).toBe(3);
  });

  it('el vocabulario tiene 400 entradas y el banco de frases 1.200', () => {
    expect(VOCABULARY).toHaveLength(400);
    expect(PHRASES.easy.length + PHRASES.normal.length + PHRASES.hard.length).toBe(1200);
  });
});
