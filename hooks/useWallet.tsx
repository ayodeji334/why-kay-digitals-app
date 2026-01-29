import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

export function useWallets() {
  const { apiGet } = useAxios();
  return useQuery({
    queryKey: ["user-wallets"],
    queryFn: async () => {
      try {
        const res = await apiGet(`/wallets/user/crypto-wallets`);
        return res.data.data ?? {};
      } catch (error) {
        throw error;
      }
    },
  });
}
