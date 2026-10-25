import { useSpeech } from '@/hooks/useSpeech';
import { Icon } from './Icon';

interface Props {
  text: string;
  label?: string;
  slow?: boolean;
  compact?: boolean;
}

export function SpeakButton({ text, label = 'Escuchar', slow = false, compact = false }: Props) {
  const { supported, speak } = useSpeech();
  if (!supported) return null;
  return (
    <button
      type="button"
      className={compact ? 'icon-button' : 'button button--ghost'}
      onClick={() => speak(text, slow ? { rate: 0.65 } : {})}
      aria-label={compact ? `${label}: ${text}` : undefined}
      title={compact ? label : undefined}
    >
      <Icon name="play" size={compact ? 16 : 18} />
      {!compact && <span>{label}</span>}
    </button>
  );
}
