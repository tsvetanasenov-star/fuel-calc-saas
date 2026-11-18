import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  CircleDollarSign,
  Droplets,
  Gauge,
  RotateCcw,
  Save,
  TrendingDown,
} from 'lucide-react';
import {
  Card,
  CopyButton,
  EmptyState,
  NumberField,
  PageIntro,
  ProfilePicker,
  ResultSection,
  StatCard,
} from '../components/ui.jsx';
import { calculateConsumption } from '../lib/calculations.js';
import { formatMoney, formatNumber } from '../lib/format.js';
import { hasErrors, validateNumber } from '../lib/validation.js';

const DEFAULTS = { km: '250', liters: '18', price: '1.25' };

export default function ConsumptionModule({ profiles, onSaveHistory, onSaveProfile, notify }) {
  const [values, setValues] = useState(DEFAULTS);
  const [profileId, setProfileId] = useState('');
  const [saved, setSaved] = useState(false);

  const errors = useMemo(
    () => ({
      km: validateNumber(values.km, { label: 'Изминатите километри', allowZero: false }),
      liters: validateNumber(values.liters, { label: 'Заредените литри', allowZero: false }),
      price: validateNumber(values.price, { label: 'Цената за литър' }),
    }),
    [values],
  );

  const result = useMemo(
    () =>
      hasErrors(errors)
        ? null
        : calculateConsumption({
            km: Number(values.km.replace(',', '.')),
            liters: Number(values.liters.replace(',', '.')),
            pricePerLiter: Number(values.price.replace(',', '.')),
          }),
    [errors, values],
  );

  const shareText = result
    ? [
        '🧮 ГОРИВО+ • Разход на 100 км',
        `Изминати: ${formatNumber(Number(values.km.replace(',', '.')))} км`,
        `Заредено: ${formatNumber(Number(values.liters.replace(',', '.')))} л`,
        `Цена на литъра: ${formatMoney(Number(values.price.replace(',', '.')))}`,
        '',
        'Резултат:',
        `• Среден разход: ${formatNumber(result.consumption)} л/100 км`,
        `• Цена за 1 км: ${formatMoney(result.costPerKm)}`,
        `• Цена за 100 км: ${formatMoney(result.costPer100Km)}`,
        `• Обща стойност на горивото: ${formatMoney(result.totalCost)}`,
      ].join('\n')
    : '';

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleProfile = (id) => {
    setProfileId(id);
    const profile = profiles.find((item) => item.id === id);
    if (profile) {
      setValues((current) => ({ ...current, liters: String(profile.consumption) }));
    }
    setSaved(false);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveHistory({
      type: 'consumption',
      title: 'Разход на 100 км',
      text: shareText,
      detail: `${formatNumber(result.consumption)} л/100 км • ${formatMoney(result.costPerKm)}/км`,
    });
    setSaved(true);
    notify('Изчислението е запазено в историята.');
  };

  const handleSaveProfile = () => {
    if (!result) return;
    const name = window.prompt('Име на новия профил:', `Автомобил ${profiles.length + 1}`);
    if (!name || !name.trim()) return;
    onSaveProfile({ name: name.trim(), consumption: result.consumption });
    notify('Профилът е запазен.');
  };

  return (
    <>
      <PageIntro
        eyebrow="Калкулатор 01"
        title="Разход на 100 км"
        description="Изчислете реален среден разход въз основа на изминатите километри и зареденото гориво. Вижте и цената на всеки изминат километър."
        icon={Gauge}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Входни данни</h2>
            <span className="chip">Стъпка 1</span>
          </div>

          <div className="mt-5 space-y-4">
            <NumberField
              id="distance"
              label="Изминати километри"
              value={values.km}
              onChange={(value) => update('km', value)}
              unit="км"
              placeholder="250"
              error={errors.km}
              hint="Попълнете разликата в километража между две зареждания."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="liters"
                label="Заредено гориво"
                value={values.liters}
                onChange={(value) => update('liters', value)}
                unit="л"
                placeholder="18"
                error={errors.liters}
              />
              <NumberField
                id="price"
                label="Цена за 1 литър"
                value={values.price}
                onChange={(value) => update('price', value)}
                unit="€"
                placeholder="1.25"
                error={errors.price}
              />
            </div>
            <ProfilePicker profiles={profiles} value={profileId} onChange={handleProfile} />
          </div>

          <button
            type="button"
            onClick={() => {
              setValues(DEFAULTS);
              setProfileId('');
              setSaved(false);
            }}
            className="btn-ghost mt-5 !px-0"
          >
            <RotateCcw size={14} />
            Възстанови примерните стойности
          </button>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Вашият резултат</h2>
            <span className="chip text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              В реално време
            </span>
          </div>

          {result ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <StatCard
                  label="Среден разход"
                  value={formatNumber(result.consumption)}
                  unit="л/100 км"
                  icon={Gauge}
                  tone="indigo"
                  highlight
                />
                <StatCard
                  label="Цена за 1 км"
                  value={formatMoney(result.costPerKm)}
                  icon={CircleDollarSign}
                  tone="emerald"
                />
                <StatCard
                  label="Обща стойност"
                  value={formatMoney(result.totalCost)}
                  icon={BadgeCheck}
                  tone="sky"
                  hint="За зареденото количество гориво"
                />
                <StatCard
                  label="Цена за 100 км"
                  value={formatMoney(result.costPer100Km)}
                  icon={TrendingDown}
                  tone="amber"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <Droplets size={15} className="text-indigo-500" />
                Горивото ви струва средно
                <strong className="text-slate-800 dark:text-slate-100">
                  {formatMoney(result.costPerKm)} на километър
                </strong>
                (≈ {formatNumber(result.litersPerKm, 3)} л/км).
              </div>

              <ResultSection
                title="Запазете и споделете резултата"
                actions={
                  <>
                    <CopyButton
                      text={shareText}
                      onCopied={(ok) =>
                        notify(ok ? 'Текстът е копиран – готов е за споделяне.' : 'Копирането не бе успешно.', !ok)
                      }
                    />
                    <button type="button" onClick={handleSave} className="btn-primary !py-2 !text-xs" disabled={saved}>
                      <Save size={14} />
                      {saved ? 'Запазено' : 'В историята'}
                    </button>
                  </>
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Запазете изчислението, за да го намерите по-късно в историята, или копирайте готов текст за чат.
                  </p>
                  <button type="button" onClick={handleSaveProfile} className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                    + Запази разхода като профил
                  </button>
                </div>
              </ResultSection>
            </>
          ) : (
            <div className="mt-5 flex flex-1 items-center">
              <EmptyState
                icon={Gauge}
                title="Очакваме коректни данни"
                description="Попълнете положителни стойности за километри и литри. Цената не може да бъде отрицателна."
              />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
