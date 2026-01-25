import {
  Currency,
  DateFormat,
  CurrencyPosition,
  ThousandSeparator,
} from "@prisma/client";

interface FormatOptions {
  currency?: Currency;
  decimalPlaces?: number;
  currencyPosition?: CurrencyPosition;
  thousandSeparator?: ThousandSeparator;
  dateFormat?: DateFormat;
  compactNumbers?: boolean;
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "$",
  CAD: "$",
  CHF: "Fr",
  CNY: "¥",
  INR: "₹",
  SGD: "$",
  PKR: "₨",
};

/**
 * Format a numeric amount based on user preferences
 */
export function formatAmount(amount: number | string, options: FormatOptions) {
  const {
    currency = Currency.USD,
    decimalPlaces = 2,
    currencyPosition = CurrencyPosition.BEFORE,
    thousandSeparator = ThousandSeparator.COMMA,
    compactNumbers = false,
  } = options;

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "---";

  const absoluteNum = Math.abs(num);

  if (compactNumbers) {
    const formatter = new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    });
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = formatter.format(absoluteNum);
    return currencyPosition === CurrencyPosition.BEFORE
      ? `${symbol}${formatted}`
      : `${formatted} ${symbol}`;
  }

  // Handle decimal precision
  let formatted = absoluteNum.toFixed(decimalPlaces);

  // Handle thousand separator
  const parts = formatted.split(".");
  const separator =
    thousandSeparator === ThousandSeparator.COMMA
      ? ","
      : thousandSeparator === ThousandSeparator.SPACE
        ? " "
        : "";

  if (separator && parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  formatted = parts.join(".");

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  if (currencyPosition === CurrencyPosition.BEFORE) {
    return `${symbol}${formatted}`;
  } else {
    return `${formatted} ${symbol}`;
  }
}

/**
 * Format a date based on user preferences
 */
export function formatDate(
  date: Date | string,
  formatType: DateFormat = DateFormat.MM_DD_YYYY,
) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "---";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  switch (formatType) {
    case DateFormat.DD_MM_YYYY:
      return `${day}/${month}/${year}`;
    case DateFormat.YYYY_MM_DD:
      return `${year}-${month}-${day}`;
    case DateFormat.MM_DD_YYYY:
    default:
      return `${month}/${day}/${year}`;
  }
}
