import { useQuery } from "@tanstack/react-query";
import useAxios from "./useAxios";

export interface TierLimit {
  amount: number | null;
  formatted: string;
}

export interface AccountTier {
  tier: string;
  tier_name: string;
  description: string;
  limits: {
    fiat: {
      deposit: TierLimit;
      single_withdrawal: TierLimit;
      daily_withdrawal: TierLimit;
    };
    crypto: {
      transfer: TierLimit;
      buy: TierLimit;
      sell: TierLimit;
    };
    utility_bills: TierLimit;
  };
}

export const useAccountTiers = () => {
  const { apiGet } = useAxios();

  const fetchAccountTiers = async (): Promise<AccountTier[]> => {
    const { data } = await apiGet("/account-tiers");
    return data?.data ?? [];
  };

  return useQuery({
    queryKey: ["account-tiers"],
    queryFn: fetchAccountTiers,
  });
};
