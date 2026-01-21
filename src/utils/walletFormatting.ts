const CURRENCY_LOCALES: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-GB',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

export const formatCurrencyAmount = (amount: number, currency = 'USD') => {
  const locale = CURRENCY_LOCALES[currency] || 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    const symbol = CURRENCY_SYMBOLS[currency] || '';
    const formatted = Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
    return `${symbol}${formatted}`;
  }
};

export const formatShortDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getTransactionTypeLabel = (type?: string) => {
  switch (type) {
    case 'CREDIT':
      return 'Credit';
    case 'DEBIT':
      return 'Debit';
    default:
      return 'Transaction';
  }
};

export const getTransactionStatusLabel = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'PROCESSING':
      return 'Processing';
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'REVERSED':
      return 'Reversed';
    default:
      return 'Unknown';
  }
};
