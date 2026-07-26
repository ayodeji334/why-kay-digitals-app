import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

const DEFAULT_MIN_AMOUNT = 20;

export function useCryptoLimits() {
  const { apiGet } = useAxios();

  const { data, isLoading } = useQuery({
    queryKey: ["crypto-settings"],
    queryFn: async () => {
      const res = await apiGet("/service-charges/crypto-assets/settings");
      return res?.data?.data ?? null;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  return {
    minBuyAmount: data?.min_buy_amount ?? DEFAULT_MIN_AMOUNT,
    minSellAmount: data?.min_sell_amount ?? DEFAULT_MIN_AMOUNT,
    isLoadingLimits: isLoading,
  };
}
