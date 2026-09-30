/**
 * Features that are unavailable on some account tiers. This is the single
 * source of truth for tier restrictions in the app; the backend must enforce
 * the same rules, since anything client-side can be bypassed.
 */
export type RestrictedFeature =
  | "buy_crypto"
  | "sell_crypto"
  | "withdraw_crypto"
  | "deposit_fiat"
  | "bill_payments"
  | "gift_cards"
  | "swap_crypto"
  | "transfer";

const TIER_RESTRICTIONS: Record<string, RestrictedFeature[]> = {
  TIER_1: [
    "buy_crypto",
    "sell_crypto",
    "withdraw_crypto",
    "deposit_fiat",
    "bill_payments",
    "gift_cards",
    "swap_crypto",
    "transfer",
  ],
};

/** How each feature is named in upgrade prompts ("… isn't available"). */
export const FEATURE_LABELS: Record<RestrictedFeature, string> = {
  buy_crypto: "Buying crypto",
  sell_crypto: "Selling crypto",
  withdraw_crypto: "Withdrawing crypto",
  deposit_fiat: "Depositing money",
  bill_payments: "Bill payments",
  gift_cards: "Buying gift cards",
  swap_crypto: "Swapping crypto",
  transfer: "Making transfers",
};

export const isFeatureRestricted = (
  tierLevel: string | null | undefined,
  feature: RestrictedFeature,
): boolean =>
  !!tierLevel && (TIER_RESTRICTIONS[tierLevel] ?? []).includes(feature);

export const getRestrictionMessage = (feature: RestrictedFeature): string =>
  `${FEATURE_LABELS[feature]} isn't available on your current account tier. Upgrade your account to unlock it.`;
