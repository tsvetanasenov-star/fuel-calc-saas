/** Превръща въведен текст (включително със запетая) в число. */
export function toNumber(raw) {
  if (raw === '' || raw === null || raw === undefined) return NaN;
  const normalized = String(raw).replace(/\s/g, '').replace(',', '.');
  if (!/^-?\d*\.?\d*$/.test(normalized)) return NaN;
  return Number(normalized);
}

/**
 * Връща съобщение за грешка или null, когато стойността е валидна.
 * Защитава от отрицателни числа, деление на нула и празни полета.
 */
export function validateNumber(raw, { label, allowZero = true, integer = false, min = 0 } = {}) {
  const value = toNumber(raw);
  const name = label || 'Стойността';

  if (!Number.isFinite(value)) return `${name} трябва да бъде валидно число.`;
  if (value < 0) return `${name} не може да бъде отрицателна.`;
  if (!allowZero && value === 0) return `${name} трябва да бъде по-голяма от 0.`;
  if (min !== 0 && value < min) return `${name} трябва да бъде поне ${min}.`;
  if (integer && !Number.isInteger(value)) return `${name} трябва да бъде цяло число.`;

  return null;
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
