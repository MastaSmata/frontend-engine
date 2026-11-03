export function formatMoney(value, { locale = 'en-NG', currency = 'NGN', maximumFractionDigits = 0 } = {}) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits }).format(value);
}
