import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  ViewToken,
} from "react-native";
import { COLORS } from "../constants/colors";
import { width } from "../constants/settings";

const slides = [
  {
    id: "1",
    title: "Lorem ipsum dolor sit amet,",
    highlight: "consectetur",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: require("../assets/splash_logo.png"),
  },
  {
    id: "2",
    title: "Lorem ipsum dolor sit amet 22,",
    highlight: "consectetur",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: require("../assets/splash_logo.png"),
  },
  {
    id: "3",
    title: "Lorem ipsum dolor sit amet 33,",
    highlight: "consectetur",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: require("../assets/splash_logo.png"),
  },
];

export default function IntroModalScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 80 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate("Welcome");
    }
  };

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: 24 }}>
            <View style={styles.imageWrapper}>
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.title}>
                {item.title}{" "}
                <Text style={styles.highlight}>{item.highlight}</Text>
              </Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => handleDotPress(index)}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <Pressable
          style={{ paddingHorizontal: 10, paddingVertical: 4 }}
          onPress={() => navigation.navigate("Welcome")}
        >
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextIcon}>
            {currentIndex === slides.length - 1 ? "✔" : ">"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: COLORS.whiteBackground,
  },
  imageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 40,
  },
  image: {
    width: width * 0.9,
    height: width * 0.9,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "left",
    marginBottom: 12,
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    lineHeight: 20,
    marginTop: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 50,
    paddingHorizontal: 24,
  },
  dot: {
    width: 15,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 30,
    backgroundColor: COLORS.secondary,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 50,
    paddingHorizontal: 24,
  },
  skip: {
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  nextIcon: {
    color: COLORS.whiteBackground,
    fontSize: 14,
    fontWeight: "700",
  },
});
