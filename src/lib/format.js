const numberFormatter = new Intl.NumberFormat('bg-BG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat('bg-BG', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const formatNumber = (value, digits = 2) => {
  if (!Number.isFinite(value)) return '—';
  return digits === 2
    ? numberFormatter.format(value)
    : new Intl.NumberFormat('bg-BG', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(value);
};

export const formatMoney = (value) => `${formatNumber(value)} €`;

export const BGN_PER_EUR = 1.95583;

/** Преобразува стари текстове с „лв.“ към евро (използва се при миграция на историята). */
export const convertBgnTextToEur = (text) => {
  if (!text) return text;
  return text.replace(/(\d+(?:[ \u00a0]\d{3})*(?:[.,]\d+)?)\s*лв\./g, (match, raw) => {
    const value = Number(raw.replace(/[ \u00a0]/g, '').replace(',', '.'));
    return Number.isFinite(value) ? `${formatNumber(value / BGN_PER_EUR)} €` : match;
  });
};
export const formatCompact = (value) => `${compactFormatter.format(value)}`;
export const formatLiters = (value) => `${formatNumber(value)} л`;

export const formatDate = (iso) =>
  new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
