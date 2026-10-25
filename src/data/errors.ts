/**
 * Errores frecuentes de hispanohablantes. Formato:
 * nivel | frase incorrecta | correcta | distractor 1 | distractor 2 | explicación
 */
import type { GrammarError, Level } from '@/domain/types';

const RAW = `
1 | She work in a hotel. | She works in a hotel. | She working in a hotel. | She is work in a hotel. | Con he, she e it, el presente simple añade -s.
1 | I have 25 years. | I am 25 years old. | I have 25 years old. | I am 25 years. | La edad se expresa con to be: I am … years old.
1 | Is very good. | It is very good. | Is it very good. | Very good is. | En inglés el sujeto es obligatorio: it is.
1 | I am agree with you. | I agree with you. | I am agreeing with you. | I agreed with you yesterday. | Agree es un verbo: no necesita am.
1 | My sister don't like coffee. | My sister doesn't like coffee. | My sister doesn't likes coffee. | My sister not like coffee. | Con she usamos doesn't + verbo base.
1 | Where you are going? | Where are you going? | Where you going? | Where do you are going? | En preguntas, el auxiliar va antes del sujeto.
1 | He can to help us. | He can help us. | He cans help us. | He can helps us. | Después de can va el verbo base, sin to.
1 | There is two tickets on the table. | There are two tickets on the table. | There have two tickets on the table. | It is two tickets on the table. | Con plural usamos there are.
1 | I have a car red. | I have a red car. | I have a car of red. | I have red a car. | El adjetivo va delante del sustantivo.
1 | I like very much music. | I like music very much. | I like much very music. | I very much music like. | Very much va al final, no entre verbo y objeto.
1 | People is very friendly here. | People are very friendly here. | The people is very friendly here. | People very friendly here. | People es plural: people are.
1 | I need an information. | I need some information. | I need informations. | I need a information. | Information es incontable: some information.
1 | She is more tall than me. | She is taller than me. | She is more taller than me. | She is tallest than me. | Adjetivos cortos: -er para comparar.
1 | I go to home now. | I am going home now. | I am going to the home now. | I go at home now. | Home no lleva to ni the: go home.
1 | Do you can help me? | Can you help me? | Can you to help me? | Do you help me can? | Can forma la pregunta sin do.
2 | Did you went to the station? | Did you go to the station? | Did you goes to the station? | You did go to the station? | Después de did, el verbo vuelve a la forma base.
2 | I was tired because I go to bed late. | I was tired because I went to bed late. | I was tired because I gone to bed late. | I was tired because I goes to bed late. | Dos acciones terminadas en el pasado: pasado simple.
2 | This book is more cheaper. | This book is cheaper. | This book is most cheaper. | This book is more cheap. | No combines more con -er.
2 | We discussed about the problem. | We discussed the problem. | We discussed on the problem. | We discussed of the problem. | Discuss no lleva preposición.
2 | I have seen him yesterday. | I saw him yesterday. | I have saw him yesterday. | I seen him yesterday. | Con un momento pasado terminado (yesterday) usa pasado simple.
2 | He explained me the rule. | He explained the rule to me. | He explained to me the rule me. | He explained the rule me. | Explain something to someone.
2 | I'm thinking to buy a car. | I'm thinking of buying a car. | I'm thinking buy a car. | I'm thinking for buy a car. | Think of / about + verbo-ing.
2 | It depends of the weather. | It depends on the weather. | It depends in the weather. | It depend of the weather. | Depend on, no depend of.
2 | I arrived to Madrid at nine. | I arrived in Madrid at nine. | I arrived at Madrid in nine. | I arrived to the Madrid at nine. | Arrive in (ciudad) o arrive at (lugar concreto).
2 | She said me that she was busy. | She told me that she was busy. | She said to me that she busy. | She told that she was busy. | Tell someone; say something.
2 | I am living here since 2020. | I have lived here since 2020. | I live here since 2020. | I lived here since 2020. | Since con una situación que continúa: present perfect.
2 | Yesterday I have gone to the cinema. | Yesterday I went to the cinema. | Yesterday I gone to the cinema. | Yesterday I have went to the cinema. | Yesterday pide pasado simple.
2 | You should to rest more. | You should rest more. | You should resting more. | You should rests more. | Después de should, verbo base sin to.
2 | I must to finish this today. | I must finish this today. | I must finishing this today. | I musts finish this today. | Must va seguido del verbo base.
2 | What means this word? | What does this word mean? | What does this word means? | What this word means? | Pregunta con does + verbo base.
2 | The film was very bored. | The film was very boring. | The film was very bore. | The film very boring was. | -ing describe lo que provoca; -ed cómo te sientes.
2 | I'm very interesting in history. | I'm very interested in history. | I'm very interest in history. | I'm very interested on history. | Interested in = interesado en.
2 | If it will rain, we will stay home. | If it rains, we will stay home. | If it rain, we will stay home. | If it will rains, we stay home. | En el primer condicional, después de if va presente.
2 | I made a mistake in my homeworks. | I made a mistake in my homework. | I did a mistake in my homework. | I made a mistakes in my homework. | Homework es incontable.
2 | Can you borrow me your pen? | Can you lend me your pen? | Can you lend to me your pen? | Can you borrow your pen me? | Lend = prestar a alguien; borrow = tomar prestado.
3 | I look forward to meet you. | I look forward to meeting you. | I look forward meeting you. | I look forward for meeting you. | Look forward to + verbo-ing.
3 | Although it was cold, but we went out. | Although it was cold, we went out. | Although it was cold, so we went out. | Despite it was cold, we went out. | Although ya expresa contraste: no añadas but.
3 | I have been in London last year. | I went to London last year. | I have gone to London last year. | I have been to London last year. | Con last year, pasado simple.
3 | I didn't used to like vegetables. | I didn't use to like vegetables. | I didn't used like vegetables. | I don't used to like vegetables. | Tras didn't, use sin -d.
3 | Despite of the rain, we played. | Despite the rain, we played. | Despite of rain, we played. | Although the rain, we played. | Despite no lleva of.
3 | The news are very bad today. | The news is very bad today. | The news were very bad today. | The new is very bad today. | News es incontable y singular.
3 | She has just went out. | She has just gone out. | She has just go out. | She just has went out. | Present perfect: has + participio (gone).
3 | Have you finished already the report? | Have you finished the report yet? | Have you already finish the report? | Did you already finished the report? | En preguntas, yet va al final.
3 | He suggested me to take a break. | He suggested taking a break. | He suggested me taking a break. | He suggested to take a break me. | Suggest + verbo-ing (o suggest that…).
3 | I'm used to wake up early. | I'm used to waking up early. | I'm use to waking up early. | I used to waking up early. | Be used to + verbo-ing = estar acostumbrado.
3 | Unless you don't hurry, you'll miss the bus. | Unless you hurry, you'll miss the bus. | Unless you will hurry, you'll miss the bus. | Unless you not hurry, you'll miss the bus. | Unless ya significa "si no": no añadas don't.
3 | The person which called me was rude. | The person who called me was rude. | The person what called me was rude. | The person whose called me was rude. | Para personas, who (o that).
3 | It's the more interesting book I've read. | It's the most interesting book I've read. | It's the much interesting book I've read. | It's the interestingest book I've read. | Superlativo de adjetivos largos: the most.
`;

export const ERRORS: GrammarError[] = RAW.trim()
  .split('\n')
  .map((line) => line.split(' | ').map((part) => part.trim()))
  .map(([level, wrong = '', right = '', d1 = '', d2 = '', explanation = '']) => ({
    level: Number(level) as Level,
    wrong,
    right,
    distractors: [d1, d2],
    explanation,
  }));
