import { lazy, type ComponentType } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/features/home/HomePage';

// Las páginas se cargan bajo demanda para que la primera carga sea ligera.
const page = <T extends Record<string, ComponentType>>(loader: () => Promise<T>, name: keyof T) =>
  lazy(() => loader().then((m) => ({ default: m[name] as ComponentType })));

const RoutePage = page(() => import('@/features/route/RoutePage'), 'RoutePage');
const DayPage = page(() => import('@/features/day/DayPage'), 'DayPage');
const ReviewPage = page(() => import('@/features/review/ReviewPage'), 'ReviewPage');
const PronunciationPage = page(
  () => import('@/features/pronunciation/PronunciationPage'),
  'PronunciationPage',
);
const StatsPage = page(() => import('@/features/stats/StatsPage'), 'StatsPage');
const VocabularyPage = page(() => import('@/features/vocabulary/VocabularyPage'), 'VocabularyPage');
const PhrasesPage = page(() => import('@/features/phrases/PhrasesPage'), 'PhrasesPage');
const TheoryPage = page(() => import('@/features/theory/TheoryPage'), 'TheoryPage');
const SongsPage = page(() => import('@/features/songs/SongsPage'), 'SongsPage');
const ResourcesPage = page(() => import('@/features/resources/ResourcesPage'), 'ResourcesPage');
const SessionPage = page(() => import('@/features/session/SessionPage'), 'SessionPage');
const ExamPage = page(() => import('@/features/exam/ExamPage'), 'ExamPage');
const SettingsPage = page(() => import('@/features/settings/SettingsPage'), 'SettingsPage');

// HashRouter: funciona en GitHub Pages sin configuración de servidor.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'sesion', element: <SessionPage /> },
      { path: 'examen/:week', element: <ExamPage /> },
      { path: 'ruta', element: <RoutePage /> },
      { path: 'ruta/:day', element: <DayPage /> },
      { path: 'repaso', element: <ReviewPage /> },
      { path: 'pronunciacion', element: <PronunciationPage /> },
      { path: 'estadisticas', element: <StatsPage /> },
      { path: 'vocabulario', element: <VocabularyPage /> },
      { path: 'frases', element: <PhrasesPage /> },
      { path: 'teoria', element: <TheoryPage /> },
      { path: 'canciones', element: <SongsPage /> },
      { path: 'recursos', element: <ResourcesPage /> },
      { path: 'ajustes', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];
