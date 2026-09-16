import { useEffect } from "react";

/**
 * Blocks hardware back / swipe-back / header-back out of a screen, while
 * still letting the screen navigate itself away (replace, reset, explicit
 * goBack calls it triggers on purpose aren't distinguishable from a user
 * gesture at this level, so callers that need an explicit "abandon" escape
 * hatch should use reset/replace rather than goBack).
 *
 * Used by the device-verification screens: the challenge shouldn't be
 * escapable back into the login form by accident, only via the explicit
 * "Use a different account" action (which resets the stack instead of
 * going back).
 */
export function useBlockGoBack(navigation: any, active: boolean = true) {
  useEffect(() => {
    if (!active) return;

    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (e.data.action.type !== "GO_BACK") return;
      e.preventDefault();
    });

    return unsubscribe;
  }, [navigation, active]);
}
