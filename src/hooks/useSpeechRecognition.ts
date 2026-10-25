import { useCallback, useEffect, useRef, useState } from 'react';

/** Tipos mínimos de la Web Speech API (no están en lib.dom de TypeScript). */
interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecognitionConstructor = new () => Recognition;

function getRecognition(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed':
    'No hay permiso para usar el micrófono. Actívalo en la configuración del navegador.',
  'no-speech': 'No se ha detectado voz. Acércate al micrófono e inténtalo otra vez.',
  'audio-capture': 'No se encuentra ningún micrófono.',
  network: 'El reconocimiento de voz necesita conexión a Internet en este navegador.',
};

export function useSpeechRecognition() {
  const Constructor = getRecognition();
  const recognition = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => recognition.current?.abort(), []);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      if (!Constructor) return;
      recognition.current?.abort();
      const instance = new Constructor();
      instance.lang = 'en-US';
      instance.interimResults = true;
      instance.maxAlternatives = 1;
      let finalText = '';
      instance.onresult = (event) => {
        const text = Array.from(event.results)
          .map((r) => r[0]?.transcript ?? '')
          .join(' ');
        setTranscript(text);
        if (Array.from(event.results).every((r) => r.isFinal)) finalText = text;
      };
      instance.onerror = (event) =>
        setError(ERROR_MESSAGES[event.error] ?? `Error de reconocimiento: ${event.error}`);
      instance.onend = () => {
        setListening(false);
        if (finalText) onFinal(finalText);
      };
      setError(null);
      setTranscript('');
      setListening(true);
      recognition.current = instance;
      instance.start();
    },
    [Constructor],
  );

  const stop = useCallback(() => recognition.current?.stop(), []);

  return { supported: Constructor !== null, listening, transcript, error, start, stop };
}
