# Palabra — inglés intensivo en 30 días

**Palabra** es una aplicación web estática para estudiar inglés desde nivel inicial mediante teoría, vocabulario, frases, práctica guiada y actividades de producción. Está pensada como una base de estudio intensiva: combina ejercicios cerrados con tareas de escucha, expresión oral y escritura.

> Objetivo: construir una base sólida y funcional en 30 días. El avance real depende del tiempo de práctica, la corrección recibida y la exposición diaria; ninguna aplicación puede garantizar fluidez por sí sola en ese plazo.

## Abrir la aplicación

No necesita instalación ni compilación.

1. Abre [palabra.html](./palabra.html) en un navegador moderno. Esta página redirige a la aplicación principal.
2. También puedes abrir directamente [palabra-actividades.html](./palabra-actividades.html).
3. Para estudiar el manual completo, abre [teoria.html](./teoria.html).

Para las integraciones de diccionario y ejemplos reales se necesita conexión a Internet. Si el navegador bloquea peticiones externas al abrir el archivo con `file://`, sirve la carpeta con un servidor estático local, por ejemplo:

```powershell
cd outputs
python -m http.server 8080
```

Después abre `http://localhost:8080/palabra.html`.

## Qué incluye

| Área | Contenido |
| --- | --- |
| Aprender | Itinerario diario con 90 actividades repartidas en seis bloques de práctica. |
| Teoría | Manual independiente A0–B1 funcional: estructura, tiempos, preguntas, conectores, pronunciación y escritura. |
| Vocabulario | Más de 400 conceptos organizados por categorías y con buscador. |
| Frases | Banco de 1.200 frases con traducción, dividido en fácil, intermedio y avanzado. La selección se adapta al día del plan. |
| Canciones | Dinámica de análisis con fragmentos aportados por la persona usuaria: significado, verbos, conectores, expresiones y ritmo. |
| Cuaderno | Espacio para conservar respuestas y observaciones de la sesión mientras se trabaja. |
| Recursos reales | Búsqueda de ejemplos, definiciones y pronunciación mediante recursos públicos. |

## Actividades diarias

Cada día presenta 15 conceptos y 90 actividades, agrupadas en seis formatos de 15 ejercicios:

1. **Significado en contexto**: elegir la expresión útil para una situación concreta.
2. **Construir frases**: ordenar palabras para formar una oración natural.
3. **Corregir errores**: detectar errores habituales de gramática, orden, tiempos o concordancia.
4. **Responder en diálogo**: escoger una respuesta adecuada a una situación comunicativa.
5. **Escucha activa**: escuchar una frase con la voz del navegador y trabajar comprensión y repetición.
6. **Producción personal**: escribir o decir una respuesta propia a partir de una consigna.

Los primeros días priorizan supervivencia, presentaciones, datos personales, preguntas y rutinas. A medida que avanza el itinerario, aumenta el peso de tiempos verbales, conectores, situaciones prácticas, comprensión y producción.

## Estructura del proyecto

```text
outputs/
├── palabra.html                 # Entrada y redirección a la aplicación
├── palabra-actividades.html     # Interfaz principal
├── palabra.css                  # Estilos de la aplicación
├── palabra.js                   # Plan diario, actividades y navegación
├── recursos.js                  # Integraciones de recursos públicos
├── teoria.html                  # Manual de teoría independiente
├── teoria.css                   # Estilos del manual de teoría
└── README.md                    # Esta documentación
```

La interfaz no depende de un framework ni de un proceso de compilación: HTML, CSS y JavaScript se cargan directamente en el navegador.

## Servicios externos

La aplicación usa servicios sin registro para ampliar la práctica:

- [Tatoeba](https://tatoeba.org/): búsqueda de ejemplos de oraciones en inglés.
- [Free Dictionary API](https://dictionaryapi.dev/): definiciones, pronunciación, ejemplos y sinónimos de palabras en inglés.
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API): reproducción de frases con las voces disponibles en el dispositivo.

La disponibilidad de estos servicios y de las voces depende de la conexión, el navegador y el sistema operativo. La aplicación mantiene alternativas locales cuando un recurso externo no responde.

## Límites actuales

- Las tareas de escritura y habla abierta orientan la práctica, pero no realizan una corrección lingüística completa automáticamente.
- Parte del banco de frases y de los ejercicios se genera a partir de plantillas para ofrecer variedad; conviene ampliar el material editorialmente revisado con el tiempo.
- El cuaderno y el progreso requieren una capa de almacenamiento persistente si se desea mantenerlos entre dispositivos o sesiones de forma fiable.
- El análisis de canciones trabaja con fragmentos que la persona usuaria pegue manualmente; no descarga letras protegidas por derechos de autor.

## Próximas mejoras recomendadas

- Guardado persistente del progreso, respuestas y repaso espaciado.
- Banco editorial de ejercicios por nivel, objetivo y error frecuente.
- Rúbricas de corrección para textos y grabaciones de voz.
- Diagnóstico inicial y adaptación real de dificultad según resultados.
- Modo de repaso con errores acumulados, intervalos y objetivos semanales.
- Fuente de audio humano y transcripciones graduadas para comprensión oral.

## Uso educativo responsable

Este proyecto es una herramienta de estudio, no una certificación de nivel. Para aspirar a un nivel alto en 30 días, úsalo como parte de una rutina intensa: teoría diaria, práctica activa, escucha auténtica, conversación con hablantes o profesor/a y revisión sistemática de errores.
