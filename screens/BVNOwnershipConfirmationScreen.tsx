import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { AppText } from "../components/AppText";
import { getFontFamily, normalize } from "../constants/settings";
import { useColors } from "../hooks/useTheme";
import BVNOwnershipForm from "../components/BVNOwnershipForm";

export default function BVNOwnershipConfirmationScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const route = useRoute<any>();
  const { bvn, maskedPhoneNumber } = route.params ?? {};

  return (
    <SafeAreaView edges={["right", "left"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <AppText style={styles.subtitle}>
          We found a BVN registered with the phone number{" "}
          <AppText style={styles.maskedPhone}>{maskedPhoneNumber}</AppText>.
          Enter the full phone number to confirm you're the owner of this BVN.
        </AppText>

        <View style={styles.formSection}>
          <BVNOwnershipForm bvn={bvn} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1, paddingHorizontal: 20 },
    subtitle: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("400"),
      color: colors.text,
      marginTop: 16,
      lineHeight: normalize(25),
    },
    maskedPhone: {
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
    formSection: {
      marginTop: 24,
    },
  });
