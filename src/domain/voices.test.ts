import { describe, expect, it } from 'vitest';
import { englishVoices, pickEnglishVoice, voiceStatus, type VoiceLike } from './voices';

const voice = (name: string, lang: string, localService = true): VoiceLike => ({
  name,
  lang,
  voiceURI: name,
  localService,
});

// Las voces reales de un Windows en español (comprobado en el equipo de la autora).
const spanishWindows = [
  voice('Microsoft Helena - Spanish (Spain)', 'es-ES'),
  voice('Microsoft Laura - Spanish (Spain)', 'es-ES'),
  voice('Microsoft Pablo - Spanish (Spain)', 'es-ES'),
];

describe('voces', () => {
  it('nunca elige una voz española para leer inglés', () => {
    expect(pickEnglishVoice(spanishWindows)).toBeNull();
    expect(voiceStatus(spanishWindows, true, true)).toBe('missing');
  });

  it('espera a que terminen de cargar antes de declarar que faltan', () => {
    expect(voiceStatus([], false, true)).toBe('loading');
    expect(voiceStatus([], true, false)).toBe('unsupported');
  });

  it('prefiere voces neuronales u online a las locales básicas', () => {
    const voices = [
      ...spanishWindows,
      voice('Microsoft David - English (United States)', 'en-US'),
      voice('Microsoft Aria Online (Natural) - English (United States)', 'en-US', false),
      voice('Google UK English Female', 'en-GB', false),
    ];
    expect(pickEnglishVoice(voices)?.name).toBe(
      'Microsoft Aria Online (Natural) - English (United States)',
    );
    expect(englishVoices(voices).map((v) => v.lang)).toEqual(['en-US', 'en-GB', 'en-US']);
    expect(voiceStatus(voices, true, true)).toBe('ok');
  });

  it('respeta la voz elegida en ajustes si es inglesa, y la ignora si no lo es', () => {
    const voices = [voice('Samantha', 'en-US'), voice('Daniel', 'en_GB'), ...spanishWindows];
    expect(pickEnglishVoice(voices, 'Daniel')?.name).toBe('Daniel');
    expect(pickEnglishVoice(voices, 'Microsoft Pablo - Spanish (Spain)')?.name).toBe('Samantha');
  });

  it('descarta voces de broma de macOS aunque sean inglesas', () => {
    const voices = [voice('Bad News', 'en-US'), voice('Karen', 'en-AU')];
    expect(pickEnglishVoice(voices)?.name).toBe('Karen');
  });
});
