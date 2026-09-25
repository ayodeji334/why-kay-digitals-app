import { useCallback, useRef } from "react";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { PAYMENT_TIMEOUT_MS } from "../api/axios";
import { showError } from "../utlis/toast";

// RFC 4122 v4. Uses crypto.getRandomValues when the runtime has it; the key
// only needs to be unique, not secret, so Math.random is an acceptable fallback.
export const createIdempotencyKey = (): string => {
  const bytes = new Uint8Array(16);
  const cryptoObj = (globalThis as any).crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16,
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/**
 * True when we can't tell whether the server processed the request: no
 * response (timeout / network drop), 5xx, or 409 (same key still processing).
 */
export const isOutcomeUnknown = (error: unknown): boolean => {
  const status =
    error instanceof AxiosError ? error.response?.status : undefined;
  return status === undefined || status >= 500 || status === 409;
};

const UNKNOWN_OUTCOME_MESSAGE =
  "We couldn't confirm whether this went through. Check your transaction history before trying again.";

// Queries a money-moving request can change.
const MONEY_QUERY_KEYS = [
  ["fiat-balance"],
  ["transactions"],
  ["assets"],
  ["notifications"],
];

/**
 * One Idempotency-Key per money-moving attempt, so the backend can drop a
 * duplicate submit (double tap, retry after a timeout) instead of charging twice.
 *
 * The key is kept when the outcome is unknown — no response (timeout / network
 * drop), 5xx, or 409 (same key still processing) — so resubmitting reuses it and
 * is deduplicated. It is replaced after a definite answer (success or other 4xx,
 * e.g. wrong PIN) so the next attempt counts as a new request.
 */
export function useIdempotencyKey() {
  const queryClient = useQueryClient();
  const keyRef = useRef<string>(createIdempotencyKey());

  /** Axios config for the submit: the key plus the longer payment timeout. */
  const paymentRequestConfig = useCallback(
    () => ({
      headers: { "Idempotency-Key": keyRef.current },
      timeout: PAYMENT_TIMEOUT_MS,
    }),
    [],
  );

  const settleIdempotencyKey = useCallback((error?: unknown) => {
    if (error && isOutcomeUnknown(error)) return;
    keyRef.current = createIdempotencyKey();
  }, []);

  /**
   * If the submit's outcome is unknown, refetch balances/history and tell the
   * user to check before retrying (instead of a generic "try again"). Returns
   * true when it handled the error.
   */
  const handleUnknownOutcome = useCallback(
    (error: unknown): boolean => {
      if (!isOutcomeUnknown(error)) return false;
      MONEY_QUERY_KEYS.forEach(queryKey =>
        queryClient.invalidateQueries({ queryKey }),
      );
      showError(UNKNOWN_OUTCOME_MESSAGE);
      return true;
    },
    [queryClient],
  );

  return { paymentRequestConfig, settleIdempotencyKey, handleUnknownOutcome };
}
