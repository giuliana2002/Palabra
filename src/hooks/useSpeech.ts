import { useCallback, useEffect, useState } from 'react';
import { useProgress } from '@/store/progress';

/** Síntesis de voz con la voz inglesa elegida en ajustes (o la mejor disponible). */
export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const { voiceURI, rate } = useProgress((s) => s.settings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const load = () =>
      setVoices(speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en')));
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
    return () => speechSynthesis.removeEventListener('voiceschanged', load);
  }, [supported]);

  const speak = useCallback(
    (text: string, options: { rate?: number } = {}) => {
      if (!supported || !text.trim()) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.voiceURI === voiceURI) ?? pickDefaultVoice(voices);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? 'en-US';
      utterance.rate = options.rate ?? rate;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = utterance.onerror = () => setSpeaking(false);
      speechSynthesis.speak(utterance);
    },
    [supported, voices, voiceURI, rate],
  );

  return { supported, voices, speak, speaking };
}

function pickDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => /natural|neural|google/i.test(v.name) && v.lang.startsWith('en-')) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang === 'en-GB') ??
    voices[0]
  );
}
