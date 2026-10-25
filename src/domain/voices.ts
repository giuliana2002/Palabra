/**
 * Elección de la voz de síntesis. Nunca se debe leer inglés con una voz de otro idioma:
 * en un Windows en español, sin voces inglesas instaladas, el navegador usaría la española
 * y enseñaría una pronunciación incorrecta.
 */
export interface VoiceLike {
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
}

export type VoiceStatus = 'loading' | 'ok' | 'missing' | 'unsupported';

const normalizeLang = (lang: string) => lang.replace('_', '-').toLowerCase();

export function isEnglish(voice: Pick<VoiceLike, 'lang'>): boolean {
  return normalizeLang(voice.lang).startsWith('en');
}

/** Puntuación de calidad: las voces neuronales/online suenan mucho más naturales. */
export function rankVoice(voice: VoiceLike): number {
  const name = voice.name.toLowerCase();
  const lang = normalizeLang(voice.lang);
  let score = 0;
  if (/natural|neural/.test(name)) score += 60;
  if (/online/.test(name)) score += 20;
  if (/google/.test(name)) score += 40;
  if (/premium|enhanced|siri/.test(name)) score += 35;
  if (/samantha|daniel|karen|moira|aria|jenny|guy|sonia|ryan/.test(name)) score += 10;
  if (
    /espeak|compact|novelty|whisper|bad news|bells|zarvox|albert|jester|trinoids|cellos/.test(name)
  )
    score -= 80;
  if (lang === 'en-us') score += 12;
  else if (lang === 'en-gb') score += 10;
  else if (lang.startsWith('en')) score += 4;
  return score;
}

export function englishVoices<T extends VoiceLike>(voices: readonly T[]): T[] {
  return voices.filter(isEnglish).sort((a, b) => rankVoice(b) - rankVoice(a));
}

/** Voz elegida en ajustes si sigue disponible y es inglesa; si no, la mejor inglesa; si no hay, ninguna. */
export function pickEnglishVoice<T extends VoiceLike>(
  voices: readonly T[],
  preferredURI?: string | null,
): T | null {
  const english = englishVoices(voices);
  return english.find((v) => v.voiceURI === preferredURI) ?? english[0] ?? null;
}

export function voiceStatus(
  voices: readonly VoiceLike[],
  settled: boolean,
  supported: boolean,
): VoiceStatus {
  if (!supported) return 'unsupported';
  if (voices.some(isEnglish)) return 'ok';
  return settled ? 'missing' : 'loading';
}
