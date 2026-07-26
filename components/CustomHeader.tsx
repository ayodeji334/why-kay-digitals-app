import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";
import { useColors, useThemeMode } from "../hooks/useTheme";
import { COLORS } from "../constants/colors";

type Props = {
  title?: string;
  showBack?: boolean;
  showTitle?: boolean;
};

const marginTop = Platform.select({
  android: normalize(10),
  default: 0,
  ios: normalize(60),
});

const marginBotom = Platform.select({
  android: normalize(0),
  default: 0,
  ios: normalize(8),
});

// const CustomHeader: React.FC<Props> = ({
//   title,
//   showBack = true,
//   showTitle = false,
// }) => {
//   const navigation = useNavigation();

//   return (
//     <View style={[styles.container, { paddingTop: marginTop }]}>
//       {showBack ? (
//         <TouchableOpacity
//           activeOpacity={0.8}
//           hitSlop={16}
//           onPress={() => navigation.goBack()}
//           style={styles.backBtn}
//         >
//           <ArrowLeft2 size={20} />
//         </TouchableOpacity>
//       ) : (
//         <View style={{ width: 24 }} />
//       )}
//       {showTitle ? <AppText style={styles.title}>{title}</AppText> : null}
//       <View style={{ width: 24 }} />
//     </View>
//   );
// };

// export default CustomHeader;

const CustomHeader: React.FC<Props> = ({
  title,
  showBack = true,
  showTitle = false,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const colors = useColors();
  const parent = navigation.getParent();
  const state = parent?.getState();
  const styles = makeScreenStyles(colors);

  const currentRoute: any = state?.routes.find(r => r.key === route.key);

  const screenTitle = currentRoute?.params?.title || title;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
        { paddingTop: marginTop, paddingBottom: marginBotom },
      ]}
    >
      {showBack ? (
        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={16}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft2 size={normalize(23)} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      {showTitle && <AppText style={styles.title}>{screenTitle}</AppText>}

      <View style={{ width: 24 }} />
    </View>
  );
};

const makeScreenStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 19,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    title: {
      flex: 1,
      textAlign: "center",
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      paddingVertical: 18,
      color: colors.text,
    },
    backBtn: {
      paddingVertical: 0,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },
    header: {
      marginTop: 8,
      marginBottom: 24,
    },
  });

export default CustomHeader;

// const makeScreenStyles = (colors: ReturnType<typeof useColors>) => const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 19,
//     backgroundColor: "white",
//   },
//   backBtn: {
//     paddingVertical: 0,
//   },
//   title: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: normalize(18),
//     fontFamily: getFontFamily("800"),
//     paddingVertical: 18,
//     color: colors
//   },
// });
