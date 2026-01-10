import { create } from "zustand";
import axios from "axios";
import { BASE_URL } from "../api/axios";
import { useAuthStore } from "./authSlice";

interface WalletState {
  wallets: any[];
  bankAccounts: any[];
  loading: boolean;
  error: string | null;

  fetchWalletsAndAccounts: () => Promise<void>;
  refreshWallets: () => Promise<void>;
  clearWallets: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  bankAccounts: [],
  loading: false,
  error: null,

  fetchWalletsAndAccounts: async () => {
    const token = useAuthStore.getState().token;
    if (!token || get().wallets.length) return;

    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${BASE_URL}/users/user/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success) throw new Error(res.data?.message);

      set({
        wallets: res.data.data.wallets ?? [],
        bankAccounts: res.data.data.bank_accounts ?? [],
      });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  refreshWallets: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${BASE_URL}/users/user/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success) throw new Error(res.data?.message);

      set({
        wallets: res.data.data.wallets ?? [],
        bankAccounts: res.data.data.bank_accounts ?? [],
      });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  clearWallets: () => {
    set({ wallets: [], bankAccounts: [] });
  },
}));
