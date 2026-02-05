import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { normalize, getFontFamily } from "../constants/settings";
import { COLORS } from "../constants/colors";
import {
  ShieldSearch,
  User,
  DocumentText,
  TickCircle,
} from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../stores/authSlice";

export default function KYCStatusScreen() {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const isAlreadyVerified = useMemo(
    () =>
      user?.bvn_verification_status === "VERIFIED" ||
      user?.nin_verification_status === "VERIFIED",
    [user.bvn_verification_status, user?.nin_verification_status],
  );

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          padding: 20,
        }}
      >
        <View style={{ columnGap: 10, width: "100%" }}>
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <ShieldSearch size={30} color={COLORS.primary} variant="Linear" />
            </View>
            <Text style={styles.emptyTitle}>
              Complete Your KYC Verification
            </Text>
            <Text style={styles.emptyDescription}>
              To access this service, we need to verify your identity. This is a
              secure one-time process.
            </Text>
          </View>

          <View style={styles.requirementsCard}>
            <Text style={styles.cardTitle}>What you'll need:</Text>

            <View style={{ rowGap: 20 }}>
              <View style={styles.requirementRow}>
                <View style={[styles.requirementIcon]}>
                  <User size={15} color={COLORS.primary} variant="Outline" />
                </View>
                <View>
                  <Text style={styles.itemHeader}>BVN Information</Text>
                  <Text style={styles.itemSub}>
                    Provide your Bank Verification Number (BVN)
                  </Text>
                </View>
              </View>

              <View style={styles.requirementRow}>
                <View style={[styles.requirementIcon]}>
                  <DocumentText
                    size={15}
                    color={COLORS.primary}
                    variant="Outline"
                  />
                </View>
                <View>
                  <Text style={styles.itemHeader}>Identity Information</Text>
                  <Text style={styles.itemSub}>
                    Provide a valid National Identification Number (NIN)
                  </Text>
                </View>
              </View>

              <View style={styles.requirementRow}>
                <View style={[styles.requirementIcon]}>
                  <TickCircle
                    size={15}
                    color={COLORS.primary}
                    variant="Outline"
                  />
                </View>
                <View>
                  <Text style={styles.itemHeader}>Selfie Verification</Text>
                  <Text style={styles.itemSub}>
                    A quick photo to confirm your identity
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Verification" as never)}
            activeOpacity={0.8}
            style={[styles.emptyButton, { backgroundColor: COLORS.primary }]}
          >
            <Text style={styles.emptyButtonText}>
              {isAlreadyVerified ? "Continue " : "Start "} KYC Verification
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={[styles.laterButton, { borderColor: COLORS.primary }]}
          >
            <Text style={[styles.laterButtonText, { color: COLORS.primary }]}>
              I'll do it later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 22,
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#111827",
    marginBottom: 0,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("400"),
    color: "#2e2f30ff",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  requirementsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#111827",
    marginBottom: 20,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#f6f6f6ff",
  },
  itemHeader: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#111827",
  },
  itemSub: {
    fontSize: normalize(17),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
  },
  infoBox: {
    backgroundColor: "#fffef8ff",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  infoTextBold: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("800"),
    color: "#A16207",
  },
  infoTextSub: {
    fontSize: normalize(18),
    fontFamily: getFontFamily("700"),
    color: "#A16207",
    textAlign: "center",
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
    paddingBottom: 20,
  },
  emptyButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 160,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
  laterButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 160,
    alignItems: "center",
    borderWidth: 1,
  },
  laterButtonText: {
    fontSize: normalize(16),
    fontFamily: getFontFamily("700"),
  },
  footerText: {
    marginTop: 24,
    fontSize: normalize(12),
    fontFamily: getFontFamily("400"),
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});
