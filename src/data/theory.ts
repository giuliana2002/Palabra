/**
 * Manual de teoría A0 → B1 funcional, como datos estructurados.
 * Los textos usan un mini-marcado (**negrita**, *cursiva*) que se renderiza sin innerHTML.
 */
export type TheoryBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'example'; en: string; es?: string }
  | { type: 'rule'; title: string; text: string }
  | { type: 'wrong'; text: string }
  | { type: 'cards'; cards: Array<{ title: string; lines: string[] }> }
  | { type: 'check'; title: string; items?: string[]; text?: string };

export interface TheorySection {
  id: string;
  title: string;
  blocks: TheoryBlock[];
}

export const THEORY: TheorySection[] = [
  {
    id: 'metodo',
    title: 'Cómo usar esta teoría',
    blocks: [
      {
        type: 'p',
        text: 'Aprender inglés exige tres cosas: **entender una estructura**, **recuperarla sin mirar** y **usarla para expresar algo propio**. Leer una regla no crea automatismo; por eso cada bloque termina con una tarea de aplicación.',
      },
      {
        type: 'check',
        title: 'Rutina de estudio de 20 minutos',
        items: [
          'Lee una regla y sus ejemplos.',
          'Cubre el ejemplo e intenta reconstruirlo.',
          'Cambia una palabra para hablar de tu vida.',
          'Di la nueva frase en voz alta tres veces.',
          'Escríbela y comprueba sujeto, verbo y orden.',
        ],
      },
    ],
  },
  {
    id: 'frase',
    title: '1. La frase inglesa',
    blocks: [
      {
        type: 'p',
        text: 'El inglés tiene un orden más fijo que el español: **sujeto + verbo + complemento**. El sujeto suele aparecer incluso cuando es obvio.',
      },
      { type: 'example', en: 'I need help.', es: 'Yo necesito ayuda.' },
      { type: 'example', en: 'She works in a hotel.', es: 'Ella trabaja en un hotel.' },
      {
        type: 'cards',
        cards: [
          {
            title: 'Orden básico',
            lines: [
              '**Who?** I / she / my friend',
              '**Does what?** works / needs / likes',
              '**What, where, when?** in Madrid / coffee / today',
            ],
          },
          {
            title: 'Adverbios',
            lines: [
              'Los de frecuencia van antes del verbo principal: *I usually study at night.*',
              'Pero después de *to be*: *She is always late.*',
            ],
          },
        ],
      },
      {
        type: 'wrong',
        text: '**Error frecuente:** “Is very good” no es una frase completa. Di *It is very good* o *The film is very good*.',
      },
    ],
  },
  {
    id: 'be',
    title: '2. Pronombres y to be',
    blocks: [
      {
        type: 'p',
        text: '**I am · you are · he/she/it is · we/they are.** *To be* sirve para identidad, origen, edad, estado y descripción.',
      },
      {
        type: 'example',
        en: 'I am from Spain. · She is tired. · They are ready.',
        es: 'Soy de España. · Ella está cansada. · Están preparados.',
      },
      { type: 'h3', text: 'Contracciones que debes reconocer' },
      {
        type: 'p',
        text: "I'm, you're, he's, she's, it's, we're, they're. En negativo: *isn't* y *aren't*. En inglés hablado aparecen constantemente.",
      },
      {
        type: 'rule',
        title: 'Pregunta con to be',
        text: 'Invierte el verbo y el sujeto: *Are you ready?* · *Is she at home?*',
      },
      { type: 'h3', text: 'Posesivos' },
      {
        type: 'p',
        text: 'Posesivos: *my, your, his, her, its, our, their*. Para familia: *my mother, his brother, their parents*. *Have got* = tener: *I have got two brothers.*',
      },
    ],
  },
  {
    id: 'nombres',
    title: '3. Nombres, artículos y cantidad',
    blocks: [
      {
        type: 'p',
        text: '**a/an** introduce algo no específico: *a book, an apple*. **the** señala algo conocido o concreto: *the book on the table*. No uses artículo con plurales o incontables en sentido general: *Books are useful. Information is useful.*',
      },
      {
        type: 'cards',
        cards: [
          { title: 'Contables', lines: ['a chair / two chairs', 'many chairs', 'few chairs'] },
          { title: 'Incontables', lines: ['some water', 'much water', 'a little water'] },
        ],
      },
      {
        type: 'rule',
        title: 'There is / there are',
        text: '*There is a sofa* (singular) · *There are two bedrooms* (plural). En preguntas: *Is there a pharmacy near here?*',
      },
      {
        type: 'wrong',
        text: '**No:** “informations”, “advices”, “furnitures”. Di *some information*, *a piece of advice*, *some furniture*.',
      },
    ],
  },
  {
    id: 'presente',
    title: '4. Presente simple y continuo',
    blocks: [
      { type: 'h3', text: 'Presente simple: rutina, hecho, estado' },
      {
        type: 'example',
        en: 'I study every day. · She works remotely.',
        es: 'Estudio cada día. · Ella trabaja en remoto.',
      },
      {
        type: 'p',
        text: 'Con he/she/it añade **-s**: work → works; study → studies; go → goes. Auxiliar negativo: *don’t / doesn’t*.',
      },
      { type: 'h3', text: 'Presente continuo: ahora o situación temporal' },
      {
        type: 'example',
        en: 'I am studying now. · They are staying here this week.',
        es: 'Estoy estudiando ahora. · Se quedan aquí esta semana.',
      },
      {
        type: 'p',
        text: 'Forma: **am/is/are + verbo-ing**. Verbos de estado como *know, want, need, believe* normalmente no van en continuo: *I know*, no “I am knowing”.',
      },
      {
        type: 'rule',
        title: 'Gustos',
        text: '*like / love / enjoy / hate* + verbo-ing: *I enjoy reading. She hates getting up early.*',
      },
    ],
  },
  {
    id: 'preguntas',
    title: '5. Preguntas y negación',
    blocks: [
      {
        type: 'p',
        text: 'Con verbos normales, usa **do/does** en presente y **did** en pasado. El verbo principal va en forma base.',
      },
      {
        type: 'example',
        en: 'Do you speak English? · Does he live here? · Did they arrive yesterday?',
      },
      {
        type: 'wrong',
        text: '**No:** “Did you went?” **Sí:** *Did you go?* El pasado ya está en *did*.',
      },
      {
        type: 'p',
        text: 'Palabras interrogativas: *what, where, when, who, why, how, which*. El patrón es: palabra interrogativa + auxiliar + sujeto + verbo.',
      },
    ],
  },
  {
    id: 'pasado',
    title: '6. Pasado para contar experiencias',
    blocks: [
      {
        type: 'p',
        text: 'Pasado simple: verbos regulares con **-ed** y verbos irregulares frecuentes: *went, had, saw, did, made, took, found*.',
      },
      {
        type: 'example',
        en: 'Yesterday I went to the station and bought a ticket.',
        es: 'Ayer fui a la estación y compré un billete.',
      },
      {
        type: 'p',
        text: 'Para una acción en curso interrumpida, usa pasado continuo: *I was cooking when you called.* Para secuenciar: *first, then, after that, finally*.',
      },
      { type: 'h3', text: 'Present perfect básico' },
      {
        type: 'p',
        text: '**have/has + participio** conecta el pasado con el presente: *I have been to London twice. She has just finished.* Si dices cuándo (*yesterday, last year*), usa pasado simple.',
      },
    ],
  },
  {
    id: 'futuro',
    title: '7. Futuro: planes y decisiones',
    blocks: [
      {
        type: 'cards',
        cards: [
          {
            title: 'Going to',
            lines: ['Plan o intención previa:', '*I’m going to travel next month.*'],
          },
          {
            title: 'Will',
            lines: ['Decisión en el momento, promesa o predicción:', '*I’ll call you later.*'],
          },
        ],
      },
      {
        type: 'p',
        text: 'También puedes usar presente continuo para algo organizado: *I’m meeting Ana at six.*',
      },
      {
        type: 'rule',
        title: 'Primer condicional',
        text: '*If* + presente, *will* + verbo: *If it rains, we will stay home.* Nunca “if it will rain”.',
      },
    ],
  },
  {
    id: 'modales',
    title: '8. Modales que hacen tu inglés útil',
    blocks: [
      {
        type: 'p',
        text: '**can** habilidad o permiso: *Can you help me?* **should** consejo: *You should rest.* **must** obligación: *You must show your passport.* **could** petición cortés: *Could you repeat that?*',
      },
      {
        type: 'p',
        text: 'Después de un modal va el verbo base: *can go*, no “can goes” ni “can to go”.',
      },
    ],
  },
  {
    id: 'preposiciones',
    title: '9. Preposiciones esenciales',
    blocks: [
      {
        type: 'p',
        text: '**in**: países, ciudades, espacios: *in Madrid, in the room*. **on**: superficies y días: *on the table, on Monday*. **at**: puntos, horas y eventos: *at 7, at the station, at work*.',
      },
      {
        type: 'example',
        en: 'I arrive at the station at 8, then I get on the train.',
        es: 'Llego a la estación a las ocho y después subo al tren.',
      },
      {
        type: 'rule',
        title: 'Indicaciones',
        text: '*Turn left · Turn right · Go straight · next to · opposite · between · behind*.',
      },
    ],
  },
  {
    id: 'conectores',
    title: '10. Conectores: pasar de frases a ideas',
    blocks: [
      {
        type: 'p',
        text: '**and** añade, **but** contrasta, **because** explica la razón, **so** muestra el resultado, **although** introduce contraste, **however** conecta ideas con más formalidad.',
      },
      {
        type: 'example',
        en: 'I was tired, but I finished the task because it was important.',
        es: 'Estaba cansada, pero terminé la tarea porque era importante.',
      },
      {
        type: 'rule',
        title: 'Opinar',
        text: 'Estructura útil: *I think… because…* y *I prefer… to…*. Una opinión sin razón queda incompleta.',
      },
      {
        type: 'rule',
        title: 'Comparar',
        text: 'Cortos: *cheaper, bigger, the best*. Largos: *more expensive, the most interesting*. Irregulares: *good → better → the best*.',
      },
    ],
  },
  {
    id: 'sonidos',
    title: '11. Escucha, pronunciación y canciones',
    blocks: [
      {
        type: 'p',
        text: 'No intentes pronunciar cada letra como en español. Escucha bloques de sentido: *Could you / help me / for a moment?* Las palabras de contenido llevan más fuerza: *I NEED a NEW TICKET.*',
      },
      {
        type: 'p',
        text: 'Con canciones: escucha primero sin letra; luego identifica verbos, pronombres y conectores; finalmente escribe una paráfrasis. El objetivo es comprender y usar expresiones completas, no memorizar letras.',
      },
      {
        type: 'rule',
        title: 'Inglés coloquial',
        text: '*gonna* = going to · *wanna* = want to · *gotta* = have got to. Reconócelos, pero no los uses en textos formales.',
      },
    ],
  },
  {
    id: 'escritura',
    title: '12. Escritura y revisión',
    blocks: [
      {
        type: 'p',
        text: 'Para un texto breve usa esta estructura: contexto → idea principal → razón → ejemplo → cierre. Revisa en este orden: sujeto, verbo, tiempo, orden, artículos/plurales, mayúscula y punto.',
      },
      {
        type: 'example',
        en: 'Today I studied for thirty minutes. I practised questions because I want to travel next year. The exercise was difficult, but I understood more at the end.',
      },
      {
        type: 'cards',
        cards: [
          {
            title: 'Capa 1 · Claridad',
            lines: [
              '¿La frase tiene sujeto y verbo? ¿Se entiende sin español?',
              '*I want information about the course.*',
            ],
          },
          {
            title: 'Capa 2 · Precisión',
            lines: [
              '¿El tiempo verbal y el artículo son correctos?',
              '*She went to the meeting yesterday.*',
            ],
          },
          {
            title: 'Capa 3 · Naturalidad',
            lines: [
              '¿Puedes usar una colocación completa en vez de traducir?',
              '*make a decision*, no “do a decision”.',
            ],
          },
          {
            title: 'Capa 4 · Fluidez',
            lines: [
              '¿Puedes unir dos ideas con un conector y hablar sin leer?',
              '*I was tired, but I kept studying.*',
            ],
          },
        ],
      },
      {
        type: 'check',
        title: 'Señal de progreso real',
        text: 'Al terminar una semana debes poder hablar un minuto de un tema, escribir 80–120 palabras y comprender la idea principal de un audio corto. Un nivel alto no se garantiza en 30 días; sí puedes construir una base muy sólida si completas la práctica diaria y mantienes la exposición después.',
      },
    ],
  },
  {
    id: 'programa',
    title: '13. Programa A0 → B1 funcional',
    blocks: [
      {
        type: 'p',
        text: 'La teoría se estudia por unidades. Cada unidad combina gramática, vocabulario funcional, comprensión, habla y escritura. El orden evita aprender una forma avanzada antes de controlar la base.',
      },
      {
        type: 'cards',
        cards: [
          {
            title: 'Unidad 1 · Días 0–5',
            lines: [
              '**Objetivo:** presentarte y sobrevivir en una interacción simple.',
              'Pronombres, *to be*, números, preguntas, presente simple.',
            ],
          },
          {
            title: 'Unidad 2 · Días 6–10',
            lines: [
              '**Objetivo:** familia, comida, direcciones, hora y compras.',
              'Posesivos, *some/any*, imperativos, preposiciones.',
            ],
          },
          {
            title: 'Unidad 3 · Días 11–15',
            lines: [
              '**Objetivo:** describir y conversar.',
              '*There is/are*, presente continuo, pasado simple.',
            ],
          },
          {
            title: 'Unidad 4 · Días 16–20',
            lines: [
              '**Objetivo:** viajes, opiniones, trabajo y salud.',
              '*Can/could*, *should/must*, registro formal.',
            ],
          },
          {
            title: 'Unidad 5 · Días 21–25',
            lines: [
              '**Objetivo:** contar, conectar y comparar.',
              'Pasado continuo, conectores, comparativos.',
            ],
          },
          {
            title: 'Unidad 6 · Días 26–30',
            lines: [
              '**Objetivo:** resolver, planificar y conversar con autonomía.',
              'Condicionales, futuro, present perfect.',
            ],
          },
        ],
      },
      {
        type: 'check',
        title: 'Examen final recomendado',
        items: [
          'Escucha un audio de 2 minutos y resume cinco ideas.',
          'Mantén una conversación de 3 minutos sobre tu vida, un viaje y una opinión.',
          'Escribe 150 palabras con presente, pasado y futuro.',
          'Corrige tu propio texto con la lista de revisión.',
        ],
      },
    ],
  },
];
