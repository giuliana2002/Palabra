import { useState } from 'react';
import { useSpeech } from '@/hooks/useSpeech';
import { Icon } from './Icon';

type Platform = 'windows' | 'mac' | 'android' | 'ios' | 'other';

function detectPlatform(): Platform {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/windows/i.test(ua)) return 'windows';
  if (/mac os/i.test(ua)) return 'mac';
  return 'other';
}

const STEPS: Record<Platform, string[]> = {
  windows: [
    'Abre Configuración → Hora e idioma → Voz.',
    'En «Administrar voces», pulsa «Agregar voces» y elige English (United States).',
    'Cuando termine de instalarse, cierra y vuelve a abrir el navegador.',
  ],
  mac: [
    'Abre Ajustes del Sistema → Accesibilidad → Contenido leído.',
    'En «Voz del sistema», pulsa «Gestionar voces» y descarga una voz English (US).',
    'Vuelve a abrir el navegador.',
  ],
  android: [
    'Abre Ajustes → Sistema → Idiomas → Salida de texto a voz.',
    'En el motor de Google, «Instalar datos de voz» → English (United States).',
  ],
  ios: [
    'Abre Ajustes → Accesibilidad → Contenido leído → Voces.',
    'Elige English y descarga una voz (las «Mejorada» suenan mejor).',
  ],
  other: ['Instala una voz en inglés en la configuración de voz de tu sistema operativo.'],
};

/** Instrucciones para instalar una voz inglesa en el sistema operativo detectado. */
export function VoiceInstructions() {
  const platform = detectPlatform();
  return (
    <>
      <ol className="voice-help__steps">
        {STEPS[platform].map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="small">
        Otra opción: <strong>Google Chrome</strong> y <strong>Microsoft Edge</strong> traen voces en
        inglés online de buena calidad sin instalar nada.
      </p>
    </>
  );
}

const DISMISS_KEY = 'palabra-voice-banner-dismissed';

/** Aviso global cuando el sistema no tiene ninguna voz en inglés. */
export function VoiceBanner() {
  const { status } = useSpeech();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  if (status !== 'missing' || dismissed) return null;

  return (
    <aside
      className="callout callout--warn voice-help"
      role="alert"
      aria-labelledby="voice-help-title"
    >
      <Icon name="lightbulb" />
      <div>
        <p id="voice-help-title">
          <strong>Tu sistema no tiene ninguna voz en inglés,</strong> así que el audio está
          desactivado: con la voz española, el inglés se pronunciaría mal. Para activarlo:
        </p>
        <VoiceInstructions />
      </div>
      <button
        type="button"
        className="icon-button"
        aria-label="Cerrar aviso"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(DISMISS_KEY, '1');
          } catch {
            // sin almacenamiento: el aviso volverá a salir al recargar
          }
        }}
      >
        <Icon name="x" size={16} />
      </button>
    </aside>
  );
}
