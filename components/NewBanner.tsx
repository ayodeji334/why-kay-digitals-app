import React from "react";
import { View, StyleSheet, ScrollView, ImageBackground } from "react-native";

const NewsBanner = () => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        <ImageBackground
          source={require("../assets/banner-1.png")}
          style={styles.card}
        ></ImageBackground>

        <ImageBackground
          source={require("../assets/banner-1.png")}
          style={styles.card}
        ></ImageBackground>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    marginRight: 12,
    minWidth: "80%",
    minHeight: 100,
    flexDirection: "row",
    position: "relative",
    overflow: "scroll",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
    opacity: 0.9,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: -10,
  },
  bitcoinIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  bitcoinIconSmall: {
    width: 44,
    height: 44,
    marginTop: -12,
    marginLeft: -12,
  },
  phoneContainer: {
    alignItems: "flex-end",
    marginRight: -20,
  },
  phoneLarge: {
    width: 80,
    height: 160,
    resizeMode: "contain",
  },
  phoneSmall: {
    width: 60,
    height: 120,
    resizeMode: "contain",
    marginTop: -40,
    marginRight: 10,
  },
  curveLineLeft: {
    position: "absolute",
    left: -40,
    bottom: -40,
    width: 120,
    height: 120,
    borderColor: "#4A9EFF",
    borderWidth: 4,
    borderRadius: 60,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    transform: [{ rotate: "45deg" }],
  },
  curveLineRight: {
    position: "absolute",
    right: -50,
    top: -30,
    width: 140,
    height: 140,
    borderColor: "#4A9EFF",
    borderWidth: 4,
    borderRadius: 70,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    transform: [{ rotate: "-30deg" }],
  },
});

export default NewsBanner;
