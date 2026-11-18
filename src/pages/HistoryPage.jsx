import { ClipboardList, Copy, Gauge, MapPin, Route, Scale, Trash2 } from 'lucide-react';
import { Card, EmptyState, PageIntro } from '../components/ui.jsx';
import { copyText } from '../lib/clipboard.js';
import { formatDate } from '../lib/format.js';

const typeMeta = {
  consumption: { icon: Gauge, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' },
  trip: { icon: MapPin, color: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400' },
  range: { icon: Route, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  comparison: { icon: Scale, color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
};

export default function HistoryPage({ history, onDelete, onClear, notify, onNavigate }) {
  const handleCopy = async (item) => {
    const ok = await copyText(item.text);
    notify(ok ? 'Текстът е копиран – готов е за споделяне.' : 'Копирането не бе успешно.', !ok);
  };

  const handleCopyAll = async () => {
    const all = history
      .slice()
      .reverse()
      .map((item) => `📅 ${formatDate(item.createdAt)} — ${item.title}\n${item.text}`)
      .join('\n\n──────────────\n\n');
    const ok = await copyText(all);
    notify(ok ? 'Цялата история е копирана.' : 'Копирането не бе успешно.', !ok);
  };

  return (
    <>
      <PageIntro
        eyebrow="Вашите данни"
        title="История на изчисленията"
        description="Всички запазени изчисления на едно място. Копирайте готов текст за чат или изтрийте записи, които вече не ви трябват."
        icon={ClipboardList}
        actions={
          history.length > 0 ? (
            <>
              <button type="button" onClick={handleCopyAll} className="btn-secondary">
                <Copy size={15} />
                Копирай всичко
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Сигурни ли сте, че искате да изтриете цялата история?')) {
                    onClear();
                    notify('Историята е изчистена.');
                  }
                }}
                className="btn-secondary !text-rose-600 dark:!text-rose-400"
              >
                <Trash2 size={15} />
                Изчисти
              </button>
            </>
          ) : null
        }
      />

      {history.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Историята е празна"
          description="Направете изчисление в някой от калкулаторите и натиснете „В историята“, за да го запазите тук."
          action={
            <button type="button" onClick={() => onNavigate('consumption')} className="btn-primary">
              <Gauge size={16} />
              Към калкулаторите
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {history.map((item) => {
            const meta = typeMeta[item.type] || typeMeta.consumption;
            const Icon = meta.icon;
            return (
              <Card key={item.id} className="flex flex-col p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-extrabold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(item.id);
                      notify('Записът е изтрит.');
                    }}
                    className="btn-ghost !p-2 hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-500/10"
                    aria-label="Изтрий записа"
                    title="Изтрий записа"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {item.detail && (
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                    {item.detail}
                  </p>
                )}

                <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-3 font-sans text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                  {item.text}
                </pre>

                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => handleCopy(item)} className="btn-secondary !py-2 !text-xs">
                    <Copy size={14} />
                    Копирай текста
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {history.length > 0 && (
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Общо запазени записи: {history.length}.
        </p>
      )}
    </>
  );
}
