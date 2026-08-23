import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import CustomToast from "./CustomToast";
import {
  QueuedToast,
  dismissToast,
  subscribeToToasts,
} from "../hooks/useToast";

const STACK_OFFSET = 90;

/**
 * Renders the live toast queue. Mount this once, at the very root of the
 * app (see App.tsx), above everything else — `useCustomToast` / `showToast`
 * / `showError` / `showSuccess` can then be called from anywhere and the
 * toast will appear here, sliding down from beyond the status bar.
 */
export default function ToastHost() {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);

  useEffect(() => subscribeToToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.host} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <CustomToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          offset={(toast.position ?? 0) + index * STACK_OFFSET}
          onHide={() => dismissToast(toast.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20000,
    elevation: 20000,
  },
});
