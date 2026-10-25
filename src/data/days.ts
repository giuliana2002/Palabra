/**
 * Ruta de 31 días (0–30). Cada día tiene 15 conceptos propios con una frase de ejemplo
 * que contiene literalmente el concepto (lo comprueba un test).
 *
 * Formato compacto: una línea por concepto → "inglés | español | frase de ejemplo".
 */
import type { Concept, DayPlan, Level } from '@/domain/types';

interface RawDay {
  title: string;
  goal: string;
  grammar: string;
  theoryId: string;
  words: string;
}

const RAW_DAYS: RawDay[] = [
  {
    title: 'Diagnóstico y supervivencia',
    goal: 'Saluda, entiende instrucciones y forma tus primeras frases.',
    grammar: 'Saludos y frases fijas',
    theoryId: 'metodo',
    words: `
      hello | hola | Hello, nice to meet you.
      goodbye | adiós | Goodbye, see you tomorrow.
      please | por favor | Speak slowly, please.
      thank you | gracias | Thank you for your help.
      sorry | lo siento | Sorry, I am late.
      excuse me | perdone | Excuse me, where is the bus?
      yes | sí | Yes, I understand you.
      no | no | No, I am not ready.
      help | ayuda | I need help with this.
      understand | entender | I don't understand the question.
      repeat | repetir | Can you repeat that, please?
      slowly | despacio | Please speak more slowly.
      ready | preparado | I am ready to start.
      learn | aprender | I want to learn English.
      today | hoy | We start the course today.`,
  },
  {
    title: 'Presentarte',
    goal: 'Habla de tu identidad y conecta dos ideas con and y but.',
    grammar: 'To be y pronombres',
    theoryId: 'be',
    words: `
      name | nombre | My name is Laura.
      I am | yo soy / estoy | I am a student.
      you are | tú eres / estás | You are very kind.
      from | de (origen) | I am from Seville.
      country | país | Spain is a sunny country.
      city | ciudad | Seville is a beautiful city.
      live | vivir | I live in a small town.
      speak | hablar | I speak Spanish and English.
      student | estudiante | She is a good student.
      meet | conocer | Nice to meet you, Tom.
      also | también | I also like music.
      and | y | I am tired and hungry.
      but | pero | I am young but responsible.
      nice | agradable | It is a nice day.
      friend | amigo | Ana is my best friend.`,
  },
  {
    title: 'Datos personales',
    goal: 'Da información personal, deletrea y pide que repitan.',
    grammar: 'Números, artículos y posesivos',
    theoryId: 'nombres',
    words: `
      age | edad | What is your age?
      years old | años (edad) | I am twenty years old.
      phone | teléfono | My phone is on the table.
      number | número | What is your phone number?
      address | dirección | Please write your address here.
      email | correo electrónico | I send an email every day.
      spell | deletrear | Can you spell your name?
      first name | nombre de pila | My first name is Giuliana.
      surname | apellido | Her surname is Castillo.
      married | casado | My sister is married.
      single | soltero | He is single and happy.
      job | trabajo / empleo | I have a new job.
      birthday | cumpleaños | My birthday is in May.
      zero | cero | My number starts with zero.
      correct | correcto | Is this information correct?`,
  },
  {
    title: 'Preguntas esenciales',
    goal: 'Pregunta por personas, lugares, tiempo y motivos.',
    grammar: 'Preguntas con wh- y auxiliares',
    theoryId: 'preguntas',
    words: `
      what | qué | What is this word?
      where | dónde | Where do you live?
      when | cuándo | When is the next train?
      who | quién | Who is your teacher?
      why | por qué | Why are you learning English?
      how | cómo | How are you today?
      which | cuál | Which bus goes to the centre?
      how much | cuánto (precio) | How much is this coffee?
      how many | cuántos | How many brothers do you have?
      mean | significar | What does this word mean?
      question | pregunta | I have a question for you.
      answer | respuesta | That is the right answer.
      explain | explicar | Can you explain the rule?
      example | ejemplo | Give me an example, please.
      know | saber | I don't know the answer.`,
  },
  {
    title: 'Rutina diaria',
    goal: 'Describe tu día con el presente simple y adverbios de frecuencia.',
    grammar: 'Presente simple',
    theoryId: 'presente',
    words: `
      wake up | despertarse | I wake up at seven.
      get up | levantarse | I get up early on Mondays.
      breakfast | desayuno | I have breakfast at home.
      shower | ducha | I take a shower every morning.
      work | trabajar | I work from Monday to Friday.
      study | estudiar | We study English at night.
      lunch | comida (mediodía) | We have lunch at two.
      usually | normalmente | I usually walk to work.
      sometimes | a veces | Sometimes I cook dinner.
      always | siempre | She always drinks coffee.
      never | nunca | He never watches TV.
      every day | cada día | I read every day.
      go to bed | acostarse | I go to bed at eleven.
      cook | cocinar | My father likes to cook.
      tired | cansado | I am tired after work.`,
  },
  {
    title: 'Canciones: primer análisis',
    goal: 'Comprende la idea de una canción, no una lista de palabras.',
    grammar: 'Escucha por bloques de sentido',
    theoryId: 'sonidos',
    words: `
      song | canción | This song is very old.
      lyrics | letra | I read the lyrics online.
      chorus | estribillo | Everybody sings the chorus.
      verse | estrofa | The first verse is sad.
      listen | escuchar | I listen to music every day.
      sing | cantar | She can sing very well.
      voice | voz | He has a beautiful voice.
      rhythm | ritmo | The rhythm is very fast.
      meaning | significado | What is the meaning of this line?
      feeling | sentimiento | This song has a sad feeling.
      heart | corazón | The singer talks about her heart.
      dance | bailar | Let's dance to this song.
      loud | alto (volumen) | The music is too loud.
      favourite | favorito | This is my favourite band.
      guess | adivinar | Guess the meaning of the word.`,
  },
  {
    title: 'Familia',
    goal: 'Habla de tu familia con posesivos y have got.',
    grammar: 'Posesivos y have got',
    theoryId: 'be',
    words: `
      family | familia | I have a big family.
      mother | madre | My mother is a nurse.
      father | padre | His father works in a bank.
      brother | hermano | My brother is very funny.
      sister | hermana | My sister lives in Madrid.
      parents | padres | My parents are very kind.
      son | hijo | Their son is five years old.
      daughter | hija | Her daughter plays the piano.
      grandmother | abuela | My grandmother tells great stories.
      uncle | tío | My uncle has a farm.
      cousin | primo | My cousin is my best friend.
      husband | marido | Her husband is from Italy.
      wife | esposa | His wife is a doctor.
      have got | tener | I have got two brothers.
      look like | parecerse | You look like your mother.`,
  },
  {
    title: 'Comida y pedidos',
    goal: 'Pide en un bar o restaurante y habla de lo que comes.',
    grammar: 'Contables, incontables y some/any',
    theoryId: 'nombres',
    words: `
      menu | carta | Can I see the menu, please?
      order | pedir | Are you ready to order?
      I would like | me gustaría | I would like a coffee, please.
      water | agua | A glass of water, please.
      bread | pan | We need some bread.
      chicken | pollo | I would like the chicken salad.
      fish | pescado | The fish is very fresh.
      vegetables | verduras | Children should eat vegetables.
      dessert | postre | Do you want a dessert?
      bill | cuenta | Can we have the bill, please?
      hungry | hambriento | I am very hungry now.
      delicious | delicioso | This soup is delicious.
      some | algo de / unos | I want some rice.
      any | algún / nada de | We don't have any milk.
      waiter | camarero | The waiter is very friendly.`,
  },
  {
    title: 'Direcciones',
    goal: 'Pide y da indicaciones para llegar a un sitio.',
    grammar: 'Imperativos y preposiciones de lugar',
    theoryId: 'preposiciones',
    words: `
      turn left | gira a la izquierda | Turn left at the bank.
      turn right | gira a la derecha | Turn right after the bridge.
      go straight | sigue recto | Go straight for two minutes.
      corner | esquina | The shop is on the corner.
      next to | al lado de | The bank is next to the café.
      opposite | enfrente de | The hotel is opposite the station.
      between | entre | The park is between two schools.
      near | cerca | Is there a pharmacy near here?
      far | lejos | The airport is far from here.
      street | calle | Walk down this street.
      cross | cruzar | Cross the road carefully.
      traffic lights | semáforo | Stop at the traffic lights.
      map | mapa | Can you show me on the map?
      lost | perdido | Excuse me, I am lost.
      behind | detrás de | The car park is behind the museum.`,
  },
  {
    title: 'Hora y planes',
    goal: 'Di la hora, propón planes y acepta o rechaza invitaciones.',
    grammar: 'Preposiciones de tiempo: at, on, in',
    theoryId: 'preposiciones',
    words: `
      o'clock | en punto | The class starts at nine o'clock.
      half past | y media | We meet at half past six.
      quarter to | menos cuarto | It is quarter to eight.
      weekend | fin de semana | What do you do at the weekend?
      tonight | esta noche | Are you free tonight?
      free | libre | I am free on Saturday.
      busy | ocupado | Sorry, I am busy today.
      plan | plan | Do you have a plan for Sunday?
      invite | invitar | I want to invite you to dinner.
      Let's | vamos a / hagamos | Let's go to the cinema.
      How about | qué tal si | How about a walk in the park?
      early | temprano | I arrive early to work.
      late | tarde | The bus is late again.
      calendar | calendario | I write my plans in a calendar.
      meet | quedar | We meet in front of the cinema.`,
  },
  {
    title: 'Compras',
    goal: 'Pregunta precios y tallas, paga y devuelve productos.',
    grammar: 'This/that/these/those y precios',
    theoryId: 'nombres',
    words: `
      price | precio | The price is very good.
      cheap | barato | This shirt is very cheap.
      expensive | caro | That jacket is too expensive.
      size | talla | What size do you need?
      try on | probarse | Can I try on these shoes?
      fitting room | probador | The fitting room is over there.
      pay | pagar | Can I pay by card?
      cash | efectivo | I always pay in cash.
      receipt | ticket de compra | Keep the receipt, please.
      discount | descuento | Is there a discount today?
      return | devolver | I want to return this jumper.
      buy | comprar | I need to buy a new phone.
      these | estos | These shoes are comfortable.
      those | esos / aquellos | Those trousers are too long.
      sale | rebajas | The shoes are on sale.`,
  },
  {
    title: 'Aficiones',
    goal: 'Habla de lo que te gusta hacer en tu tiempo libre.',
    grammar: 'Like / love / hate + -ing',
    theoryId: 'presente',
    words: `
      hobby | afición | My favourite hobby is reading.
      free time | tiempo libre | I paint in my free time.
      enjoy | disfrutar | I enjoy playing the guitar.
      love | encantar | I love watching films.
      hate | odiar | I hate getting up early.
      play | jugar / tocar | We play football on Sundays.
      watch | ver | They watch series at night.
      read | leer | I read a book every month.
      paint | pintar | My cousin likes to paint.
      gym | gimnasio | I go to the gym twice a week.
      swim | nadar | Can you swim well?
      photography | fotografía | Photography is my passion.
      interested in | interesado en | I am interested in history.
      good at | bueno en | She is good at chess.
      once a week | una vez por semana | I go dancing once a week.`,
  },
  {
    title: 'Casa',
    goal: 'Describe tu casa y dónde están las cosas.',
    grammar: 'There is / there are',
    theoryId: 'nombres',
    words: `
      there is | hay (singular) | There is a sofa in the living room.
      there are | hay (plural) | There are two bedrooms in my flat.
      flat | piso | My flat is small but bright.
      kitchen | cocina | The kitchen is next to the bathroom.
      bedroom | dormitorio | My bedroom has a big window.
      bathroom | baño | The bathroom is on the left.
      living room | salón | We watch TV in the living room.
      sofa | sofá | The cat sleeps on the sofa.
      fridge | frigorífico | The milk is in the fridge.
      stairs | escaleras | Go up the stairs, please.
      rent | alquiler | The rent is very high here.
      neighbour | vecino | My neighbour is very quiet.
      under | debajo de | The keys are under the book.
      on | sobre / encima de | Your phone is on the table.
      in | dentro de | The plates are in the cupboard.`,
  },
  {
    title: 'Ciudad',
    goal: 'Describe tu ciudad y los servicios que tiene.',
    grammar: 'Adjetivos y orden de la frase',
    theoryId: 'frase',
    words: `
      town | pueblo | I live in a quiet town.
      square | plaza | We meet in the main square.
      market | mercado | The market opens at eight.
      library | biblioteca | I study at the library.
      hospital | hospital | The hospital is very modern.
      museum | museo | The museum is free on Sundays.
      crowded | lleno de gente | The centre is very crowded.
      quiet | tranquilo | My street is very quiet.
      noisy | ruidoso | This bar is too noisy.
      building | edificio | That building is very old.
      public transport | transporte público | Public transport is cheap here.
      underground | metro | I take the underground to work.
      bridge | puente | There is a famous bridge here.
      safe | seguro | This area is very safe.
      dangerous | peligroso | This road is dangerous at night.`,
  },
  {
    title: 'Conversaciones',
    goal: 'Mantén una conversación corta: reacciona, pregunta y cierra.',
    grammar: 'Presente continuo',
    theoryId: 'presente',
    words: `
      How are you | cómo estás | Hi Marta, how are you today?
      fine | bien | I am fine, thank you.
      What's up | qué tal | Hey Tom, what's up?
      Really | en serio | Really? That is amazing!
      I see | ya veo | I see, that makes sense.
      What about you | y tú qué | I love tea. What about you?
      at the moment | en este momento | I am working at the moment.
      right now | ahora mismo | She is cooking right now.
      chat | charlar | We chat after class.
      agree | estar de acuerdo | I agree with you.
      Of course | por supuesto | Of course, I can help you.
      Never mind | no importa | Never mind, it is not important.
      by the way | por cierto | By the way, I have a new job.
      See you | nos vemos | See you on Monday!
      Take care | cuídate | Take care and see you soon.`,
  },
  {
    title: 'Pasado simple',
    goal: 'Cuenta lo que hiciste ayer y el fin de semana pasado.',
    grammar: 'Pasado simple: regulares e irregulares',
    theoryId: 'pasado',
    words: `
      yesterday | ayer | I worked late yesterday.
      last week | la semana pasada | We visited Rome last week.
      ago | hace (tiempo) | I started two years ago.
      went | fui (go) | I went to the beach on Sunday.
      had | tuve / tomé (have) | We had dinner at a restaurant.
      saw | vi (see) | I saw a great film last night.
      bought | compré (buy) | She bought a new bike.
      made | hice (make) | I made a cake for my mum.
      took | tomé / cogí (take) | We took the train to Cádiz.
      met | conocí / quedé (meet) | I met my friends at the park.
      was | era / estaba | The weather was perfect.
      were | eran / estaban | The streets were empty.
      did | hice (do) | What did you do last weekend?
      didn't | no (pasado) | I didn't sleep very well.
      visited | visité | We visited my grandparents.`,
  },
  {
    title: 'Viajes',
    goal: 'Resuelve situaciones en aeropuertos, estaciones y hoteles.',
    grammar: 'Can / could para pedir',
    theoryId: 'modales',
    words: `
      trip | viaje | We had a great trip.
      ticket | billete | I need a return ticket.
      passport | pasaporte | Don't forget your passport.
      luggage | equipaje | My luggage is very heavy.
      flight | vuelo | The flight leaves at ten.
      delayed | retrasado | Our flight is delayed.
      platform | andén | The train leaves from platform four.
      book | reservar | I want to book a room.
      reservation | reserva | I have a reservation for two nights.
      check in | registrarse | We can check in at two.
      check out | dejar el hotel | We check out tomorrow morning.
      single room | habitación individual | I would like a single room.
      abroad | en el extranjero | I want to study abroad.
      sightseeing | hacer turismo | We went sightseeing in Lisbon.
      Could you | podría usted | Could you call a taxi, please?`,
  },
  {
    title: 'Opiniones',
    goal: 'Da tu opinión con razones y reacciona a la de otras personas.',
    grammar: 'I think… because…',
    theoryId: 'conectores',
    words: `
      I think | creo que | I think this idea is good.
      I don't think | no creo que | I don't think it is true.
      in my opinion | en mi opinión | In my opinion, the film is boring.
      because | porque | I stay home because it is raining.
      prefer | preferir | I prefer tea to coffee.
      disagree | no estar de acuerdo | I disagree with that idea.
      maybe | quizá | Maybe you are right.
      point | argumento / punto | That is a good point.
      true | cierto | That is not completely true.
      important | importante | Sleep is very important.
      useful | útil | This app is really useful.
      boring | aburrido | The meeting was boring.
      interesting | interesante | What an interesting book!
      for example | por ejemplo | Some cities, for example Seville, are hot.
      I'm not sure | no estoy seguro | I'm not sure about that.`,
  },
  {
    title: 'Trabajo',
    goal: 'Habla de tu trabajo, tus tareas y tus habilidades.',
    grammar: 'Presente simple vs. continuo en el trabajo',
    theoryId: 'presente',
    words: `
      company | empresa | I work for a tech company.
      office | oficina | The office is in the city centre.
      colleague | compañero de trabajo | My colleague helps me a lot.
      manager | responsable / jefe | My manager is very fair.
      meeting | reunión | We have a meeting at ten.
      deadline | fecha límite | The deadline is on Friday.
      task | tarea | This task is very easy.
      skills | habilidades | You need good communication skills.
      experience | experiencia | I have experience with Java.
      interview | entrevista | I have a job interview tomorrow.
      salary | sueldo | The salary is good.
      full-time | jornada completa | I want a full-time job.
      remote | en remoto | I work remote three days a week.
      team | equipo | Our team is small but strong.
      apply for | solicitar (empleo) | I want to apply for this job.`,
  },
  {
    title: 'Salud',
    goal: 'Explica cómo te encuentras y entiende consejos médicos.',
    grammar: 'Should / must / have to',
    theoryId: 'modales',
    words: `
      headache | dolor de cabeza | I have a terrible headache.
      sore throat | dolor de garganta | She has a sore throat.
      fever | fiebre | My son has a fever.
      cough | tos | This cough is getting worse.
      appointment | cita | I have an appointment at five.
      doctor | médico | You should see a doctor.
      pharmacy | farmacia | The pharmacy is open all night.
      medicine | medicina | Take this medicine after meals.
      should | deberías | You should drink more water.
      must | debes (obligación) | You must rest for two days.
      have to | tener que | I have to go to the hospital.
      feel | sentirse | I feel much better today.
      sick | enfermo | I feel sick this morning.
      hurt | doler | My legs hurt after the gym.
      healthy | sano | I try to eat healthy food.`,
  },
  {
    title: 'Mensajes',
    goal: 'Escribe y entiende mensajes, correos y notas breves.',
    grammar: 'Registro formal e informal',
    theoryId: 'escritura',
    words: `
      message | mensaje | I sent you a message.
      text | escribir un mensaje | Text me when you arrive.
      reply | responder | Please reply as soon as possible.
      Dear | estimado | Dear Mr Smith, thank you for your email.
      Best regards | un saludo | Best regards, Laura.
      attach | adjuntar | I attach my CV to this email.
      subject | asunto | Write a clear subject line.
      as soon as possible | lo antes posible | Please call me as soon as possible.
      let me know | avísame | Let me know if you can come.
      I'm writing to | le escribo para | I'm writing to ask for information.
      looking forward to | con ganas de | I'm looking forward to your reply.
      thanks for | gracias por | Thanks for your quick answer.
      call back | devolver la llamada | Can you call back later?
      voicemail | buzón de voz | I left you a voicemail.
      confirm | confirmar | Can you confirm the time?`,
  },
  {
    title: 'Historias',
    goal: 'Cuenta una historia en orden con secuenciadores.',
    grammar: 'Pasado continuo y secuenciadores',
    theoryId: 'pasado',
    words: `
      first | primero | First, we packed our bags.
      then | luego | Then we took a taxi.
      after that | después de eso | After that, we had lunch.
      finally | finalmente | Finally, we arrived home.
      suddenly | de repente | Suddenly, the lights went out.
      while | mientras | I was reading while it was raining.
      was walking | estaba caminando | I was walking home at midnight.
      happened | ocurrió | What happened next?
      remember | recordar | I remember that day very well.
      forget | olvidar | I will never forget that trip.
      once upon a time | érase una vez | Once upon a time, there was a king.
      in the end | al final | In the end, everything was fine.
      scared | asustado | We were very scared.
      surprised | sorprendido | She was surprised to see me.
      story | historia | Tell me a story, please.`,
  },
  {
    title: 'Conectores',
    goal: 'Une ideas para pasar de frases sueltas a un discurso.',
    grammar: 'Conectores de contraste, causa y consecuencia',
    theoryId: 'conectores',
    words: `
      although | aunque | Although it was cold, we went out.
      however | sin embargo | It was cheap. However, it was bad.
      so | así que | I was tired, so I went to bed.
      because of | debido a | The match stopped because of the rain.
      therefore | por lo tanto | He was ill. Therefore, he stayed home.
      also | además / también | She also speaks French.
      as well | también | I want a coffee as well.
      instead of | en lugar de | I drink tea instead of coffee.
      unless | a menos que | I will go unless it rains.
      even though | aunque (enfático) | Even though I studied, I failed.
      on the other hand | por otro lado | On the other hand, it is very expensive.
      in addition | además | In addition, the hotel has a pool.
      as a result | como resultado | As a result, we lost the train.
      both | ambos | Both options are good.
      either | o (uno u otro) | You can choose either option.`,
  },
  {
    title: 'Canciones: expresiones',
    goal: 'Reconoce expresiones típicas de canciones y úsalas en contexto.',
    grammar: 'Contracciones y lenguaje coloquial',
    theoryId: 'sonidos',
    words: `
      gonna | going to (coloquial) | I'm gonna call you tonight.
      wanna | want to (coloquial) | I wanna go home now.
      gotta | have got to (coloquial) | I gotta go, see you!
      ain't | no es / no está (coloquial) | It ain't over yet.
      let go | soltar / dejar ir | Sometimes you have to let go.
      hold on | aguanta | Hold on, I'm coming!
      fall in love | enamorarse | It is easy to fall in love.
      miss you | te echo de menos | I miss you every day.
      by my side | a mi lado | Stay by my side tonight.
      give up | rendirse | Never give up on your dreams.
      break my heart | romperme el corazón | Please don't break my heart.
      tonight | esta noche | We are dancing tonight.
      forever | para siempre | This song lasts forever.
      dream | sueño | I had a beautiful dream.
      shine | brillar | The stars shine so bright.`,
  },
  {
    title: 'Comparar y elegir',
    goal: 'Compara opciones y justifica tu elección.',
    grammar: 'Comparativos y superlativos',
    theoryId: 'conectores',
    words: `
      cheaper | más barato | The bus is cheaper than the train.
      more expensive | más caro | This phone is more expensive.
      better | mejor | This option is better for us.
      worse | peor | The weather is worse today.
      the best | el mejor | This is the best pizza in town.
      the worst | el peor | That was the worst film ever.
      than | que (comparación) | She is taller than me.
      as good as | tan bueno como | This one is as good as that one.
      bigger | más grande | Their house is bigger than ours.
      faster | más rápido | The train is faster than the car.
      choose | elegir | I choose the blue one.
      option | opción | This option is the cheapest.
      compared to | comparado con | Compared to London, Seville is cheap.
      advantage | ventaja | The main advantage is the price.
      disadvantage | desventaja | One disadvantage is the noise.`,
  },
  {
    title: 'Reuniones',
    goal: 'Participa en una reunión: propone, interrumpe con educación y resume.',
    grammar: 'Peticiones corteses y sugerencias',
    theoryId: 'modales',
    words: `
      agenda | orden del día | Let's look at the agenda.
      suggest | sugerir | I suggest a short break.
      propose | proponer | I propose a new deadline.
      Can I add something | puedo añadir algo | Sorry, can I add something?
      Could you clarify | podrías aclarar | Could you clarify that point?
      summary | resumen | Here is a quick summary.
      next steps | próximos pasos | Let's agree on the next steps.
      update | actualización | Can you give us an update?
      feedback | opinión / comentarios | Thanks for your feedback.
      schedule | programar / horario | Let's schedule another meeting.
      postpone | aplazar | We need to postpone the meeting.
      on time | puntual | The meeting started on time.
      share my screen | compartir pantalla | Let me share my screen.
      take notes | tomar notas | Who can take notes today?
      follow up | hacer seguimiento | I will follow up by email.`,
  },
  {
    title: 'Problemas y soluciones',
    goal: 'Explica un problema, reclama y propone soluciones.',
    grammar: 'Primer condicional',
    theoryId: 'futuro',
    words: `
      problem | problema | We have a small problem.
      solution | solución | I have a simple solution.
      broken | roto | My laptop is broken.
      doesn't work | no funciona | The printer doesn't work.
      complain | quejarse | I want to complain about the noise.
      refund | reembolso | Can I get a refund?
      fix | arreglar | Can you fix my phone?
      replace | sustituir | They will replace the screen.
      if | si (condicional) | If it rains, we will stay home.
      unless | a menos que | We will lose the bus unless we run.
      mistake | error | I made a mistake in the report.
      apologise | disculparse | I apologise for the delay.
      try | intentar | Let's try another way.
      instead | en su lugar | Let's take the train instead.
      deal with | ocuparse de | I will deal with the problem.`,
  },
  {
    title: 'Futuro',
    goal: 'Habla de planes, decisiones y predicciones.',
    grammar: 'Will, going to y presente continuo de futuro',
    theoryId: 'futuro',
    words: `
      going to | ir a (plan) | I'm going to learn Python.
      will | futuro (decisión) | I will call you later.
      next year | el año que viene | We are moving next year.
      soon | pronto | The bus will arrive soon.
      probably | probablemente | It will probably rain tomorrow.
      plan to | planear | I plan to travel in summer.
      hope | esperar (deseo) | I hope to see you soon.
      goal | objetivo | My goal is to speak fluently.
      future | futuro | I am excited about the future.
      in five years | dentro de cinco años | In five years I will be a senior developer.
      tomorrow | mañana | I'm meeting Ana tomorrow.
      promise | prometer | I promise I will help you.
      decide | decidir | We will decide next week.
      might | puede que | I might change jobs.
      expect | esperar (prever) | I expect good results.`,
  },
  {
    title: 'Textos breves',
    goal: 'Escribe un texto corto con introducción, ideas y cierre.',
    grammar: 'Estructura de párrafo y revisión',
    theoryId: 'escritura',
    words: `
      paragraph | párrafo | Write a short paragraph about you.
      introduction | introducción | The introduction must be clear.
      main idea | idea principal | What is the main idea?
      conclusion | conclusión | In the conclusion, repeat your opinion.
      describe | describir | Describe your favourite place.
      firstly | en primer lugar | Firstly, I want to thank you.
      secondly | en segundo lugar | Secondly, the price is too high.
      to sum up | en resumen | To sum up, it was a great day.
      draft | borrador | This is only a first draft.
      check | revisar | Check your spelling before sending.
      spelling | ortografía | My spelling is getting better.
      sentence | frase | This sentence is too long.
      word count | número de palabras | The word count is one hundred.
      topic | tema | Choose an easy topic.
      such as | como (ejemplo) | I like fruits such as mango.`,
  },
  {
    title: 'Noticias sencillas',
    goal: 'Comprende titulares y resume una noticia corta.',
    grammar: 'Present perfect básico',
    theoryId: 'pasado',
    words: `
      news | noticias | I read the news every morning.
      headline | titular | The headline is very short.
      article | artículo | This article is about climate.
      report | informar / informe | The report says prices are rising.
      has announced | ha anunciado | The government has announced new rules.
      have found | han encontrado | Scientists have found a new planet.
      just | acabar de | The match has just finished.
      already | ya | I have already read it.
      yet | todavía (neg.) / ya (preg.) | Have you finished yet?
      recently | recientemente | Prices have risen recently.
      increase | aumento | There is an increase in tourism.
      weather | tiempo (clima) | The weather will be sunny.
      according to | según | According to the news, it will rain.
      people | gente | Many people live in cities.
      government | gobierno | The government has a new plan.`,
  },
  {
    title: 'Conversación larga',
    goal: 'Habla tres minutos sobre ti, un viaje y una opinión sin leer.',
    grammar: 'Repaso integrador y fluidez',
    theoryId: 'escritura',
    words: `
      actually | en realidad | Actually, I prefer the mountains.
      I mean | o sea / quiero decir | I mean, it was not bad.
      you know | ya sabes | It was, you know, a bit strange.
      to be honest | sinceramente | To be honest, I was nervous.
      anyway | en fin | Anyway, let's talk about you.
      as far as I know | que yo sepa | As far as I know, it is free.
      it depends | depende | It depends on the weather.
      for instance | por ejemplo | For instance, I cook every day.
      in fact | de hecho | In fact, I have been there twice.
      Let me think | déjame pensar | Let me think about it.
      What do you mean | qué quieres decir | What do you mean exactly?
      That makes sense | tiene sentido | Yes, that makes sense.
      I have been | he estado | I have been to London twice.
      used to | solía | I used to live in a village.
      It was great talking to you | ha sido genial hablar contigo | It was great talking to you today.`,
  },
];

function levelFor(day: number): Level {
  if (day < 10) return 1;
  if (day < 21) return 2;
  return 3;
}

function parseWords(raw: string): Concept[] {
  return raw
    .trim()
    .split('\n')
    .map((line) => line.split('|').map((part) => part.trim()))
    .map(([en = '', es = '', example = '']) => ({ en, es, example }));
}

export const DAYS: DayPlan[] = RAW_DAYS.map((raw, id) => ({
  id,
  title: raw.title,
  goal: raw.goal,
  grammar: raw.grammar,
  theoryId: raw.theoryId,
  level: levelFor(id),
  concepts: parseWords(raw.words),
}));

export const TOTAL_DAYS = DAYS.length;

export function getDay(id: number): DayPlan | undefined {
  return DAYS[id];
}
