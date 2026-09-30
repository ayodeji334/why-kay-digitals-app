import { useEffect, useState } from "react";
import useAxios from "./useAxios";

const DEBOUNCE_MS = 500;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type Options = {
  /** The username field's current value. */
  username: string | undefined;
  /** The user's existing username; always treated as available (edit flows). */
  currentUsername?: string | null;
  /** react-hook-form's setError / clearErrors for the "username" field. */
  setError: (
    name: "username",
    error: { type: string; message: string },
  ) => void;
  clearErrors: (name: "username") => void;
  /** Shorter names aren't checked (the schema's min length). */
  minLength?: number;
};

/**
 * Debounced "is this username free?" check against /auth/check-username —
 * the same behaviour as registration. `isBlocking` is true while a check is
 * pending or in flight, or when the name is taken / couldn't be verified, so
 * forms can disable submit until the typed name is confirmed available.
 */
export function useUsernameAvailability({
  username,
  currentUsername,
  setError,
  clearErrors,
  minLength = 5,
}: Options) {
  const { apiGet } = useAxios();
  const trimmed = username?.trim() ?? "";
  const debounced = useDebounce(trimmed, DEBOUNCE_MS);

  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<{
    available?: boolean;
    message?: string;
  }>({});

  const isUnchanged =
    !!currentUsername &&
    trimmed.toLowerCase() === currentUsername.trim().toLowerCase();

  useEffect(() => {
    if (!debounced || debounced.length < minLength || isUnchanged) {
      setStatus({});
      setIsChecking(false);
      // Back to their own name: drop any "already taken" error from earlier.
      if (isUnchanged) clearErrors("username");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setIsChecking(true);

    apiGet(`/auth/check-username?username=${encodeURIComponent(debounced)}`, {
      signal: controller.signal,
    })
      .then(res => {
        if (cancelled) return;
        const available = res.data.available;
        setStatus({ available, message: res.data.message });
        if (available === false) {
          setError("username", {
            type: "manual",
            message: "Username is already taken",
          });
        } else {
          clearErrors("username");
        }
      })
      .catch(err => {
        if (
          cancelled ||
          err.name === "CanceledError" ||
          err.name === "AbortError"
        ) {
          return;
        }
        setStatus({
          available: false,
          message: "Couldn't check that username",
        });
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debounced, isUnchanged, minLength, apiGet, setError, clearErrors]);

  // Typed but not yet checked (inside the debounce window).
  const isPending =
    !isUnchanged && trimmed.length >= minLength && trimmed !== debounced;

  return {
    isChecking: isChecking || isPending,
    status: isUnchanged ? {} : status,
    isBlocking:
      !isUnchanged && (isChecking || isPending || status.available === false),
  };
}
