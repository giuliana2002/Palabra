/** Sustituto de un audio cuando no hay voz inglesa: se muestra el texto para poder seguir. */
export function NoVoiceFallback({ text }: { text: string }) {
  return (
    <div className="no-voice">
      <p className="small muted">
        Sin voz en inglés en este dispositivo: lee la frase en voz alta.
      </p>
      <p className="quiz__context" lang="en">
        {text}
      </p>
    </div>
  );
}
