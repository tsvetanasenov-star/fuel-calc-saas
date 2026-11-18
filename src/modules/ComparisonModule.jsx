import { useMemo, useState } from 'react';
import { RotateCcw, Save, Scale, Trophy } from 'lucide-react';
import {
  Card,
  CopyButton,
  EmptyState,
  NumberField,
  PageIntro,
  ProfilePicker,
  ResultSection,
  TextField,
} from '../components/ui.jsx';
import { calculateComparison } from '../lib/calculations.js';
import { formatMoney, formatNumber } from '../lib/format.js';
import { hasErrors, validateNumber } from '../lib/validation.js';

const DEFAULTS = {
  annualKm: '15000',
  a: { name: 'Бензин А95', consumption: '8.2', price: '2.55' },
  b: { name: 'Дизел', consumption: '6.1', price: '2.30' },
};

export default function ComparisonModule({ profiles, onSaveHistory, notify }) {
  const [annualKm, setAnnualKm] = useState(DEFAULTS.annualKm);
  const [a, setA] = useState(DEFAULTS.a);
  const [b, setB] = useState(DEFAULTS.b);
  const [profileA, setProfileA] = useState('');
  const [profileB, setProfileB] = useState('');
  const [saved, setSaved] = useState(false);

  const errors = useMemo(
    () => ({
      annualKm: validateNumber(annualKm, { label: 'Годишните километри', allowZero: false }),
      aConsumption: validateNumber(a.consumption, { label: 'Разходът на първото превозно средство' }),
      aPrice: validateNumber(a.price, { label: 'Цената на първото гориво' }),
      bConsumption: validateNumber(b.consumption, { label: 'Разходът на второто превозно средство' }),
      bPrice: validateNumber(b.price, { label: 'Цената на второто гориво' }),
    }),
    [annualKm, a, b],
  );

  const result = useMemo(() => {
    if (hasErrors(errors)) return null;
    const number = (value) => Number(value.replace(',', '.'));
    return calculateComparison({
      annualKm: number(annualKm),
      a: { consumption: number(a.consumption), price: number(a.price) },
      b: { consumption: number(b.consumption), price: number(b.price) },
    });
  }, [errors, annualKm, a, b]);

  const nameA = a.name.trim() || 'Вариант А';
  const nameB = b.name.trim() || 'Вариант Б';

  const shareText = result
    ? [
        '⚖️ ГОРИВО+ • Сравнение на разходите',
        `Годишен пробег: ${formatNumber(Number(annualKm.replace(',', '.')))} км`,
        `${nameA}: ${formatNumber(Number(a.consumption.replace(',', '.')))} л/100 км × ${formatMoney(Number(a.price.replace(',', '.')))}/л`,
        `${nameB}: ${formatNumber(Number(b.consumption.replace(',', '.')))} л/100 км × ${formatMoney(Number(b.price.replace(',', '.')))}/л`,
        '',
        'Резултат:',
        `• ${nameA}: ${formatMoney(result.a.annual)} годишно / ${formatMoney(result.a.monthly)} месечно`,
        `• ${nameB}: ${formatMoney(result.b.annual)} годишно / ${formatMoney(result.b.monthly)} месечно`,
        result.cheaper
          ? `• По-икономично: ${result.cheaperKey === 'a' ? nameA : nameB} – спестени ${formatMoney(result.difference)} годишно (${formatNumber(result.percent, 1)}%)`
          : '• Двата варианта са с еднакъв разход.',
      ].join('\n')
    : '';

  const updateSide = (side, field, value) => {
    (side === 'a' ? setA : setB)((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleProfile = (side, id) => {
    const setSelected = side === 'a' ? setProfileA : setProfileB;
    setSelected(id);
    const profile = profiles.find((item) => item.id === id);
    if (profile) {
      (side === 'a' ? setA : setB)((current) => ({
        ...current,
        consumption: String(profile.consumption),
        name: current.name ? current.name : profile.name,
      }));
    }
    setSaved(false);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveHistory({
      type: 'comparison',
      title: 'Сравнение на автомобили',
      text: shareText,
      detail: result.cheaper
        ? `${result.cheaperKey === 'a' ? nameA : nameB} спестява ${formatMoney(result.difference)}/година`
        : 'Двата варианта са с еднакъв разход',
    });
    setSaved(true);
    notify('Изчислението е запазено в историята.');
  };

  const renderSide = (side, data, errorKeys, profileValue, onProfileChange) => {
    const isA = side === 'a';
    return (
      <div
        className={`rounded-2xl border p-4 ${
          isA
            ? 'border-indigo-200 bg-indigo-50/40 dark:border-indigo-500/25 dark:bg-indigo-500/5'
            : 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/25 dark:bg-emerald-500/5'
        }`}
      >
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white ${
              isA ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}
          >
            {isA ? 'А' : 'Б'}
          </span>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {isA ? 'Първи вариант' : 'Втори вариант'}
          </h3>
        </div>
        <div className="space-y-3">
          <TextField
            id={`compare-name-${side}`}
            label="Име / гориво"
            value={data.name}
            onChange={(value) => updateSide(side, 'name', value)}
            placeholder={isA ? 'Бензин А95' : 'Дизел'}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id={`compare-consumption-${side}`}
              label="Разход"
              value={data.consumption}
              onChange={(value) => updateSide(side, 'consumption', value)}
              unit="л/100"
              placeholder="7.5"
              error={errors[errorKeys.consumption]}
            />
            <NumberField
              id={`compare-price-${side}`}
              label="Цена/л"
              value={data.price}
              onChange={(value) => updateSide(side, 'price', value)}
              unit="лв."
              placeholder="2.45"
              error={errors[errorKeys.price]}
            />
          </div>
          <ProfilePicker
            id={`compare-profile-${side}`}
            profiles={profiles}
            value={profileValue}
            onChange={onProfileChange}
            label="Профил (по избор)"
          />
        </div>
      </div>
    );
  };

  const costBar = (value, max) => (max > 0 ? `${Math.max((value / max) * 100, 4)}%` : '0%');

  return (
    <>
      <PageIntro
        eyebrow="Калкулатор 04"
        title="Сравнение на автомобили / горива"
        description="Съпоставете два варианта на годишна база и вижте кой реално ви струва по-малко – включително месечната разлика и спестените средства."
        icon={Scale}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Входни данни</h2>
            <span className="chip">Стъпка 1</span>
          </div>

          <div className="mt-5">
            <NumberField
              id="annual-km"
              label="Годишен пробег"
              value={annualKm}
              onChange={(value) => {
                setAnnualKm(value);
                setSaved(false);
              }}
              unit="км/год."
              placeholder="15000"
              error={errors.annualKm}
              hint="Средно колко километра изминавате за една година."
            />
          </div>

          <div className="mt-5 space-y-4">
            {renderSide(
              'a',
              a,
              { consumption: 'aConsumption', price: 'aPrice' },
              profileA,
              (id) => handleProfile('a', id),
            )}
            {renderSide(
              'b',
              b,
              { consumption: 'bConsumption', price: 'bPrice' },
              profileB,
              (id) => handleProfile('b', id),
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setAnnualKm(DEFAULTS.annualKm);
              setA(DEFAULTS.a);
              setB(DEFAULTS.b);
              setProfileA('');
              setProfileB('');
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
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Сравнение на разходите</h2>
            <span className="chip text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              В реално време
            </span>
          </div>

          {result ? (
            <>
              <div className="mt-5 space-y-4">
                {[
                  { key: 'a', data: result.a, name: nameA, color: 'bg-indigo-500', isA: true },
                  { key: 'b', data: result.b, name: nameB, color: 'bg-emerald-500', isA: false },
                ].map((option) => (
                  <div key={option.key} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.color}`} />
                          <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">{option.name}</p>
                          {result.cheaperKey === (option.isA ? 'a' : 'b') && (
                            <Trophy size={14} className="shrink-0 text-amber-500" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {formatNumber(option.data.liters)} л гориво годишно
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                          {formatMoney(option.data.annual)}
                        </p>
                        <p className="text-[11px] text-slate-400">годишно</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${option.color} transition-all duration-500`}
                        style={{ width: costBar(option.data.annual, result.max) }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>Месечно: {formatMoney(option.data.monthly)}</span>
                      <span>Разход: {formatNumber(Number((option.isA ? a : b).consumption.replace(',', '.')))} л/100 км</span>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`mt-4 rounded-2xl border p-4 ${
                  result.cheaper
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  <Trophy size={15} />
                  {result.cheaper ? 'По-икономичният избор' : 'Еднакъв разход'}
                </div>
                <p className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                  {result.cheaper
                    ? `${result.cheaperKey === 'a' ? nameA : nameB} спестява ${formatMoney(result.difference)} годишно`
                    : 'Двата варианта струват еднакво'}
                </p>
                {result.cheaper && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Това е с {formatNumber(result.percent, 1)}% по-малко разходи (~ {formatMoney(result.monthlyDifference)} на месец).
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Годишна разлика</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatMoney(result.difference)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Месечна разлика</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatMoney(result.monthlyDifference)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Разлика в проценти</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatNumber(result.percent, 1)}%
                  </p>
                </div>
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
                  Сравнението включва само разхода на гориво. Реалните разходи могат да включват поддръжка, застраховка и
                  техническа поддръжка.
                </p>
              </ResultSection>
            </>
          ) : (
            <div className="mt-5 flex flex-1 items-center">
              <EmptyState
                icon={Scale}
                title="Очакваме коректни данни"
                description="Годишният пробег трябва да е по-голям от 0. Разходите и цените не могат да бъдат отрицателни."
              />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
