/**
 * Identity (KYC) rules shared by every screen.
 *
 * - The user verifies with BVN **or** NIN first (→ Tier 2), then can add the
 *   other one (→ Tier 3). Order doesn't matter.
 * - `tier_level` is the overall state: TIER_1 unverified, TIER_2 one document,
 *   TIER_3+ fully verified (older accounts may be on TIER_4 from the old flow).
 * - Per-document status comes from `bvn_*` / `nin_*` fields.
 * - The selfie is part of the first verification, not a separate step, so it
 *   is never used to decide whether someone is verified.
 */

export type IdDocType = "bvn" | "nin";

export const ID_DOCS: Record<
  IdDocType,
  {
    /** Short name, e.g. "BVN". */
    label: string;
    /** Full name for headings and form labels. */
    fullName: string;
    /** Screen that collects the number (registered in Navigation.tsx). */
    route: "BVNVerification" | "IdentityVerification";
    usabilityPath: string;
    verifyPath: string;
    /** USSD hint shown under the input. */
    dialHint: string;
  }
> = {
  bvn: {
    label: "BVN",
    fullName: "Bank Verification Number",
    route: "BVNVerification",
    usabilityPath: "/kyc/check-bvn-usability",
    verifyPath: "/kyc/verify-bvn-selfie",
    dialHint: "Dial *565*0# to get your BVN",
  },
  nin: {
    label: "NIN",
    fullName: "National Identification Number",
    route: "IdentityVerification",
    usabilityPath: "/kyc/check-nin-usability",
    verifyPath: "/kyc/verify-nin",
    dialHint: "Dial *346# to get your NIN",
  },
};

export const otherDoc = (doc: IdDocType): IdDocType =>
  doc === "bvn" ? "nin" : "bvn";

/** "TIER_3" -> 3; anything missing or unrecognised -> 0. */
export const tierNumber = (tierLevel?: string | null): number => {
  const n = parseInt(String(tierLevel ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

/** Both documents verified (Tier 3 or above). */
export const isFullyVerified = (user: any): boolean =>
  tierNumber(user?.tier_level) >= 3;

export const isDocVerified = (user: any, doc: IdDocType): boolean =>
  user?.[`${doc}_verification_status`] === "VERIFIED" ||
  !!user?.[`${doc}_verified_at`];

/** At least one document verified (Tier 2+). */
export const hasVerifiedIdentity = (user: any): boolean =>
  isDocVerified(user, "bvn") || isDocVerified(user, "nin");

/** The document still to verify after the first one, or null. */
export const nextDocToVerify = (user: any): IdDocType | null => {
  const bvn = isDocVerified(user, "bvn");
  const nin = isDocVerified(user, "nin");
  if (bvn && !nin) return "nin";
  if (nin && !bvn) return "bvn";
  return null;
};

/** Latest bvn/nin verification time in ms, or null if neither is verified. */
export const latestVerificationTime = (user: any): number | null => {
  const times = [user?.bvn_verified_at, user?.nin_verified_at]
    .map(t => (t ? new Date(t).getTime() : NaN))
    .filter(Number.isFinite);
  return times.length ? Math.max(...times) : null;
};

/**
 * Reads `requires_selfie` from a usability response. A missing value is
 * treated as `true`: an extra selfie never blocks verification, a skipped one
 * can.
 */
export const readRequiresSelfie = (responseBody: any): boolean => {
  const value =
    responseBody?.data?.requires_selfie ?? responseBody?.requires_selfie;
  return value !== false;
};
