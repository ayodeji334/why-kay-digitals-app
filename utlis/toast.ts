import { useCallback } from "react";
import { ToastType, useCustomToast, pushToast } from "../hooks/useToast";

export const useToastHelpers = () => {
  const showToast = useCustomToast();

  const showSuccess = useCallback(
    (message: string) => showToast({ type: ToastType.SUCCESS, message }),
    [showToast],
  );

  const showError = useCallback(
    (message: string) => showToast({ type: ToastType.ERROR, message }),
    [showToast],
  );

  return { showSuccess, showError };
};

export const showToast = (message: string, type: ToastType) => {
  pushToast({ type, message, duration: 4000 });
};

export const showError = (message: string) =>
  showToast(message, ToastType.ERROR);

export const showSuccess = (message: string) =>
  showToast(message, ToastType.SUCCESS);
