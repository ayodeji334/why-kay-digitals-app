import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

export function useWallets() {
  const { apiGet } = useAxios();
  const { data, isLoading, isError, refetch, isFetching, isRefetching } =
    useQuery({
      queryKey: ["user-wallets"],
      queryFn: async () => {
        try {
          const res = await apiGet(`/wallets/user/crypto-wallets`);
          return res.data.data || { wallets: [], totalAssetValueBalance: 0 };
        } catch (error) {
          throw error;
        }
      },
    });

  console.log("Wallets Data: ", data);

  return {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    isRefetching,
  };
}
