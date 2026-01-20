type Gender = "MALE" | "FEMALE" | "OTHER";
type Currency =
  | "PKR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD"
  | "CHF"
  | "CNY"
  | "INR"
  | "SGD";
type Country =
  | "PK"
  | "US"
  | "GB"
  | "CA"
  | "AU"
  | "DE"
  | "FR"
  | "JP"
  | "SG"
  | "IN"
  | "AE";
type Timezone =
  | "UTC"
  | "EST"
  | "CST"
  | "MST"
  | "PST"
  | "GMT"
  | "CET"
  | "JST"
  | "AEST"
  | "IST";

export const GenderOptions = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
} as const;

export const CurrencyOptions = {
  USD: "USD ($) - US Dollar",
  EUR: "EUR (€) - Euro",
  GBP: "GBP (£) - British Pound",
  JPY: "JPY (¥) - Japanese Yen",
  AUD: "AUD ($) - Australian Dollar",
  CAD: "CAD ($) - Canadian Dollar",
  CHF: "CHF (Fr) - Swiss Franc",
  CNY: "CNY (¥) - Chinese Yuan",
  INR: "INR (₹) - Indian Rupee",
  SGD: "SGD ($) - Singapore Dollar",
  PKR: "PKR (₨) - Pakistani Rupee",
} as const;

export const CountryOptions = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  SG: "Singapore",
  IN: "India",
  AE: "United Arab Emirates",
  PK: "Pakistan",
} as const;

export const TimezoneOptions = {
  UTC: "UTC (UTC+0) - Coordinated Universal Time",
  EST: "EST (UTC-5) - Eastern Standard Time",
  CST: "CST (UTC-6) - Central Standard Time",
  MST: "MST (UTC-7) - Mountain Standard Time",
  PST: "PST (UTC-8) - Pacific Standard Time",
  GMT: "GMT (UTC+0) - Greenwich Mean Time",
  CET: "CET (UTC+1) - Central European Time",
  JST: "JST (UTC+9) - Japan Standard Time",
  AEST: "AEST (UTC+10) - Australian Eastern Standard Time",
  IST: "IST (UTC+5:30) - India Standard Time",
} as const;

export const formatGender = (gender: Gender | null): string => {
  if (!gender) return "";
  return GenderOptions[gender] ?? "";
};

export const formatCurrency = (
  currency: Currency | null | undefined,
): string => {
  if (!currency) return "";
  return CurrencyOptions[currency] ?? "";
};

export const formatCountry = (country: Country | null | undefined): string => {
  if (!country) return "";
  return CountryOptions[country] ?? "";
};

export const formatTimezone = (
  timezone: Timezone | null | undefined,
): string => {
  if (!timezone) return "";
  return TimezoneOptions[timezone] ?? "";
};

export const getGenderValue = (displayName: string): Gender | undefined => {
  const entry = Object.entries(GenderOptions).find(
    ([_, value]) => value === displayName,
  );
  return entry ? (entry[0] as Gender) : undefined;
};

export const getCurrencyValue = (displayName: string): Currency | undefined => {
  const entry = Object.entries(CurrencyOptions).find(
    ([_, value]) => value === displayName,
  );
  return entry ? (entry[0] as Currency) : undefined;
};

export const getCountryValue = (displayName: string): Country | undefined => {
  const entry = Object.entries(CountryOptions).find(
    ([_, value]) => value === displayName,
  );
  return entry ? (entry[0] as Country) : undefined;
};

export const getTimezoneValue = (displayName: string): Timezone | undefined => {
  const entry = Object.entries(TimezoneOptions).find(
    ([_, value]) => value === displayName,
  );
  return entry ? (entry[0] as Timezone) : undefined;
};

// Timestamp formatting helper for consistent display in the UI.
// Returns a human-friendly relative time (e.g., "2 minutes ago") when possible,
// otherwise falls back to an ISO or empty string when input is invalid.
import { formatDistanceToNow, format } from "date-fns";

export const formatTimestamp = (input?: string | Date | null): string => {
  if (!input) return "";
  const dt = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(dt.getTime())) return "";
  try {
    // Use relative time for recent events
    return formatDistanceToNow(dt, { addSuffix: true });
  } catch {
    // Fallback to readable date
    return format(dt, "MMM d, yyyy 'at' h:mm a");
  }
};
