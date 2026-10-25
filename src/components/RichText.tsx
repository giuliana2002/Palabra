import { parseRichText } from '@/domain/richText';

export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseRichText(text).map((segment, i) =>
        segment.style === 'bold' ? (
          <strong key={i}>{segment.text}</strong>
        ) : segment.style === 'italic' ? (
          <em key={i} lang="en">
            {segment.text}
          </em>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}
