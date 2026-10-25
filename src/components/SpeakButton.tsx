import { useSpeech } from '@/hooks/useSpeech';
import { Icon } from './Icon';

interface Props {
  text: string;
  label?: string;
  slow?: boolean;
  compact?: boolean;
}

const MISSING = 'No hay ninguna voz en inglés instalada. Mira el aviso de arriba para activarla.';

export function SpeakButton({ text, label = 'Escuchar', slow = false, compact = false }: Props) {
  const { status, speak } = useSpeech();
  if (status === 'unsupported') return null;
  const missing = status === 'missing';
  return (
    <button
      type="button"
      className={compact ? 'icon-button' : 'button button--ghost'}
      onClick={() => speak(text, slow ? { rate: 0.65 } : {})}
      disabled={missing}
      aria-label={compact ? `${label}: ${text}` : undefined}
      title={missing ? MISSING : compact ? label : undefined}
    >
      <Icon name="play" size={compact ? 16 : 18} />
      {!compact && <span>{label}</span>}
    </button>
  );
}
