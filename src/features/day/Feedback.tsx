import { Icon } from '@/components/Icon';

interface Props {
  ok: boolean;
  correct?: string;
  explanation?: string;
  okText?: string;
}

export function Feedback({
  ok,
  correct,
  explanation,
  okText = '¡Correcto! Ahora dilo en voz alta.',
}: Props) {
  return (
    <div className={`feedback ${ok ? 'feedback--ok' : 'feedback--ko'}`} role="status">
      <Icon name={ok ? 'check' : 'x'} size={18} />
      <div>
        <p>
          {ok ? (
            okText
          ) : (
            <>
              La respuesta correcta es: <strong lang="en">{correct}</strong>
            </>
          )}
        </p>
        {explanation && <p className="feedback__explanation">{explanation}</p>}
      </div>
    </div>
  );
}
