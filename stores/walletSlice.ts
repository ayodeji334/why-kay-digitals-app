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
  fetchWallets: () => Promise<void>;
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

  fetchWallets: async () => {
    const token = useAuthStore.getState().token;
    if (!token || get().wallets.length) return;

    set({ loading: true, error: null });

    try {
      const res = await axios.get(`${BASE_URL}/wallets/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(res?.data?.data);

      if (!res.data?.success) throw new Error(res.data?.message);

      set({
        wallets: res.data.data ?? [],
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

  // fetchWalletsAndAccounts: async () => {
  //   const token = useAuthStore.getState().token;
  //   if (!token) return;

  //   set({ loading: true, error: null });

  //   try {
  //     const res = await axios.get(`${BASE_URL}/users/user/accounts`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (!res.data?.success) throw new Error(res.data?.message);

  //     // Merge wallets
  //     const newWallets = res.data.data.wallets ?? [];
  //     const mergedWallets = [
  //       ...get().wallets.map(w => {
  //         const updated = newWallets.find(
  //           (nw: any) => nw.asset_id === w.asset_id,
  //         );
  //         return updated ? { ...w, ...updated } : w;
  //       }),
  //       ...newWallets.filter(
  //         (nw: any) => !get().wallets.some(w => w.asset_id === nw.asset_id),
  //       ),
  //     ];

  //     // Merge bank accounts
  //     const newBankAccounts = res.data.data.bank_accounts ?? [];
  //     const mergedBankAccounts = [
  //       ...get().bankAccounts.map(b => {
  //         const updated = newBankAccounts.find((nb: any) => nb.id === b.id);
  //         return updated ? { ...b, ...updated } : b;
  //       }),
  //       ...newBankAccounts.filter(
  //         (nb: any) => !get().bankAccounts.some(b => b.id === nb.id),
  //       ),
  //     ];

  //     set({
  //       wallets: mergedWallets,
  //       bankAccounts: mergedBankAccounts,
  //     });
  //   } catch (e: any) {
  //     set({ error: e.message });
  //   } finally {
  //     set({ loading: false });
  //   }
  // },

  // fetchWallets: async () => {
  //   const token = useAuthStore.getState().token;
  //   if (!token) return;

  //   set({ loading: true, error: null });

  //   try {
  //     const res = await axios.get(`${BASE_URL}/wallets/user`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (!res.data?.success) throw new Error(res.data?.message);

  //     const newWallets = res.data.data ?? [];
  //     const mergedWallets = [
  //       ...get().wallets.map(w => {
  //         const updated = newWallets.find(
  //           (nw: any) => nw.asset_id === w.asset_id,
  //         );
  //         return updated ? { ...w, ...updated } : w;
  //       }),
  //       ...newWallets.filter(
  //         (nw: any) => !get().wallets.some(w => w.asset_id === nw.asset_id),
  //       ),
  //     ];

  //     set({ wallets: mergedWallets });
  //   } catch (e: any) {
  //     set({ error: e.message });
  //   } finally {
  //     set({ loading: false });
  //   }
  // },

  // refreshWallets: async () => {
  //   const token = useAuthStore.getState().token;
  //   if (!token) return;

  //   set({ loading: true, error: null });

  //   try {
  //     const res = await axios.get(`${BASE_URL}/users/user/accounts`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (!res.data?.success) throw new Error(res.data?.message);

  //     const newWallets = res.data.data.wallets ?? [];
  //     const mergedWallets = [
  //       ...get().wallets.map(w => {
  //         const updated = newWallets.find(
  //           (nw: any) => nw.asset_id === w.asset_id,
  //         );
  //         return updated ? { ...w, ...updated } : w;
  //       }),
  //       ...newWallets.filter(
  //         (nw: any) => !get().wallets.some(w => w.asset_id === nw.asset_id),
  //       ),
  //     ];

  //     const newBankAccounts = res.data.data.bank_accounts ?? [];
  //     const mergedBankAccounts = [
  //       ...get().bankAccounts.map(b => {
  //         const updated = newBankAccounts.find((nb: any) => nb.id === b.id);
  //         return updated ? { ...b, ...updated } : b;
  //       }),
  //       ...newBankAccounts.filter(
  //         (nb: any) => !get().bankAccounts.some(b => b.id === nb.id),
  //       ),
  //     ];

  //     set({
  //       wallets: mergedWallets,
  //       bankAccounts: mergedBankAccounts,
  //     });
  //   } catch (e: any) {
  //     set({ error: e.message });
  //   } finally {
  //     set({ loading: false });
  //   }
  // },

  clearWallets: () => {
    set({ wallets: [], bankAccounts: [] });
  },
}));
