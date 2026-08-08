import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

// Reuses /users/user/referral-history since it's the endpoint that already
// exposes points_balance and total_worth_naira — a dedicated /points-balance
// endpoint would be a cleaner long-term home for this, but this works today
// without needing a backend change just to ship the toggle.
export function usePointsBalance() {
  const { apiGet } = useAxios();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["pointsBalance"],
    queryFn: async () => {
      const res = await apiGet("/users/user/referral-history");
      return res.data?.data;
    },
    staleTime: 30000,
  });

  return {
    pointsBalance: data?.points_balance ?? 0,
    // total_worth_naira comes back as a string from the backend (bcmath
    // precision) — parsed here so callers can do numeric comparisons
    // directly, same as fiatBalance is already used.
    pointsWorth: parseFloat(data?.total_worth_naira ?? "0") || 0,
    isLoading,
    refetch,
  };
}
