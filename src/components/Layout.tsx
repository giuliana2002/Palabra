import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { toDayKey } from '@/domain/dates';
import { dueCards } from '@/domain/srs';
import { currentStreak } from '@/domain/stats';
import { usePrefersDark } from '@/hooks/usePrefersDark';
import { useTheme } from '@/hooks/useTheme';
import { useProgress } from '@/store/progress';
import { Icon, type IconName } from './Icon';
import { VoiceBanner } from './VoiceHelp';

const NAV: Array<{ to: string; label: string; icon: IconName; end?: boolean }> = [
  { to: '/', label: 'Hoy', icon: 'home', end: true },
  { to: '/sesion', label: 'Sesión guiada', icon: 'play' },
  { to: '/ruta', label: 'Ruta de 31 días', icon: 'route' },
  { to: '/repaso', label: 'Repaso', icon: 'review' },
  { to: '/pronunciacion', label: 'Pronunciación', icon: 'mic' },
  { to: '/teoria', label: 'Teoría', icon: 'book' },
  { to: '/vocabulario', label: 'Vocabulario', icon: 'words' },
  { to: '/frases', label: 'Frases', icon: 'quote' },
  { to: '/canciones', label: 'Canciones', icon: 'music' },
  { to: '/recursos', label: 'Diccionario', icon: 'search' },
  { to: '/estadisticas', label: 'Estadísticas', icon: 'chart' },
  { to: '/ajustes', label: 'Ajustes', icon: 'settings' },
];

export function Layout() {
  useTheme();
  const today = toDayKey();
  const due = useProgress((s) => dueCards(Object.values(s.cards), today).length);
  const streak = useProgress((s) => currentStreak(s.activity, today));
  const theme = useProgress((s) => s.settings.theme);
  const updateSettings = useProgress((s) => s.updateSettings);
  const prefersDark = usePrefersDark();
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  return (
    <div className="app">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <div className="sidebar__top">
          <NavLink to="/" className="logo" aria-label="Palabra, inicio">
            palabra<span aria-hidden="true">·</span>
          </NavLink>
          <button
            type="button"
            className="icon-button sidebar__theme"
            onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            <Icon name={isDark ? 'sun' : 'moon'} />
          </button>
        </div>
        <div className="sidebar__streak" title="Días seguidos practicando">
          <Icon name="fire" size={18} />
          <span>
            <strong>{streak}</strong> {streak === 1 ? 'día' : 'días'} de racha
          </span>
        </div>
        <nav aria-label="Principal">
          <ul className="nav">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className="nav__link">
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.to === '/repaso' && due > 0 && (
                    <span className="badge" aria-label={`${due} tarjetas pendientes`}>
                      {due}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main id="contenido" className="main" tabIndex={-1}>
        <VoiceBanner />
        <Suspense fallback={<p className="muted">Cargando…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
