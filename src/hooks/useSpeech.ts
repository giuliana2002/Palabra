import { useCallback, useState, useSyncExternalStore } from 'react';
import { englishVoices, pickEnglishVoice, voiceStatus } from '@/domain/voices';
import { getVoicesSnapshot, isSpeechSupported, subscribeVoices } from '@/lib/voices';
import { useProgress } from '@/store/progress';

const EMPTY = { voices: [] as SpeechSynthesisVoice[], settled: false };

/**
 * Síntesis de voz en inglés. Si el sistema no tiene ninguna voz inglesa, NO habla
 * (leería el inglés con acento español) y `status` vale "missing" para avisar al usuario.
 */
export function useSpeech() {
  const supported = isSpeechSupported();
  const { voiceURI, rate } = useProgress((s) => s.settings);
  const { voices, settled } = useSyncExternalStore(subscribeVoices, getVoicesSnapshot, () => EMPTY);
  const [speaking, setSpeaking] = useState(false);
  const status = voiceStatus(voices, settled, supported);
  const voice = pickEnglishVoice(voices, voiceURI);

  const speak = useCallback(
    (text: string, options: { rate?: number } = {}): boolean => {
      if (!supported || !text.trim() || !voice) return false;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = options.rate ?? rate;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [supported, voice, rate],
  );

  return { supported, status, voice, voices: englishVoices(voices), speak, speaking };
}
