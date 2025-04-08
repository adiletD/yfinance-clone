// Format currency values
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

// Format percentage values
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'percent', 
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value / 100);
}

// Format large numbers with B/M suffix
export function formatLargeNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else {
    return value.toFixed(2);
  }
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  // Remove currency symbol and commas
  const clean = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(clean);
}

// Parse percentage string to number
export function parsePercentage(value: string): number {
  // Remove percentage symbol
  const clean = value.replace(/[^0-9.-]+/g, '');
  return parseFloat(clean);
}

// Check if value is a valid number
export function isValidNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// Validate a currency input
export function validateCurrency(value: string): boolean {
  const regex = /^\$?\d+(\.\d{1,2})?$/;
  return regex.test(value.replace(/,/g, ''));
}

// Validate a percentage input
export function validatePercentage(value: string): boolean {
  const regex = /^-?\d+(\.\d{1,2})?%?$/;
  return regex.test(value.replace(/,/g, ''));
}

// Convert Yahoo's recommendation mean to text description
export function recommendationToText(mean: number): string {
  if (mean <= 1.5) {
    return "Strong Buy";
  } else if (mean <= 2.5) {
    return "Buy";
  } else if (mean <= 3.5) {
    return "Hold";
  } else if (mean <= 4.5) {
    return "Underperform";
  } else {
    return "Sell";
  }
}

// Get color based on change value
export function getChangeColor(change: number): string {
  return change > 0 ? "text-success" : change < 0 ? "text-danger" : "text-gray-500";
}

// Format ticker periods for display
export function formatPeriodName(period: string): string {
  switch (period) {
    case 'currentQtr':
      return 'Current Quarter';
    case 'nextQtr':
      return 'Next Quarter';
    case 'currentYear':
      return 'Current Year';
    case 'nextYear':
      return 'Next Year';
    case 'next5Years':
      return 'Next 5 Years (per annum)';
    case 'past5Years':
      return 'Past 5 Years (per annum)';
    default:
      return period;
  }
}

// Parse input value to number based on format
export function parseInputValue(value: string, isPercentage: boolean = false): number {
  if (isPercentage) {
    return parsePercentage(value);
  } else {
    return parseCurrency(value);
  }
}
