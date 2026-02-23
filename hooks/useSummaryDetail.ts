import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

export function useSummaryDetail() {
  const { apiGet } = useAxios();

  const {
    data: walletSummary,
    refetch,
    isFetching,
    isLoading,
    isError,
    isRefetching,
  } = useQuery({
    queryKey: ["wallet-summary"],
    queryFn: async () => {
      try {
        const response = await apiGet("/transactions/user/daily-summary");
        return response?.data?.data;
      } catch (error) {
        throw error;
      }
    },
  });

  return {
    walletSummary,
    isLoading,
    isError,
    refetch,
    isFetching,
    isRefetching,
  };
}
