/**
 * Mini-marcado para los textos de teoría: **negrita** y *cursiva*.
 * Se convierte en nodos de React sin usar innerHTML (sin riesgo de XSS).
 */
export type RichSegment = { text: string; style: 'plain' | 'bold' | 'italic' };

export function parseRichText(input: string): RichSegment[] {
  const segments: RichSegment[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  for (const match of input.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ text: input.slice(last, index), style: 'plain' });
    if (match[1] !== undefined) segments.push({ text: match[1], style: 'bold' });
    else if (match[2] !== undefined) segments.push({ text: match[2], style: 'italic' });
    last = index + match[0].length;
  }
  if (last < input.length) segments.push({ text: input.slice(last), style: 'plain' });
  return segments;
}
