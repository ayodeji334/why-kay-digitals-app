/**
 * Digits after the decimal point, including values in exponential form.
 *   12.5      -> 1
 *   0.000158  -> 6
 *   1.58e-7   -> 9   (0.000000158)
 */
const naturalDecimals = (value: number | string): number => {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num) || Number.isInteger(num)) return 0;

  const str = String(num);
  const [mantissa, exp] = str.split(/e/i);

  const fractionDigits = mantissa.split(".")[1]?.length ?? 0;

  if (exp === undefined) return fractionDigits;

  const exponent = Number(exp);
  // Negative exponent pushes digits right: 1.58e-7 -> 2 + 7 = 9
  return Math.max(0, fractionDigits - exponent);
};

export const formatAmount = (
  amount: number,
  {
    isDivideValue = false,
    currency = "NGN",
    decimalPlace,
    shorten = false,
  }: {
    isDivideValue?: boolean;
    currency?: string;
    decimalPlace?: number;
    shorten?: boolean;
  } = {},
): string => {
  if (isDivideValue) {
    amount = amount / 100;
  }

  if (shorten) {
    const absAmount = Math.abs(amount);
    let suffix = "";
    let value = amount;

    if (absAmount >= 1_000_000_000) {
      value = amount / 1_000_000_000;
      suffix = "B";
    } else if (absAmount >= 1_000_000) {
      value = amount / 1_000_000;
      suffix = "M";
    } else if (absAmount >= 1_000) {
      value = amount / 1_000;
      suffix = "K";
    }

    // Unspecified -> leave the divided value as-is (String drops trailing zeros)
    return decimalPlace === undefined
      ? `${value}${suffix}`
      : `${value.toFixed(decimalPlace)}${suffix}`;
  }

  // Unspecified -> however many decimals the number actually has.
  // Cap at 20: Intl throws a RangeError above that.
  const digits = Math.min(decimalPlace ?? naturalDecimals(amount), 20);

  const locale = currency === "NGN" ? "en-NG" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits, // must be set, or it clamps to the currency default
  }).format(amount);
};

/**
 * Format a number with locale-specific grouping and decimals.
 *
 * @param amount - The raw numeric amount
 * @param options - Formatting options
 *   - isDivideValue: divide amount by 100
 *   - decimalPlace: number of decimal places. Omit to keep the number's
 *     own precision (1234.5 -> "1,234.5", 1000 -> "1,000").
 */
export const formatNumber = (
  amount: number,
  {
    isDivideValue = false,
    decimalPlace,
  }: {
    isDivideValue?: boolean;
    decimalPlace?: number;
  } = {},
): string => {
  if (isDivideValue) {
    amount = amount / 100;
  }

  // Unspecified -> however many decimals the number actually has.
  // Cap at 20: Intl throws a RangeError above that.
  const digits = Math.min(decimalPlace ?? naturalDecimals(amount), 20);

  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits, // without this, Intl clamps to 3
  }).format(amount);
};
