// import React from "react";
// import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { ArrowLeft2 } from "iconsax-react-nativejs";
// import { getFontFamily, normalize } from "../constants/settings";
// import { AppText } from "./AppText";
// import { useColors } from "../hooks/useTheme";

// type Props = {
//   title?: string;
//   showBack?: boolean;
//   showTitle?: boolean;
// };

// const marginTop = Platform.select({
//   android: normalize(10),
//   default: 0,
//   ios: normalize(67),
// });

// const marginBotom = Platform.select({
//   android: normalize(10),
//   default: 0,
//   ios: normalize(10),
// });

// // const CustomHeader: React.FC<Props> = ({
// //   title,
// //   showBack = true,
// //   showTitle = false,
// // }) => {
// //   const navigation = useNavigation();

// //   return (
// //     <View style={[styles.container, { paddingTop: marginTop }]}>
// //       {showBack ? (
// //         <TouchableOpacity
// //           activeOpacity={0.8}
// //           hitSlop={16}
// //           onPress={() => navigation.goBack()}
// //           style={styles.backBtn}
// //         >
// //           <ArrowLeft2 size={20} />
// //         </TouchableOpacity>
// //       ) : (
// //         <View style={{ width: 24 }} />
// //       )}
// //       {showTitle ? <AppText style={styles.title}>{title}</AppText> : null}
// //       <View style={{ width: 24 }} />
// //     </View>
// //   );
// // };

// // export default CustomHeader;

// const CustomHeader: React.FC<Props> = ({
//   title,
//   showBack = true,
//   showTitle = false,
// }) => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const colors = useColors();
//   const parent = navigation.getParent();
//   const state = parent?.getState();
//   const styles = makeScreenStyles(colors);

//   const currentRoute: any = state?.routes.find(r => r.key === route.key);

//   const screenTitle = currentRoute?.params?.title || title;

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           backgroundColor: colors.background,
//         },
//         { paddingTop: marginTop, paddingBottom: marginBotom },
//       ]}
//     >
//       {showBack ? (
//         <TouchableOpacity
//           activeOpacity={0.8}
//           hitSlop={16}
//           onPress={() => navigation.goBack()}
//           style={styles.backBtn}
//         >
//           <ArrowLeft2 size={normalize(23)} color={colors.text} />
//         </TouchableOpacity>
//       ) : (
//         <View style={{ width: 24 }} />
//       )}

//       {showTitle && <AppText style={styles.title}>{screenTitle}</AppText>}

//       <View style={{ width: 24 }} />
//     </View>
//   );
// };

// const makeScreenStyles = (colors: ReturnType<typeof useColors>) =>
//   StyleSheet.create({
//     container: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 12,
//       paddingVertical: 209,
//       backgroundColor: colors.background,
//     },
//     scrollContainer: {
//       flex: 1,
//       paddingHorizontal: 20,
//     },
//     title: {
//       flex: 1,
//       textAlign: "center",
//       fontSize: normalize(18),
//       fontFamily: getFontFamily("800"),
//       paddingVertical: 18,
//       color: colors.text,
//     },
//     backBtn: {
//       paddingVertical: 0,
//     },
//     scrollContent: {
//       flexGrow: 1,
//       paddingBottom: 24,
//     },
//     header: {
//       marginTop: 8,
//       marginBottom: 24,
//     },
//   });

// export default CustomHeader;

// // const makeScreenStyles = (colors: ReturnType<typeof useColors>) => const styles = StyleSheet.create({
// //   container: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     paddingHorizontal: 12,
// //     paddingVertical: 19,
// //     backgroundColor: "white",
// //   },
// //   backBtn: {
// //     paddingVertical: 0,
// //   },
// //   title: {
// //     flex: 1,
// //     textAlign: "center",
// //     fontSize: normalize(18),
// //     fontFamily: getFontFamily("800"),
// //     paddingVertical: 18,
// //     color: colors
// //   },
// // });
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft2, Message } from "iconsax-react-nativejs";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";
import { useLiveChat } from "../context/LiveChatProvider";

type Props = {
  title?: string;
  showBack?: boolean;
  showTitle?: boolean;
  showChat?: boolean;
};

const marginTop = Platform.select({
  android: normalize(10),
  default: 0,
  ios: normalize(69),
});

const marginBotom = Platform.select({
  android: normalize(10),
  default: 0,
  ios: normalize(10),
});

const CustomHeader: React.FC<Props> = ({
  title,
  showBack = true,
  showTitle = false,
  showChat = false,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const colors = useColors();
  const { openLiveChat } = useLiveChat();
  const parent = navigation.getParent();
  const state = parent?.getState();
  const styles = makeScreenStyles(colors);

  const currentRoute: any = state?.routes.find(r => r.key === route.key);
  const screenTitle = currentRoute?.params?.title || title;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
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

      {showChat ? (
        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={10}
          onPress={openLiveChat}
          style={styles.chatBtn}
        >
          <Message size={normalize(17)} color={colors.text} />
          <Text style={styles.chatText}>Help Center</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
};

const makeScreenStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 12,
      backgroundColor: colors.background,
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
    chatBtn: {
      flexDirection: "row",
      paddingVertical: 5,
      paddingHorizontal: 12,
      alignItems: "center",
      columnGap: 3,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      borderRadius: 20,
      justifyContent: "center",
      position: "relative",
      marginHorizontal: 5,
    },
    chatText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily("800"),
      color: colors.text,
    },
  });

export default CustomHeader;
