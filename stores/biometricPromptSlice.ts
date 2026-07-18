import { create } from "zustand";
import { getItem, removeItem, setItem, STORAGE_KEYS } from "../utlis/storage";
import { useAuthStore } from "./authSlice";

type PromptStatus = "never_asked" | "skipped" | "declined_forever" | "enrolled";

type PromptState = {
  status: PromptStatus;
  promptCount: number;
  lastPromptedAt: number;
  hydrated: boolean;
  holdGate: boolean;
};

export const COOLDOWN_MS = 1000;
export const MAX_PROMPTS = 2;

export const biometricPromptKey = (uuid: string) =>
  `${STORAGE_KEYS.BIOMETRIC_PROMPT}:${uuid}`;

export const useBiometricPromptStore = create<
  PromptState & {
    hydrate: () => Promise<void>;
    markSkipped: () => Promise<void>;
    markDeclinedForever: () => Promise<void>;
    markEnrolled: () => Promise<void>;
    setHoldGate: (v: boolean) => void;
  }
>((set, get) => {
  const persist = async (next: Partial<PromptState>) => {
    const merged = { ...get(), ...next };
    set(merged);

    const uuid = useAuthStore.getState().user?.uuid;
    if (!uuid) return;

    await setItem(
      biometricPromptKey(uuid),
      JSON.stringify({
        status: merged.status,
        promptCount: merged.promptCount,
        lastPromptedAt: merged.lastPromptedAt,
      }),
    );
  };

  return {
    status: "never_asked",
    promptCount: 0,
    lastPromptedAt: 0,
    hydrated: false,
    holdGate: false,

    setHoldGate: (v: boolean) => set({ holdGate: v }),

    // hydrate: async () => {
    //   const uuid = useAuthStore.getState().user?.uuid;
    //   await removeItem(biometricPromptKey(uuid!));
    //   await removeItem(STORAGE_KEYS.BIOMETRIC_PROMPT);

    //   if (!uuid) {
    //     set({
    //       status: "never_asked",
    //       promptCount: 0,
    //       lastPromptedAt: 0,
    //       hydrated: true,
    //     });
    //     return;
    //   }
    //   try {
    //     const raw = await getItem(biometricPromptKey(uuid));
    //     set({ ...(raw ? JSON.parse(raw) : {}), hydrated: true });
    //   } catch {
    //     set({ hydrated: true });
    //   }
    // },

    hydrate: async () => {
      const uuid = useAuthStore.getState().user?.uuid;

      if (!uuid) {
        set({
          status: "never_asked",
          promptCount: 0,
          lastPromptedAt: 0,
          hydrated: true,
        });
        return;
      }
      try {
        const raw = await getItem(biometricPromptKey(uuid));
        set({ ...(raw ? JSON.parse(raw) : {}), hydrated: true });
      } catch {
        set({ hydrated: true });
      }
    },

    markSkipped: () =>
      persist({
        status: "skipped",
        promptCount: get().promptCount + 1,
        lastPromptedAt: Date.now(),
      }),
    markDeclinedForever: () => persist({ status: "declined_forever" }),
    markEnrolled: () => persist({ status: "enrolled" }),
  };
});
