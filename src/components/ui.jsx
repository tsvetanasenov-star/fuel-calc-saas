import { AlertCircle, Check, ChevronDown, Copy, Inbox } from 'lucide-react';
import { copyText } from '../lib/clipboard.js';

export function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function PageIntro({ eyebrow, title, description, icon: Icon, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="mt-0.5 hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 sm:flex">
            <Icon size={23} strokeWidth={2.1} />
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function NumberField({ id, label, value, onChange, unit, placeholder, error, hint }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`field-input ${unit ? 'pr-16' : ''} ${error ? 'field-input-error' : ''}`}
          aria-invalid={Boolean(error)}
        />
        {unit && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-xs font-bold text-slate-400 dark:text-slate-500">
            {unit}
          </span>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({ id, label, value, onChange, placeholder, error }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`field-input ${error ? 'field-input-error' : ''}`}
      />
      {error && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({ id, label, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-input cursor-pointer appearance-none pr-10"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute inset-y-0 right-3.5 my-auto text-slate-400"
        />
      </div>
    </div>
  );
}

export function ProfilePicker({ profiles, value, onChange, label = 'Зареден профил', id = 'profile-picker' }) {
  return (
    <SelectField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      options={[
        { value: '', label: 'Без профил – въведете разход ръчно' },
        ...profiles.map((profile) => ({ value: profile.id, label: profile.name })),
      ]}
    />
  );
}

export function SegmentedControl({ options, value, onChange, full = false }) {
  return (
    <div
      className={`inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 ${full ? 'w-full' : ''}`}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition sm:text-sm ${
              active
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {Icon && <Icon size={15} />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const toneStyles = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
};

export function StatCard({ label, value, unit, icon: Icon, tone = 'indigo', hint, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition sm:p-5 ${
        highlight
          ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-slate-900'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {Icon && (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-[26px]">
        {value}
        {unit && <span className="ml-1.5 text-sm font-bold text-slate-400 dark:text-slate-500">{unit}</span>}
      </p>
      {hint && <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

export function ResultSection({ title, children, actions }) {
  return (
    <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon size={26} />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function CopyButton({ text, onCopied, disabled, label = 'Копирай за споделяне' }) {
  const handleCopy = async () => {
    const copied = await copyText(text);
    onCopied?.(copied);
  };

  return (
    <button type="button" onClick={handleCopy} disabled={disabled} className="btn-secondary !py-2 !text-xs">
      <Copy size={14} />
      {label}
    </button>
  );
}

export function SavedBadge() {
  return (
    <span className="chip text-emerald-700 dark:text-emerald-400">
      <Check size={12} strokeWidth={3} />
      Запазено
    </span>
  );
}
