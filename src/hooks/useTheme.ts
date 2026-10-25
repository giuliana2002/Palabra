import { useEffect } from 'react';
import { useProgress } from '@/store/progress';

/** Aplica el tema elegido como atributo en <html>; "system" deja que mande el sistema operativo. */
export function useTheme() {
  const theme = useProgress((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);
}
