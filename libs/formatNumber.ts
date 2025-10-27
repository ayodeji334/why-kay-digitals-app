export const formatAmount = (
  amount: number,
  isDivideValue: boolean = false,
  currency: string = "NGN",
  decimalPlace?: number,
): string => {
  if (isDivideValue) {
    amount = amount / 100;
  }

  const locale = currency === "NGN" ? "en-NG" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimalPlace ?? 3,
  }).format(amount);
};

export const formatNumber = (
  amount: number,
  isDivideValue: boolean = false,
  decimalPlace?: number,
): string => {
  if (isDivideValue) {
    amount = amount / 100;
  }

  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: decimalPlace ?? 3,
  }).format(amount);
};
