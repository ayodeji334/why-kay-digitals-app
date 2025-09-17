import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Entypo from "@react-native-vector-icons/entypo";

type Props = {
  title: string;
  showBack?: boolean;
  showTitle?: boolean;
};

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
          <Entypo name="chevron-left" size={30} />
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
    backgroundColor: "white",
    paddingTop: (StatusBar.currentHeight as number) + 50,
  },
  backBtn: {
    paddingVertical: 5,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
