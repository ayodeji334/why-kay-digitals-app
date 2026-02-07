/**
 * Format a numeric amount into a currency or shortened string.
 *
 * @param amount - The raw numeric amount
 * @param options - Formatting options
 *   - isDivideValue: divide amount by 100 (e.g. cents → dollars)
 *   - currency: ISO currency code (default "NGN")
 *   - decimalPlace: number of decimal places
 *   - shorten: whether to shorten large numbers (K, M, B)
 */
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

    return `${value.toFixed(decimalPlace ?? 1)}${suffix}`;
  }

  const locale = currency === "NGN" ? "en-NG" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimalPlace ?? 2,
  }).format(amount);
};

/**
 * Format a number with locale-specific grouping and decimals.
 *
 * @param amount - The raw numeric amount
 * @param options - Formatting options
 *   - isDivideValue: divide amount by 100
 *   - decimalPlace: number of decimal places
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

  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimalPlace ?? 3,
  }).format(amount);
};
