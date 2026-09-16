// Fallback only — the real threshold now comes from the backend as
// walletSummary.high_value_withdrawal_threshold (see useSummaryDetail,
// consumed in WithdrawalScreen and forwarded to ConfirmTransactionScreen /
// StepUpVerificationModal). This constant exists purely so the UI has a
// sane number to show if that field is ever missing (e.g. summary hasn't
// loaded yet) — it is never the source of truth, and the backend enforces
// the real limit regardless of what this app sends either way.
export const HIGH_VALUE_WITHDRAWAL_THRESHOLD = 5_000_000;
