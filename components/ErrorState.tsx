import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ErrorState({
  error,
  handleOnPress,
}: {
  error: string;
  handleOnPress: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleOnPress}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sellAllButton: {
    borderWidth: 1,
    borderColor: "#FFA726",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sellAllText: {
    color: "#FFA726",
    fontSize: 14,
    fontWeight: "500",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assetSymbol: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  assetInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assetDetails: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  assetName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  assetBalance: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  assetStats: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  assetLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "400",
  },
  assetValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  assetChange: {
    fontSize: 10,
    fontWeight: "500",
  },
  // Loading State
  loadingContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  // Error State
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
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
    fontSize: 12,
    fontWeight: "600",
  },
  // Empty State
  emptyState: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 16,
  },
  emptyButton: {
    backgroundColor: "#FFA726",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
