import { useCallback } from "react";

export enum ToastType {
  ERROR = "error",
  SUCCESS = "success",
}

export interface ToastProps {
  type: ToastType;
  message: string;
  /** Extra top offset (px), e.g. to stack a toast under another one. */
  position?: number;
  duration?: number;
}

export interface QueuedToast extends ToastProps {
  id: number;
}

type Listener = (toasts: QueuedToast[]) => void;

// Tiny, dependency-free pub/sub. `ToastHost` (mounted once at the app root,
// see App.tsx) is the sole subscriber and is what actually renders the
// queued toasts — this module just tracks the queue and fans out updates.
let queue: QueuedToast[] = [];
let listeners: Listener[] = [];
let nextId = 0;

function notify() {
  listeners.forEach(listener => listener(queue));
}

export function pushToast(props: ToastProps) {
  const id = ++nextId;
  queue = [...queue, { ...props, id }];
  notify();
  return id;
}

export function dismissToast(id: number) {
  queue = queue.filter(toast => toast.id !== id);
  notify();
}

export function subscribeToToasts(listener: Listener) {
  listeners = [...listeners, listener];
  listener(queue);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function showSequentially(items: ToastProps[], index: number) {
  if (index >= items.length) return;
  pushToast(items[index]);
  setTimeout(() => showSequentially(items, index + 1), 200);
}

export function useCustomToast() {
  const showToast = useCallback((props: ToastProps | ToastProps[]) => {
    if (Array.isArray(props)) {
      showSequentially(props, 0);
    } else {
      pushToast(props);
    }
  }, []);

  return showToast;
}
