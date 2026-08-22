import React from "react";
import { useQuery } from "@tanstack/react-query";
import BalanceCard from "../Dashboard/BalanceCard";
import useAxios from "../../hooks/useAxios";
import ErrorState from "../ErrorState";
import LoadingState from "../LoadingState";

export default function FiatWalletBalanceCard() {
  const { apiGet } = useAxios();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["fiat-balance"],
    queryFn: async () => {
      try {
        const response = await apiGet("wallets/user/fiat-balance");
        return response.data?.data;
      } catch (error) {
        throw error;
      }
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading your fiat balance..." />;
  }

  if (isError) {
    return (
      <ErrorState
        error="Cannot get your fiat balance. Kindly try again"
        handleOnPress={refetch}
      />
    );
  }

  const balance = data ?? 0;

  return <BalanceCard balance={balance} showTransactionsButton={true} />;
}
