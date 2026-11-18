import { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CircleDollarSign,
  Fuel,
  MapPin,
  RotateCcw,
  Save,
  Users,
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
import { calculateTrip } from '../lib/calculations.js';
import { formatMoney, formatNumber } from '../lib/format.js';
import { hasErrors, validateNumber } from '../lib/validation.js';

const DEFAULTS = { distance: '180', consumption: '7.5', price: '1.25', passengers: '2' };

export default function TripCostModule({ profiles, onSaveHistory, notify }) {
  const [values, setValues] = useState(DEFAULTS);
  const [roundTrip, setRoundTrip] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [saved, setSaved] = useState(false);

  const errors = useMemo(
    () => ({
      distance: validateNumber(values.distance, { label: 'Разстоянието', allowZero: false }),
      consumption: validateNumber(values.consumption, { label: 'Средният разход' }),
      price: validateNumber(values.price, { label: 'Цената за литър' }),
      passengers: validateNumber(values.passengers, { label: 'Броят пътници', allowZero: false, integer: true, min: 1 }),
    }),
    [values],
  );

  const result = useMemo(() => {
    if (hasErrors(errors)) return null;
    const number = (value) => Number(value.replace(',', '.'));
    return calculateTrip({
      distance: number(values.distance),
      consumption: number(values.consumption),
      pricePerLiter: number(values.price),
      passengers: number(values.passengers),
      roundTrip,
    });
  }, [errors, values, roundTrip]);

  const shareText = result
    ? [
        '🚗 ГОРИВО+ • Пътни разходи',
        `Разстояние: ${formatNumber(Number(values.distance.replace(',', '.')))} км ${roundTrip ? '(отиване + връщане)' : '(само отиване)'}`,
        `Среден разход: ${formatNumber(Number(values.consumption.replace(',', '.')))} л/100 км`,
        `Цена на литъра: ${formatMoney(Number(values.price.replace(',', '.')))}`,
        `Пътници: ${result.passengers}`,
        '',
        'Резултат:',
        `• Общо изминато: ${formatNumber(result.traveledKm)} км`,
        `• Необходимо гориво: ${formatNumber(result.liters)} л`,
        `• Обща цена: ${formatMoney(result.totalCost)}`,
        `• На човек: ${formatMoney(result.perPerson)}`,
        `• Цена за 1 км: ${formatMoney(result.costPerKm)}`,
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
    onSaveHistory({
      type: 'trip',
      title: 'Пътни разходи',
      text: shareText,
      detail: `${formatMoney(result.totalCost)} общо • ${formatMoney(result.perPerson)} на човек`,
    });
    setSaved(true);
    notify('Изчислението е запазено в историята.');
  };

  return (
    <>
      <PageIntro
        eyebrow="Калкулатор 02"
        title="Пътни разходи"
        description="Пресметнете колко ще ви струва едно пътуване – от цената на горивото до сумата, която всеки пътник дължи."
        icon={MapPin}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Параметри на пътуването</h2>
            <span className="chip">Стъпка 1</span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="trip-distance"
                label="Разстояние (в една посока)"
                value={values.distance}
                onChange={(value) => update('distance', value)}
                unit="км"
                placeholder="180"
                error={errors.distance}
              />
              <NumberField
                id="trip-consumption"
                label="Среден разход"
                value={values.consumption}
                onChange={(value) => update('consumption', value)}
                unit="л/100"
                placeholder="7.5"
                error={errors.consumption}
              />
            </div>

            <div>
              <span className="field-label">Тип на пътуването</span>
              <SegmentedControl
                full
                value={roundTrip ? 'round' : 'one'}
                onChange={(value) => {
                  setRoundTrip(value === 'round');
                  setSaved(false);
                }}
                options={[
                  { value: 'one', label: 'Само отиване', icon: MapPin },
                  { value: 'round', label: 'Отиване + връщане ×2', icon: ArrowLeftRight },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="trip-price"
                label="Цена за 1 литър"
                value={values.price}
                onChange={(value) => update('price', value)}
                unit="€"
                placeholder="1.25"
                error={errors.price}
              />
              <NumberField
                id="trip-passengers"
                label="Брой пътници"
                value={values.passengers}
                onChange={(value) => update('passengers', value)}
                unit="души"
                placeholder="2"
                error={errors.passengers}
                hint="Разходът се разделя поравно."
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
              setRoundTrip(false);
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
                  label="Обща цена на пътуването"
                  value={formatMoney(result.totalCost)}
                  icon={CircleDollarSign}
                  tone="indigo"
                  highlight
                />
                <StatCard
                  label="На човек"
                  value={formatMoney(result.perPerson)}
                  icon={Users}
                  tone="emerald"
                  hint={`При ${result.passengers} ${result.passengers === 1 ? 'пътник' : 'пътника'}`}
                />
                <StatCard
                  label="Необходимо гориво"
                  value={formatNumber(result.liters)}
                  unit="л"
                  icon={Fuel}
                  tone="sky"
                />
                <StatCard
                  label="Цена за 1 км"
                  value={formatMoney(result.costPerKm)}
                  icon={MapPin}
                  tone="amber"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <ArrowLeftRight size={15} className="text-indigo-500" />
                Пътуването е общо
                <strong className="text-slate-800 dark:text-slate-100">{formatNumber(result.traveledKm)} км</strong>
                {roundTrip ? ' (отиване и връщане).' : ' (само в една посока).'}
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
                  Запазете изчислението, за да го намерите по-късно в историята, или копирайте готов текст за
                  споделяне с приятели и колеги.
                </p>
              </ResultSection>
            </>
          ) : (
            <div className="mt-5 flex flex-1 items-center">
              <EmptyState
                icon={MapPin}
                title="Очакваме коректни данни"
                description="Разстоянието и броят пътници трябва да са по-големи от 0, а разходът и цената – неотрицателни."
              />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
