import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";

type Props = {
  title?: string;
  showBack?: boolean;
  showTitle?: boolean;
};

const marginTop = Platform.select({
  android: 0,
  default: 0,
  ios: 65,
});

const CustomHeader: React.FC<Props> = ({
  title,
  showBack = true,
  showTitle = false,
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: marginTop }]}>
      {showBack ? (
        <Pressable
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft2 size={20} />
        </Pressable>
      ) : (
        <View style={{ width: 24 }} />
      )}
      {showTitle ? <AppText style={styles.title}>{title}</AppText> : null}
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
    fontSize: normalize(17),
    fontFamily: getFontFamily("800"),
    paddingVertical: 18,
  },
});
