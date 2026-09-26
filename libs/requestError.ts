import { AxiosError } from "axios";

export type RequestErrorKind = "offline" | "timeout" | "server" | "request";

/** Classifies a failed request so the UI can explain it in plain language. */
export const getRequestErrorKind = (error: unknown): RequestErrorKind => {
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "timeout";
    }
    if (!error.response) return "offline";
    if (error.response.status >= 500) return "server";
  }
  return "request";
};

/** A user-facing explanation of why a request failed. */
export const getRequestErrorMessage = (
  error: unknown,
  fallback = "Something went wrong while loading this page.",
): string => {
  switch (getRequestErrorKind(error)) {
    case "offline":
      return "We couldn't reach our servers. Check your internet connection and try again.";
    case "timeout":
      return "The request took too long. Check your connection and try again.";
    case "server":
      return "Our servers are having trouble right now. Please try again in a moment.";
    default: {
      const backendMessage =
        error instanceof AxiosError ? error.response?.data?.message : undefined;
      return typeof backendMessage === "string" && backendMessage.trim()
        ? backendMessage
        : fallback;
    }
  }
};

/**
 * Text-safe value for display: never renders "undefined", "null" or "NaN".
 * Use for any server field shown directly in the UI.
 */
export const showValue = (value: unknown, fallback = "—"): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && !Number.isFinite(value)) return fallback;
  const text = String(value).trim();
  if (!text || text === "undefined" || text === "null" || text === "NaN") {
    return fallback;
  }
  return text;
};
