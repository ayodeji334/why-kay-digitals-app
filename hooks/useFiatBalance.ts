import { useQuery } from "@tanstack/react-query";
import useAxios from "../hooks/useAxios"; // adjust path

export function useFiatBalance() {
  const { apiGet } = useAxios();

  const fetchFiatBalance = async () => {
    const response = await apiGet("wallets/user/fiat-balance");
    return response.data?.data;
  };

  const {
    data: fiatBalance,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["fiat-balance"],
    queryFn: fetchFiatBalance,
    refetchInterval: 10000,
  });

  return { fiatBalance, isLoading, isError, refetch, isRefetching };
}
