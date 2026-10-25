/**
 * Banco de frases graduado (400 por nivel = 1.200).
 * Se genera combinando plantillas revisadas a mano: sujeto/inicio + acción + complemento.
 * Generarlas en vez de escribirlas una a una mantiene el bundle pequeño y la gramática consistente.
 */
export type PhraseLevel = 'easy' | 'normal' | 'hard';

export interface Phrase {
  id: string;
  en: string;
  es: string;
  level: PhraseLevel;
}

type Pair = readonly [en: string, es: string];

const EASY_VERBS: Pair[] = [
  ['need', 'necesito'],
  ['want', 'quiero'],
  ['get', 'consigo'],
  ['use', 'uso'],
  ['bring', 'traigo'],
  ['have', 'tengo'],
  ['see', 'veo'],
  ['find', 'encuentro'],
  ['take', 'tomo'],
  ['make', 'preparo'],
];
const EASY_OBJECTS: Pair[] = [
  ['some help', 'algo de ayuda'],
  ['more time', 'más tiempo'],
  ['a new ticket', 'un billete nuevo'],
  ['this information', 'esta información'],
  ['a quiet place', 'un lugar tranquilo'],
  ['a good idea', 'una buena idea'],
  ['my phone', 'mi teléfono'],
  ['your advice', 'tu consejo'],
  ['a short break', 'un descanso corto'],
  ['the answer', 'la respuesta'],
];
const EASY_TIMES: Pair[] = [
  ['today', 'hoy'],
  ['right now', 'ahora mismo'],
  ['this morning', 'esta mañana'],
  ['after work', 'después del trabajo'],
  ['at home', 'en casa'],
  ['before dinner', 'antes de cenar'],
  ['every week', 'cada semana'],
  ['on Monday', 'el lunes'],
  ['in the evening', 'por la tarde'],
  ['for practice', 'para practicar'],
];

const NORMAL_STARTERS: Pair[] = [
  ['Could you', '¿Podrías'],
  ['Would you like to', '¿Te gustaría'],
  ['Do you think we can', '¿Crees que podemos'],
  ['I would like to', 'Me gustaría'],
  ['We need to', 'Necesitamos'],
  ["Let's try to", 'Intentemos'],
  ['It is important to', 'Es importante'],
  ['I am going to', 'Voy a'],
  ['You can', 'Puedes'],
  ['I hope to', 'Espero'],
];
const NORMAL_ACTIONS: Pair[] = [
  ['repeat that', 'repetir eso'],
  ['check the details', 'revisar los detalles'],
  ['make a decision', 'tomar una decisión'],
  ['solve this problem', 'resolver este problema'],
  ['plan the journey', 'planear el viaje'],
  ['finish the task', 'terminar la tarea'],
  ['call the office', 'llamar a la oficina'],
  ['write a message', 'escribir un mensaje'],
  ['meet the team', 'reunirnos con el equipo'],
  ['learn this expression', 'aprender esta expresión'],
];
const NORMAL_ENDINGS: Pair[] = [
  ['because it is useful', 'porque es útil'],
  ['before the meeting', 'antes de la reunión'],
  ['when you have time', 'cuando tengas tiempo'],
  ['if you agree', 'si estás de acuerdo'],
  ['so we can continue', 'para poder continuar'],
  ['without any pressure', 'sin presión'],
  ['after we arrive', 'después de llegar'],
  ['while we wait', 'mientras esperamos'],
  ['to avoid mistakes', 'para evitar errores'],
  ['as soon as possible', 'lo antes posible'],
];

const HARD_CLAUSES: Pair[] = [
  ['Although I was tired', 'Aunque estaba cansada'],
  ['As we had enough time', 'Como teníamos tiempo suficiente'],
  ['When I finished the project', 'Cuando terminé el proyecto'],
  ['Even though the plan changed', 'Aunque el plan cambió'],
  ['As soon as I understood the problem', 'En cuanto entendí el problema'],
  ['While everyone was waiting', 'Mientras todos esperaban'],
  ['Because the train was late', 'Como el tren llegó tarde'],
  ['After I had checked the details', 'Después de revisar los detalles'],
  ['Before we made a final decision', 'Antes de tomar una decisión final'],
  ['Once the meeting had started', 'Una vez empezada la reunión'],
];
const HARD_RESULTS: Pair[] = [
  ['I decided to continue carefully', 'decidí continuar con cuidado'],
  ['we found a better solution', 'encontramos una solución mejor'],
  ['I wrote down the main points', 'anoté los puntos principales'],
  ['they were able to help us', 'pudieron ayudarnos'],
  ['I explained the situation clearly', 'expliqué la situación con claridad'],
  ['we changed our original plan', 'cambiamos nuestro plan original'],
  ['I asked for more information', 'pedí más información'],
  ['the conversation became easier', 'la conversación se hizo más fácil'],
  ['I realised what I needed to do', 'me di cuenta de lo que debía hacer'],
  ['we managed to avoid a bigger problem', 'conseguimos evitar un problema mayor'],
];
const HARD_TAILS: Pair[] = [
  ['', ''],
  [' in the end', ' al final'],
  [' without any help', ' sin ayuda'],
  [' that same day', ' ese mismo día'],
];

function combine(
  level: PhraseLevel,
  a: Pair[],
  b: Pair[],
  c: Pair[],
  build: (x: Pair, y: Pair, z: Pair) => Pair,
): Phrase[] {
  const out: Phrase[] = [];
  // 10 × 10 × 4 = 400 frases; el tercer elemento rota para que no se repitan patrones.
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      for (let k = 0; k < 4; k++) {
        const z = c[(i + j + k) % c.length] as Pair;
        const [en, es] = build(a[i] as Pair, b[j] as Pair, z);
        out.push({ id: `${level}-${out.length}`, en, es, level });
      }
  return out;
}

export const PHRASES: Record<PhraseLevel, Phrase[]> = {
  easy: combine('easy', EASY_VERBS, EASY_OBJECTS, EASY_TIMES, (v, o, t) => [
    `I ${v[0]} ${o[0]} ${t[0]}.`,
    `${capitalize(v[1])} ${o[1]} ${t[1]}.`,
  ]),
  normal: combine('normal', NORMAL_STARTERS, NORMAL_ACTIONS, NORMAL_ENDINGS, (s, a, e) => {
    const question = s[1].startsWith('¿');
    return [
      `${s[0]} ${a[0]} ${e[0]}${question ? '?' : '.'}`,
      `${s[1]} ${a[1]} ${e[1]}${question ? '?' : '.'}`,
    ];
  }),
  hard: combine('hard', HARD_CLAUSES, HARD_RESULTS, HARD_TAILS, (c, r, t) => [
    `${c[0]}, ${r[0]}${t[0]}.`,
    `${c[1]}, ${r[1]}${t[1]}.`,
  ]),
};

export const PHRASE_LEVEL_LABELS: Record<PhraseLevel, string> = {
  easy: 'Fácil',
  normal: 'Intermedia',
  hard: 'Avanzada',
};

/** Nivel recomendado según el día de la ruta. */
export function recommendedLevel(day: number): PhraseLevel {
  if (day < 10) return 'easy';
  if (day < 21) return 'normal';
  return 'hard';
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
