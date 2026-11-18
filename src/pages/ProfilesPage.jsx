import { useMemo, useState } from 'react';
import { Car, Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Card, EmptyState, NumberField, PageIntro, TextField } from '../components/ui.jsx';
import { formatNumber } from '../lib/format.js';
import { hasErrors, validateNumber } from '../lib/validation.js';

export default function ProfilesPage({ profiles, onCreate, onUpdate, onDelete, notify, onNavigate }) {
  const [name, setName] = useState('');
  const [consumption, setConsumption] = useState('');
  const [editingId, setEditingId] = useState(null);

  const errors = useMemo(
    () => ({
      name: name.trim().length < 2 ? 'Въведете име с поне 2 символа.' : null,
      consumption: validateNumber(consumption, { label: 'Разходът', allowZero: false }),
    }),
    [name, consumption],
  );

  const reset = () => {
    setName('');
    setConsumption('');
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hasErrors(errors)) return;

    const payload = { name: name.trim(), consumption: Number(consumption.replace(',', '.')) };
    if (editingId) {
      onUpdate(editingId, payload);
      notify('Профилът е обновен.');
    } else {
      onCreate(payload);
      notify('Профилът е запазен.');
    }
    reset();
  };

  const handleEdit = (profile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setConsumption(String(profile.consumption));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageIntro
        eyebrow="Вашите данни"
        title="Профили на автомобили"
        description="Запазете стандартния разход на вашите автомобили или видове гориво и ги зареждайте с едно кликване във всички калкулатори."
        icon={Car}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card className="h-fit p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {editingId ? 'Редактиране на профил' : 'Нов профил'}
            </h2>
            {editingId && (
              <button type="button" onClick={reset} className="btn-ghost !p-1.5" aria-label="Отказ">
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <TextField
              id="profile-name"
              label="Име на автомобила / горивото"
              value={name}
              onChange={setName}
              placeholder="Напр. Градски автомобил"
              error={errors.name}
            />
            <NumberField
              id="profile-consumption"
              label="Стандартен разход"
              value={consumption}
              onChange={setConsumption}
              unit="л/100 км"
              placeholder="7.5"
              error={errors.consumption}
              hint="Използвайте средна стойност от реални зареждания за по-точен резултат."
            />
            <button type="submit" className="btn-primary w-full">
              {editingId ? <Check size={16} /> : <Plus size={16} />}
              {editingId ? 'Запази промените' : 'Добави профил'}
            </button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
            Профилите се съхраняват локално във вашия браузър и не се изпращат никъде.
          </p>
        </Card>

        <div>
          {profiles.length === 0 ? (
            <EmptyState
              icon={Car}
              title="Все още няма запазени профили"
              description="Добавете първия си автомобил, за да зареждате разхода му автоматично във всеки калкулатор."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {profiles.map((profile) => (
                <Card key={profile.id} className="group p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Car size={19} />
                    </span>
                    <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleEdit(profile)}
                        className="btn-ghost !p-2"
                        aria-label={`Редактирай ${profile.name}`}
                        title="Редактирай"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(profile.id);
                          notify('Профилът е изтрит.');
                        }}
                        className="btn-ghost !p-2 hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-500/10"
                        aria-label={`Изтрий ${profile.name}`}
                        title="Изтрий"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-3 truncate text-sm font-extrabold text-slate-900 dark:text-white">
                    {profile.name}
                  </h3>
                  <p className="mt-1 text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                    {formatNumber(profile.consumption)}
                    <span className="ml-1.5 text-xs font-bold text-slate-400">л/100 км</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('consumption')}
                    className="mt-3 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                  >
                    Отвори калкулатора →
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
