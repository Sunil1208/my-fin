export function formatInr(value: number, options?: { maximumFractionDigits?: number }) {
  const fractionDigits = options?.maximumFractionDigits ?? 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatSignedInr(value: number) {
  const prefix = value >= 0 ? '+' : '-';
  return `${prefix} ${formatInr(Math.abs(value))}`;
}

export function formatPercent(value: number, maximumFractionDigits = 1) {
  return `${value.toFixed(maximumFractionDigits)}%`;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}
