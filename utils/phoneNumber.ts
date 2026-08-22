const NIGERIA_COUNTRY_CODE = "234";

// Nigerian mobile subscriber numbers are 10 digits (after the leading 0
// or 234 is stripped) and start with 7, 8, or 9 — the block used by
// MTN/Glo/Airtel/9mobile. Extend this if you need to support a range
// outside that (e.g. newly licensed operators).
const NIGERIAN_SUBSCRIBER_REGEX = /^[789]\d{9}$/;

/**
 * Normalizes a Nigerian phone number into exactly what the backend
 * expects: "234" + 10-digit subscriber number, with no "+" and no
 * leading zero. Accepts the common shapes people actually type:
 *
 *   "08031234567"      -> "2348031234567"
 *   "8031234567"       -> "2348031234567"
 *   "+2348031234567"   -> "2348031234567"
 *   "234 803 123 4567" -> "2348031234567"
 *
 * Returns null if the input isn't a valid Nigerian mobile number —
 * callers should treat a null return as a validation failure, not fall
 * back to sending the raw input.
 */
export function normalizeNigerianPhoneNumber(rawInput: string): string | null {
  const digitsOnly = rawInput.replace(/\D/g, "");

  let subscriberNumber: string | null = null;

  if (digitsOnly.startsWith(NIGERIA_COUNTRY_CODE) && digitsOnly.length === 13) {
    subscriberNumber = digitsOnly.slice(3);
  } else if (digitsOnly.startsWith("0") && digitsOnly.length === 11) {
    subscriberNumber = digitsOnly.slice(1);
  } else if (digitsOnly.length === 10) {
    subscriberNumber = digitsOnly;
  }

  if (!subscriberNumber || !NIGERIAN_SUBSCRIBER_REGEX.test(subscriberNumber)) {
    return null;
  }

  return `${NIGERIA_COUNTRY_CODE}${subscriberNumber}`;
}

/** True only for input that normalizes to a valid Nigerian mobile number. */
export function isValidNigerianPhoneNumber(rawInput: string): boolean {
  return normalizeNigerianPhoneNumber(rawInput) !== null;
}

/** Renders a normalized "234XXXXXXXXXX" value in a friendlier local form for display: "0803 123 4567". */
export function formatNigerianPhoneForDisplay(normalized: string): string {
  if (
    !normalized.startsWith(NIGERIA_COUNTRY_CODE) ||
    normalized.length !== 13
  ) {
    return normalized;
  }

  const subscriberNumber = normalized.slice(3);
  return `0${subscriberNumber.slice(0, 3)} ${subscriberNumber.slice(
    3,
    6,
  )} ${subscriberNumber.slice(6)}`;
}

/** Masks a normalized "234XXXXXXXXXX" value for display, e.g. "234 803 *** 4567". */
export function maskNigerianPhoneNumber(normalized: string): string {
  if (!normalized || normalized.length !== 13) return normalized;

  const subscriberNumber = normalized.slice(3); // 10 digits
  const visibleStart = subscriberNumber.slice(0, 3);
  const visibleEnd = subscriberNumber.slice(-3);

  return `234 ${visibleStart} *** ${visibleEnd}`;
}
