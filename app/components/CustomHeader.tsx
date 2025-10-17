import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft2 } from "iconsax-react-nativejs";
import { normalize } from "../constants/settings";

type Props = {
  title?: string;
  showBack?: boolean;
  showTitle?: boolean;
};

const marginTop = Platform.select({
  android: 0,
  ios: 46,
  default: 0,
});

const CustomHeader: React.FC<Props> = ({
  title,
  showBack = true,
  showTitle = false,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft2 size={20} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
      {showTitle ? <Text style={styles.title}>{title}</Text> : null}
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
    paddingVertical: 12,
    backgroundColor: "white",
    marginTop: marginTop,
  },
  backBtn: {
    paddingVertical: 5,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: normalize(14),
    fontWeight: "700",
    paddingVertical: 18,
  },
});
