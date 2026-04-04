import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";

export function useMarketPrice(assetId: string) {
  const { apiGet } = useAxios();

  return useQuery({
    queryKey: ["market-price", assetId],
    queryFn: async () => {
      const res = await apiGet(`/crypto-assets/${assetId}/rates`);
      return res?.data?.data ?? null;
    },
    enabled: !!assetId,
  });
}
