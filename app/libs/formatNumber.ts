export const formatAmount = (
  amount: number,
  isDivideValue: boolean = true,
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
): string => {
  if (isDivideValue) {
    return (amount / 100).toLocaleString();
  } else {
    return amount.toLocaleString();
  }
};
