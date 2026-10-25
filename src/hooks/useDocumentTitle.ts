import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Palabra` : 'Palabra · Inglés en 31 días';
  }, [title]);
}
