import { useCallback, useEffect, useRef, useState } from 'react';
import { Car, ClipboardList, Gauge, MapPin, Route, Scale } from 'lucide-react';
import DashboardLayout from './components/DashboardLayout.jsx';
import { createId } from './lib/id.js';
import { convertBgnTextToEur } from './lib/format.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import ConsumptionModule from './modules/ConsumptionModule.jsx';
import TripCostModule from './modules/TripCostModule.jsx';
import RangeModule from './modules/RangeModule.jsx';
import ComparisonModule from './modules/ComparisonModule.jsx';
import ProfilesPage from './pages/ProfilesPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

const DEFAULT_PROFILES = [
  { id: 'seed-gradski', name: 'Градски автомобил', consumption: 7.8 },
  { id: 'seed-dizel', name: 'Дизел комби', consumption: 6.2 },
  { id: 'seed-hibrid', name: 'Хибрид', consumption: 4.9 },
];

const navGroups = [
  {
    title: 'Калкулатори',
    items: [
      { id: 'consumption', label: 'Разход на 100 км', icon: Gauge },
      { id: 'trip', label: 'Пътни разходи', icon: MapPin },
      { id: 'range', label: 'Пробег с налично гориво', icon: Route },
      { id: 'comparison', label: 'Сравнение на автомобили', icon: Scale },
    ],
  },
  {
    title: 'Моето',
    items: [
      { id: 'profiles', label: 'Профили на автомобили', icon: Car },
      { id: 'history', label: 'История на изчисленията', icon: ClipboardList },
    ],
  },
];

export default function App() {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [theme, setTheme] = useLocalStorage('gorivo-plus:theme', prefersDark ? 'dark' : 'light');
  const [profiles, setProfiles] = useLocalStorage('gorivo-plus:profiles', DEFAULT_PROFILES);
  const [history, setHistory] = useLocalStorage('gorivo-plus:history', []);
  const [activeView, setActiveView] = useState('consumption');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    setHistory((current) => {
      if (!current.some((item) => item.currency !== 'EUR')) return current;
      return current.map((item) =>
        item.currency === 'EUR'
          ? item
          : {
              ...item,
              currency: 'EUR',
              detail: convertBgnTextToEur(item.detail),
              text: convertBgnTextToEur(item.text),
            },
      );
    });
  }, [setHistory]);

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  const addHistory = useCallback(
    (entry) => {
      setHistory((current) => [
        { id: createId(), createdAt: new Date().toISOString(), currency: 'EUR', ...entry },
        ...current,
      ].slice(0, 100));
    },
    [setHistory],
  );

  const addProfile = useCallback(
    (payload) => setProfiles((current) => [...current, { id: createId(), ...payload }]),
    [setProfiles],
  );

  const updateProfile = useCallback(
    (id, payload) => setProfiles((current) => current.map((item) => (item.id === id ? { ...item, ...payload } : item))),
    [setProfiles],
  );

  const deleteProfile = useCallback(
    (id) => setProfiles((current) => current.filter((item) => item.id !== id)),
    [setProfiles],
  );

  const sharedProps = { profiles, onSaveHistory: addHistory, notify };

  const renderView = () => {
    switch (activeView) {
      case 'trip':
        return <TripCostModule {...sharedProps} />;
      case 'range':
        return <RangeModule {...sharedProps} />;
      case 'comparison':
        return <ComparisonModule {...sharedProps} />;
      case 'profiles':
        return (
          <ProfilesPage
            profiles={profiles}
            onCreate={addProfile}
            onUpdate={updateProfile}
            onDelete={deleteProfile}
            notify={notify}
            onNavigate={setActiveView}
          />
        );
      case 'history':
        return (
          <HistoryPage
            history={history}
            onDelete={(id) => setHistory((current) => current.filter((item) => item.id !== id))}
            onClear={() => setHistory([])}
            notify={notify}
            onNavigate={setActiveView}
          />
        );
      default:
        return <ConsumptionModule {...sharedProps} onSaveProfile={addProfile} />;
    }
  };

  return (
    <DashboardLayout
      navGroups={navGroups}
      activeView={activeView}
      onNavigate={setActiveView}
      theme={theme}
      onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
    >
      {renderView()}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-[60] flex max-w-[calc(100vw-2.5rem)] animate-toast-in items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-2xl ${
            toast.isError ? 'bg-rose-600' : 'bg-slate-900 dark:bg-indigo-600'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
            {toast.isError ? '!' : '✓'}
          </span>
          {toast.message}
        </div>
      )}
    </DashboardLayout>
  );
}
