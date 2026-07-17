import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";

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

  // Get the current screen descriptor
  const parent = navigation.getParent();
  const state = parent?.getState();

  const currentRoute: any = state?.routes.find(r => r.key === route.key);

  const screenTitle = currentRoute?.params?.title || title;

  return (
    <View
      style={[
        styles.container,
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
          <ArrowLeft2 size={normalize(23)} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      {showTitle && <AppText style={styles.title}>{screenTitle}</AppText>}

      <View style={{ width: 24 }} />
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 19,
    backgroundColor: "white",
  },
  backBtn: {
    paddingVertical: 0,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: normalize(18),
    fontFamily: getFontFamily("800"),
    paddingVertical: 18,
  },
});
