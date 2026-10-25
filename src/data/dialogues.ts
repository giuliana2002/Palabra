/**
 * Microdiálogos. Formato: nivel | situación | A dice | respuesta natural | distractor 1 | distractor 2
 * Los distractores son respuestas incorrectas o poco naturales para esa situación concreta.
 */
import type { Dialogue, Level } from '@/domain/types';

const RAW = `
1 | presentarte | Hi, I'm Marta. | Nice to meet you, Marta. I'm Daniel. | Yes, I am Marta. | Goodbye, Marta.
1 | saludar | How are you? | I'm fine, thanks. And you? | I'm 25 years old. | I'm from Spain, thanks.
1 | pedir una repetición | The train leaves at six fifteen. | Sorry, could you repeat that, please? | Yes, I like trains. | No, I'm not a train.
1 | preguntar el origen | Where are you from? | I'm from Seville, in the south of Spain. | I'm fine, thank you. | I'm a student.
1 | dar el nombre | What's your name? | My name is Laura. | I'm name Laura. | Yes, my name.
1 | deletrear | Can you spell your surname? | Sure. C-A-S-T-I-L-L-O. | Yes, I can surname. | My surname is long.
1 | agradecer | Here is your coffee. | Thank you very much! | You're welcome! | Here you are.
1 | despedirse | I have to go now. | OK, see you tomorrow! | Hello, how are you? | Nice to meet you.
1 | pedir en un bar | What would you like? | A white coffee, please. | I would like yes. | I'm a coffee, please.
1 | preguntar la hora | What time is it? | It's half past three. | It's Monday. | It's very good.
1 | hablar de la familia | Do you have any brothers or sisters? | Yes, I have two younger brothers. | Yes, I am a brother. | No, I have 20 years.
1 | hablar de gustos | Do you like football? | Not really. I prefer basketball. | Yes, I am football. | I play football yesterday.
1 | ofrecer ayuda | Can I help you? | Yes, please. I'm looking for the station. | Yes, I can. | No, I help you.
1 | pedir indicaciones | Where is platform three? | Go straight and turn left after the café. | It's at three o'clock. | Yes, it is a platform.
1 | preguntar un precio | How much is this jacket? | It's forty euros. | It's very much. | It's a jacket.
2 | organizar un plan | Are you free tomorrow afternoon? | Yes, I am. What time would you like to meet? | Yes, I was free. | I'm free of tomorrow.
2 | dar consejo | I have a headache. | You should rest and drink some water. | You must headache. | Congratulations!
2 | hablar de trabajo | What do you do? | I'm a web developer. I work with Java. | I'm doing my homework now. | I do very well.
2 | pagar en un restaurante | Can I have the bill, please? | Certainly. I'll bring it right away. | Yes, you can have the menu. | No, it's delicious.
2 | resolver un problema de viaje | My flight was cancelled. | I'm sorry. Let me check the next available flight. | Great! Have a nice flight. | Your flight is very good.
2 | explicar una razón | Why are you learning English? | Because I want to work abroad. | Yes, I am learning English. | Because of English.
2 | hablar del pasado | What did you do last weekend? | I visited my family and we had dinner together. | I visit my family next weekend. | I'm doing it now.
2 | hablar de planes | What are you going to do next year? | I'm going to apply for a new job. | I applied for a job last year. | I go to next year.
2 | pedir ayuda | I don't understand this email. | Let's read it together and find the main point. | Me neither. Goodbye. | This is an email.
2 | rechazar una invitación | Do you want to come to the cinema tonight? | I'd love to, but I'm busy tonight. Maybe next week? | No. | Yes, I don't want.
2 | reaccionar a una buena noticia | I got the job! | That's fantastic! Congratulations! | Oh no, I'm sorry. | What a pity.
2 | reaccionar a una mala noticia | I failed my driving test. | Oh no, I'm sorry. You'll pass next time. | Congratulations! | That's great news.
2 | quejarse en una tienda | This phone doesn't work. | I'm sorry. Do you have the receipt? | Yes, it's a very good phone. | You're welcome.
2 | en el hotel | Do you have a reservation? | Yes, under the name Castillo, for two nights. | Yes, I reserve. | No, I have a passport.
2 | en el médico | What seems to be the problem? | I've had a sore throat since Monday. | I'm a problem. | It seems very nice.
2 | pedir permiso | Do you mind if I open the window? | Not at all. Go ahead. | Yes, I mind window. | Open is good.
3 | mostrar desacuerdo educado | Do you agree with this idea? | I see your point, but I would choose a different option. | No. You're wrong. | I agree that I disagree.
3 | hablar de una canción | What does this song mean to you? | It reminds me of a difficult time that I overcame. | It's three minutes long. | It means song.
3 | entrevista de trabajo | Tell me about yourself. | I'm a junior developer with experience in Java and Spring Boot. | I'm fine, thank you. | Myself is a developer.
3 | entrevista de trabajo | What is your main weakness? | I sometimes spend too long on details, so I set time limits. | I don't have weaknesses. | My weakness is Monday.
3 | aclarar en una reunión | So we need to finish by Friday? | Exactly. Could you send a short update on Thursday? | Friday is a nice day. | I finished it last Friday.
3 | interrumpir con educación | …and that's why we should change the plan. | Sorry to interrupt, but can I add something? | Stop talking, please. | Why you change?
3 | negociar | Can you deliver it by Monday? | Monday is tight, but we could do Tuesday morning. | Yes, Monday is delivered. | I delivered it yesterday.
3 | pedir aclaraciones | The deadline has been moved. | Sorry, could you clarify the new date? | OK, the deadline is moving. | I moved yesterday.
3 | dar una opinión con matices | What do you think of remote work? | It depends. It saves time, but I miss my colleagues. | Remote is work. | I think yes.
3 | contar una anécdota | Have you ever been to London? | Yes, I went there two years ago for a course. | Yes, I go there two years ago. | No, I have been there yesterday.
3 | disculparse | You're late again. | I'm really sorry. The bus broke down. It won't happen again. | Yes, I'm late. | You're late too.
3 | dar seguimiento | Did you get my email? | Yes, thanks. I'll get back to you by tomorrow. | Yes, I get email. | No, I'm emailing.
3 | proponer una solución | The printer isn't working again. | Let's report it to IT and use the one upstairs for now. | The printer is very old. | Yes, it isn't working.
3 | cerrar una conversación | It was great talking to you. | You too! Let's keep in touch. | Yes, I talk. | Hello again!
`;

export const DIALOGUES: Dialogue[] = RAW.trim()
  .split('\n')
  .map((line) => line.split(' | ').map((part) => part.trim()))
  .map(([level, situation = '', line = '', answer = '', d1 = '', d2 = '']) => ({
    level: Number(level) as Level,
    situation,
    line,
    answer,
    distractors: [d1, d2],
  }));
