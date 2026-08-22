import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios";

export function useAssets() {
  const { apiGet } = useAxios();

  const fetchAssets = async (): Promise<any[]> => {
    try {
      const response = await apiGet("/crypto-assets/available");

      return (
        response.data?.data?.map((asset: any) => ({
          ...asset,
          id: asset.asset_id,
          uuid: asset.asset_id,
          name: asset.asset_name,
          symbol: asset.symbol,
          logo_url: asset.logo_url,
          market_current_value: asset.market_price ?? 0,
          sell_rate: parseFloat(asset?.sell_rate ?? 0),
          buy_rate: parseFloat(asset?.buy_rate ?? 0),
        })) ?? []
      );
    } catch (error) {
      console.error("Failed to fetch assets:", error);
      throw error;
    }
  };

  const {
    data: assets = [],
    isLoading,
    isRefetching,
    refetch,
    error,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  return {
    assets,
    isLoading,
    isRefetching,
    refetch,
    error,
    isError,
    isFetching,
  };
}
