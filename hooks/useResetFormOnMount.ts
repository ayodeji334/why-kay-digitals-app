import { useEffect, useCallback } from "react";
import { UseFormReset } from "react-hook-form";
import { useFocusEffect, useRoute } from "@react-navigation/native";

/**
 * Resets a react-hook-form instance to its default values.
 *
 * - Always resets on initial mount.
 * - Only resets on screen focus if the previous screen passed
 *   `resetForm: true` as a navigation param (opt-in per navigation call).
 * - Accepts an optional `onReset` callback to clear local display state
 *   (e.g. displayAmount) that mirrors form fields but lives outside RHF.
 *
 * Usage:
 *   useResetFormOnMount(reset);
 *   useResetFormOnMount(reset, { amount: 0, asset_id: "" });
 *   useResetFormOnMount(reset, { amount: 0 }, () => setDisplayAmount(""));
 */
export function useResetFormOnMount<T extends Record<string, any>>(
  reset: UseFormReset<T>,
  defaultValues?: Partial<T>,
  onReset?: () => void,
) {
  const route = useRoute();

  const runReset = useCallback(() => {
    reset(defaultValues as any);
    onReset?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always reset on initial mount
  useEffect(() => {
    runReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only reset on focus if the navigating screen explicitly passed resetForm: true
  useFocusEffect(
    useCallback(() => {
      const params = route.params as Record<string, any> | undefined;
      console.log(params);
      if (params?.resetForm === true) {
        runReset();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params]),
  );
}
