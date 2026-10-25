/**
 * Vocabulario temático: 20 categorías × 20 conceptos = 400 entradas.
 * Formato: "inglés|español" separados por punto y coma.
 */
export interface VocabEntry {
  en: string;
  es: string;
  category: string;
}

const CATEGORIES: Record<string, string> = {
  Supervivencia:
    'hello|hola;goodbye|adiós;please|por favor;thanks|gracias;sorry|lo siento;yes|sí;no|no;maybe|quizá;again|otra vez;slowly|despacio;help|ayuda;question|pregunta;answer|respuesta;understand|entender;repeat|repetir;ready|preparado;wait|esperar;welcome|bienvenido;excuse me|perdona;important|importante',
  Personas:
    'name|nombre;age|edad;family|familia;friend|amigo;mother|madre;father|padre;brother|hermano;sister|hermana;child|niño;woman|mujer;man|hombre;people|gente;neighbour|vecino;colleague|compañero;teacher|profesor;student|estudiante;customer|cliente;visitor|visitante;partner|pareja;team|equipo',
  Casa: 'home|casa;room|habitación;kitchen|cocina;bathroom|baño;bedroom|dormitorio;door|puerta;window|ventana;table|mesa;chair|silla;bed|cama;key|llave;light|luz;wall|pared;floor|suelo;garden|jardín;clean|limpio;dirty|sucio;rent|alquiler;neighbourhood|barrio;address|dirección',
  Comida:
    'water|agua;coffee|café;tea|té;bread|pan;rice|arroz;meat|carne;fish|pescado;fruit|fruta;vegetable|verdura;breakfast|desayuno;lunch|comida;dinner|cena;menu|menú;bill|cuenta;delicious|delicioso;hungry|hambriento;thirsty|sediento;order|pedir;table|mesa;restaurant|restaurante',
  Viajes:
    'travel|viajar;trip|viaje;ticket|billete;passport|pasaporte;airport|aeropuerto;station|estación;platform|andén;train|tren;bus|autobús;plane|avión;hotel|hotel;reservation|reserva;map|mapa;left|izquierda;right|derecha;straight|recto;arrival|llegada;departure|salida;luggage|equipaje;journey|trayecto',
  Trabajo:
    'work|trabajo;job|empleo;office|oficina;meeting|reunión;project|proyecto;deadline|fecha límite;email|correo;report|informe;manager|responsable;salary|salario;shift|turno;task|tarea;career|carrera;interview|entrevista;experience|experiencia;skill|habilidad;company|empresa;remote|remoto;available|disponible;busy|ocupado',
  Tiempo:
    'today|hoy;tomorrow|mañana;yesterday|ayer;morning|mañana;afternoon|tarde;evening|noche;week|semana;month|mes;year|año;early|temprano;late|tarde;hour|hora;minute|minuto;now|ahora;soon|pronto;always|siempre;usually|normalmente;sometimes|a veces;never|nunca;already|ya',
  Acciones:
    'be|ser/estar;have|tener;do|hacer;go|ir;come|venir;get|conseguir;make|hacer;take|tomar;give|dar;find|encontrar;know|saber;think|pensar;want|querer;need|necesitar;like|gustar;use|usar;try|intentar;ask|preguntar;answer|responder;choose|elegir',
  Comunicación:
    'say|decir;tell|contar;speak|hablar;talk|hablar;listen|escuchar;hear|oír;read|leer;write|escribir;call|llamar;message|mensaje;explain|explicar;mean|significar;agree|estar de acuerdo;disagree|no estar de acuerdo;promise|prometer;invite|invitar;reply|responder;introduce|presentar;discuss|debatir;describe|describir',
  Emociones:
    'happy|feliz;sad|triste;angry|enfadado;afraid|asustado;tired|cansado;excited|emocionado;worried|preocupado;surprised|sorprendido;calm|tranquilo;proud|orgulloso;embarrassed|avergonzado;interested|interesado;bored|aburrido;confident|seguro;lonely|solo;grateful|agradecido;hopeful|esperanzado;disappointed|decepcionado;relaxed|relajado;stressed|estresado',
  Ciudad:
    'city|ciudad;street|calle;square|plaza;park|parque;shop|tienda;market|mercado;bank|banco;hospital|hospital;pharmacy|farmacia;museum|museo;library|biblioteca;police|policía;traffic|tráfico;crossing|cruce;bridge|puente;building|edificio;centre|centro;suburb|afueras;safe|seguro;crowded|lleno',
  Compras:
    'price|precio;cheap|barato;expensive|caro;size|talla;cash|efectivo;card|tarjeta;change|cambio;receipt|recibo;discount|descuento;try on|probarse;return|devolver;buy|comprar;sell|vender;choose|elegir;colour|color;black|negro;white|blanco;small|pequeño;large|grande;quality|calidad',
  Salud:
    'health|salud;doctor|médico;nurse|enfermero;medicine|medicina;pain|dolor;headache|dolor de cabeza;fever|fiebre;cough|tos;appointment|cita;rest|descansar;sleep|dormir;exercise|ejercicio;strong|fuerte;weak|débil;better|mejor;worse|peor;emergency|emergencia;allergy|alergia;injury|lesión;recover|recuperarse',
  Naturaleza:
    'weather|tiempo;sun|sol;rain|lluvia;wind|viento;cloud|nube;hot|caluroso;cold|frío;warm|templado;storm|tormenta;sea|mar;mountain|montaña;river|río;tree|árbol;flower|flor;animal|animal;beach|playa;forest|bosque;season|estación;spring|primavera;winter|invierno',
  Gramática:
    'subject|sujeto;verb|verbo;noun|sustantivo;adjective|adjetivo;adverb|adverbio;article|artículo;plural|plural;sentence|frase;question|pregunta;negative|negativa;present|presente;past|pasado;future|futuro;because|porque;although|aunque;however|sin embargo;therefore|por tanto;example|ejemplo;rule|regla;mistake|error',
  Música:
    'song|canción;lyrics|letra;chorus|estribillo;verse|estrofa;rhythm|ritmo;beat|pulso;melody|melodía;voice|voz;sing|cantar;listen|escuchar;line|línea;meaning|significado;feeling|sentimiento;metaphor|metáfora;expression|expresión;repeat|repetir;pronounce|pronunciar;accent|acento;theme|tema;artist|artista',
  Tecnología:
    'computer|ordenador;phone|teléfono;screen|pantalla;keyboard|teclado;password|contraseña;website|sitio web;link|enlace;file|archivo;folder|carpeta;download|descargar;upload|subir;search|buscar;internet|internet;signal|señal;battery|batería;charge|cargar;online|en línea;account|cuenta;settings|ajustes;update|actualizar',
  Opiniones:
    'opinion|opinión;idea|idea;reason|motivo;example|ejemplo;prefer|preferir;believe|creer;consider|considerar;recommend|recomendar;useful|útil;necessary|necesario;possible|posible;different|diferente;similar|parecido;better|mejor;worst|peor;advantage|ventaja;problem|problema;solution|solución;decision|decisión;result|resultado',
  Historias:
    'story|historia;beginning|inicio;ending|final;character|personaje;place|lugar;event|evento;happen|ocurrir;remember|recordar;forget|olvidar;before|antes;after|después;while|mientras;suddenly|de repente;finally|finalmente;then|entonces;first|primero;next|después;last|último;change|cambiar;learn|aprender',
  Avanzado:
    'achieve|lograr;improve|mejorar;develop|desarrollar;manage|gestionar;avoid|evitar;require|requerir;provide|proporcionar;support|apoyar;increase|aumentar;reduce|reducir;compare|comparar;analyse|analizar;solve|resolver;create|crear;prepare|preparar;continue|continuar;challenge|reto;progress|progreso;goal|objetivo;success|éxito',
};

export const VOCABULARY: VocabEntry[] = Object.entries(CATEGORIES).flatMap(([category, list]) =>
  list.split(';').map((pair) => {
    const [en = '', es = ''] = pair.split('|');
    return { en, es, category };
  }),
);

export const VOCAB_CATEGORIES = Object.keys(CATEGORIES);
