// store/quoteStore.ts
import { create } from "zustand";

type QuoteStore = {
  lastCancelledAt: number | null;
  setLastCancelledAt: (ts: number | null) => void;
};

export const useQuoteStore = create<QuoteStore>(set => ({
  lastCancelledAt: null,
  setLastCancelledAt: ts => set({ lastCancelledAt: ts }),
}));
