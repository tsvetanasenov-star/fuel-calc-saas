import { useState } from 'react';
import { ChevronRight, Menu, Moon, ShieldCheck, Sun, X } from 'lucide-react';

function SidebarContent({ navGroups, activeView, onNavigate, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pb-8 pt-6">
        <button
          type="button"
          onClick={() => onNavigate('consumption')}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white shadow-lg shadow-indigo-600/25">
            Г+
          </span>
          <span>
            <span className="block text-base font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
              Гориво<span className="text-indigo-600 dark:text-indigo-400">+</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              умен разход
            </span>
          </span>
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-ghost !p-2 lg:hidden" aria-label="Затвори менюто">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-600">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.id === activeView;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.9} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight size={15} className="opacity-70" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={17} />
          <span className="text-xs font-extrabold">Поверителност</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Профилите и историята се пазят само във вашия браузър.
        </p>
      </div>
    </>
  );
}

export default function DashboardLayout({
  navGroups,
  activeView,
  onNavigate,
  theme,
  onToggleTheme,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const allItems = navGroups.flatMap((group) => group.items);
  const current = allItems.find((item) => item.id === activeView) || allItems[0];
  const CurrentIcon = current.icon;

  const navigate = (id) => {
    onNavigate(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[268px] flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <SidebarContent navGroups={navGroups} activeView={activeView} onNavigate={navigate} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Затвори менюто"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] animate-fade-in flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <SidebarContent
              navGroups={navGroups}
              activeView={activeView}
              onNavigate={navigate}
              onClose={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-[268px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="btn-ghost !p-2 lg:hidden"
                aria-label="Отвори менюто"
              >
                <Menu size={20} />
              </button>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 lg:hidden">
                <CurrentIcon size={17} />
              </span>
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span className="hidden font-medium text-slate-400 sm:inline">Табло</span>
                <ChevronRight size={14} className="hidden text-slate-300 sm:inline dark:text-slate-600" />
                <span className="truncate font-bold text-slate-800 dark:text-slate-100">{current.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="chip hidden text-emerald-700 dark:text-emerald-400 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Без регистрация
              </span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="btn-secondary !h-10 !w-10 !p-0"
                aria-label={theme === 'dark' ? 'Превключи към светла тема' : 'Превключи към тъмна тема'}
                title={theme === 'dark' ? 'Светла тема' : 'Тъмна тема'}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div key={activeView} className="animate-fade-in">
            {children}
          </div>
          <footer className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 dark:border-slate-800 sm:flex-row">
            <span>© {new Date().getFullYear()} Гориво+ — всички изчисления са ориентировъчни.</span>
            <span>Създадено за по-разумни пътувания.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
