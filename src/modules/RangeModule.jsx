import { useMemo, useState } from 'react';
import {
  Banknote,
  CircleDollarSign,
  Fuel,
  Navigation,
  RotateCcw,
  Route,
  Save,
  Wallet,
} from 'lucide-react';
import {
  Card,
  CopyButton,
  EmptyState,
  NumberField,
  PageIntro,
  ProfilePicker,
  ResultSection,
  SegmentedControl,
  StatCard,
} from '../components/ui.jsx';
import { calculateRange } from '../lib/calculations.js';
import { formatMoney, formatNumber } from '../lib/format.js';
import { hasErrors, validateNumber } from '../lib/validation.js';

const DEFAULTS = { liters: '32', budget: '51', consumption: '7.5', price: '1.25' };

export default function RangeModule({ profiles, onSaveHistory, notify }) {
  const [values, setValues] = useState(DEFAULTS);
  const [mode, setMode] = useState('liters');
  const [profileId, setProfileId] = useState('');
  const [saved, setSaved] = useState(false);

  const errors = useMemo(
    () => ({
      liters: validateNumber(values.liters, { label: 'Наличните литри' }),
      budget: validateNumber(values.budget, { label: 'Бюджетът' }),
      consumption: validateNumber(values.consumption, { label: 'Средният разход', allowZero: false }),
      price: validateNumber(values.price, { label: 'Цената за литър', allowZero: false }),
    }),
    [values],
  );

  const result = useMemo(() => {
    if (hasErrors(errors)) return null;
    const number = (value) => Number(value.replace(',', '.'));
    return calculateRange({
      liters: number(values.liters),
      budget: number(values.budget),
      consumption: number(values.consumption),
      pricePerLiter: number(values.price),
    });
  }, [errors, values]);

  const shareText = result
    ? [
        '⛽ ГОРИВО+ • Пробег с налично гориво',
        `Налични литри: ${formatNumber(result.liters)} л`,
        `Наличен бюджет: ${formatMoney(result.budget)}`,
        `Среден разход: ${formatNumber(Number(values.consumption.replace(',', '.')))} л/100 км`,
        `Цена на литъра: ${formatMoney(Number(values.price.replace(',', '.')))}`,
        '',
        'Резултат:',
        `• Пробег с наличните литри: ${formatNumber(result.rangeFromLiters)} км`,
        `• Пробег с бюджета: ${formatNumber(result.rangeFromBudget)} км`,
        `• Стойност на наличните литри: ${formatMoney(result.valueOfLiters)}`,
        `• Литри за бюджета: ${formatNumber(result.litersFromBudget)} л`,
      ].join('\n')
    : '';

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleProfile = (id) => {
    setProfileId(id);
    const profile = profiles.find((item) => item.id === id);
    if (profile) setValues((current) => ({ ...current, consumption: String(profile.consumption) }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!result) return;
    const detail =
      mode === 'liters'
        ? `${formatNumber(result.rangeFromLiters)} км от ${formatNumber(result.liters)} л`
        : `${formatNumber(result.rangeFromBudget)} км от ${formatMoney(result.budget)}`;
    onSaveHistory({ type: 'range', title: 'Пробег с налично гориво', text: shareText, detail });
    setSaved(true);
    notify('Изчислението е запазено в историята.');
  };

  return (
    <>
      <PageIntro
        eyebrow="Калкулатор 03"
        title="Пробег с налично гориво"
        description="Разберете колко километра можете да изминете с останалото в резервоара гориво или с определен бюджет за зареждане."
        icon={Route}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Изберете база за изчислението</h2>
            <span className="chip">Стъпка 1</span>
          </div>

          <div className="mt-5">
            <SegmentedControl
              full
              value={mode}
              onChange={(value) => {
                setMode(value);
                setSaved(false);
              }}
              options={[
                { value: 'liters', label: 'Налични литри', icon: Fuel },
                { value: 'budget', label: 'Наличен бюджет', icon: Wallet },
              ]}
            />
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="range-liters"
                label="Налични литри в резервоара"
                value={values.liters}
                onChange={(value) => update('liters', value)}
                unit="л"
                placeholder="32"
                error={errors.liters}
              />
              <NumberField
                id="range-budget"
                label="Бюджет за гориво"
                value={values.budget}
                onChange={(value) => update('budget', value)}
                unit="€"
                placeholder="51"
                error={errors.budget}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="range-consumption"
                label="Среден разход"
                value={values.consumption}
                onChange={(value) => update('consumption', value)}
                unit="л/100"
                placeholder="7.5"
                error={errors.consumption}
              />
              <NumberField
                id="range-price"
                label="Цена за 1 литър"
                value={values.price}
                onChange={(value) => update('price', value)}
                unit="€"
                placeholder="1.25"
                error={errors.price}
              />
            </div>
            <ProfilePicker
              profiles={profiles}
              value={profileId}
              onChange={handleProfile}
              label="Или заредете разход от профил"
            />
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
              <div className="mt-5 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-slate-900">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  <Navigation size={15} />
                  {mode === 'liters' ? 'Пробег от наличните литри' : 'Пробег от наличния бюджет'}
                </div>
                <p className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {formatNumber(mode === 'liters' ? result.rangeFromLiters : result.rangeFromBudget)}
                  <span className="ml-2 text-lg font-bold text-slate-400 dark:text-slate-500">км</span>
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'liters'
                    ? `С ${formatNumber(result.liters)} л в резервоара при разход ${formatNumber(Number(values.consumption.replace(',', '.')))} л/100 км.`
                    : `С ${formatMoney(result.budget)} при цена ${formatMoney(Number(values.price.replace(',', '.')))} за литър.`}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <StatCard
                  label="Пробег от литрите"
                  value={formatNumber(result.rangeFromLiters)}
                  unit="км"
                  icon={Fuel}
                  tone="sky"
                />
                <StatCard
                  label="Пробег от бюджета"
                  value={formatNumber(result.rangeFromBudget)}
                  unit="км"
                  icon={Banknote}
                  tone="emerald"
                />
                <StatCard
                  label="Стойност на литрите"
                  value={formatMoney(result.valueOfLiters)}
                  icon={CircleDollarSign}
                  tone="indigo"
                />
                <StatCard
                  label="Литри за бюджета"
                  value={formatNumber(result.litersFromBudget)}
                  unit="л"
                  icon={Wallet}
                  tone="amber"
                />
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
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                  Стойностите се преизчисляват автоматично при всяка промяна. Копираният текст съдържа всички входни
                  данни и резултати.
                </p>
              </ResultSection>
            </>
          ) : (
            <div className="mt-5 flex flex-1 items-center">
              <EmptyState
                icon={Route}
                title="Очакваме коректни данни"
                description="Разходът и цената за литър трябва да са по-големи от 0. Количеството гориво и бюджетът не могат да бъдат отрицателни."
              />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
