export const formatAmount = (
  amount: number,
  isDivideValue: boolean = false,
  currency: string = "NGN",
  decimalPlace?: number,
  shorten: boolean = false,
): string => {
  if (isDivideValue) {
    amount = amount / 100;
  }

  let formattedAmount: string;

  if (shorten) {
    let suffix = "";
    let value = amount;

    if (Math.abs(amount) >= 1_000_000_000) {
      value = amount / 1_000_000_000;
      suffix = "B";
    } else if (Math.abs(amount) >= 1_000_000) {
      value = amount / 1_000_000;
      suffix = "M";
    } else if (Math.abs(amount) >= 1_000) {
      value = amount / 1_000;
      suffix = "K";
    }

    formattedAmount = value.toFixed(decimalPlace ?? 1) + suffix;
  } else {
    const locale = currency === "NGN" ? "en-NG" : "en-US";

    formattedAmount = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimalPlace ?? 2,
    }).format(amount);
  }

  return formattedAmount;
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
