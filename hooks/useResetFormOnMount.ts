import { useEffect, useCallback } from "react";
import { UseFormReset } from "react-hook-form";
import { useFocusEffect, useRoute } from "@react-navigation/native";

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

      if (params?.resetForm === true) {
        runReset();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params]),
  );
}
