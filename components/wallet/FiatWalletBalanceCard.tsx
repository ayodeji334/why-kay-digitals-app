import React from "react";
import { useQuery } from "@tanstack/react-query";
import BalanceCard from "../Dashboard/BalanceCard";
import useAxios from "../../hooks/useAxios";
import ErrorState from "../ErrorState";
import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { normalize, getFontFamily } from "../../constants/settings";
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

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#333",
  },
  sellAllButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 7,
  },
  sellAllText: {
    color: COLORS.primary,
    fontSize: normalize(19),
    fontFamily: getFontFamily("700"),
  },
  assetsList: {
    gap: 12,
  },
  assetCard: {
    backgroundColor: "#EFF7EC",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
  },
  assetHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  assetIcon: {
    height: 30,
    width: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  assetSymbol: {
    color: "#fff",
    fontSize: normalize(13),
    fontFamily: getFontFamily("800"),
  },
  assetInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  assetDetails: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 3,
  },
  assetName: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#000",
    marginBottom: 4,
  },
  assetBalance: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#333",
  },
  assetStats: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  assetLabel: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#666",
    marginBottom: 4,
  },
  assetValue: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    color: "#333",
  },
  assetChange: {
    fontSize: normalize(10),
    fontFamily: getFontFamily("400"),
  },
  // Loading State
  loadingContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: normalize(18),
    color: "#000",
    fontFamily: getFontFamily("400"),
  },
  // Error State
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    // padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: normalize(14),
    color: "#dc2626",
    fontFamily: getFontFamily("400"),
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: normalize(12),
    fontFamily: getFontFamily("400"),
  },
  // Empty State
  emptyState: {
    backgroundColor: "#f4f7f3ff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4A9237",
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("700"),
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#898989ff",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
  emptyButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
});
