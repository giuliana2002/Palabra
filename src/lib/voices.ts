/**
 * Almacén externo de las voces del sistema (para `useSyncExternalStore`).
 * Las voces se cargan de forma asíncrona en Chrome/Edge: se escucha `voiceschanged` una sola vez
 * para toda la app, y se da por terminada la carga tras un breve margen.
 */
const SETTLE_MS = 1500;

let voices: SpeechSynthesisVoice[] = [];
let settled = false;
let started = false;
const listeners = new Set<() => void>();
let snapshot = { voices, settled };

const supported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function emit() {
  snapshot = { voices, settled };
  listeners.forEach((l) => l());
}

function start() {
  if (started || !supported()) return;
  started = true;
  const load = () => {
    voices = window.speechSynthesis.getVoices();
    if (voices.length) settled = true;
    emit();
  };
  load();
  window.speechSynthesis.addEventListener('voiceschanged', load);
  setTimeout(() => {
    settled = true;
    load();
  }, SETTLE_MS);
}

export function subscribeVoices(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVoicesSnapshot() {
  return snapshot;
}

export function isSpeechSupported() {
  return supported();
}
