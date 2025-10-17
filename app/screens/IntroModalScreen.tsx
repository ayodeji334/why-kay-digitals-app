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
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { COLORS } from "../constants/colors";
import { height, normalize } from "../constants/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight2 } from "iconsax-react-nativejs";

const slides = [
  {
    id: "1",
    title: "Lorem ipsum dolor",
    title2: "sit amet,",
    highlight: "consectetur",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: require("../assets/splash_logo.png"),
  },
  {
    id: "2",
    title: "Lorem ipsum dolor",
    title2: "sit amet,",
    highlight: "consectetur",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: require("../assets/splash_logo.png"),
  },
  {
    id: "3",
    title: "Lorem ipsum dolor",
    title2: "sit amet,",
    highlight: "consectetur",
    subtitle:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    image: require("../assets/splash_logo.png"),
  },
];

const marginTop = Platform.select({
  android: 0,
  ios: 46,
  default: 0,
});

const { width: screenWidth } = Dimensions.get("window");

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
      navigation.navigate("Welcome" as never);
    }
  };

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index });
  };

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={"white"} />
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
          <View style={styles.slide}>
            <View style={styles.imageWrapper}>
              <Image source={item.image} style={styles.image} />
            </View>

            <View style={styles.textContainer}>
              <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.title}>
                  {item.title2}
                  <Text style={styles.highlight}> {item.highlight}</Text>
                </Text>
              </View>
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

      <View style={styles.bottomNav}>
        <Pressable
          style={{ paddingHorizontal: 10, paddingVertical: 4 }}
          onPress={() => navigation.navigate("Welcome" as never)}
        >
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <ArrowRight2 size={15} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginTop: marginTop,
  },
  slide: {
    width: screenWidth,
  },
  imageWrapper: {
    marginVertical: 20,
    height: Math.min(height * 0.6, 320),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 17,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textContainer: {
    marginTop: 10,
    paddingHorizontal: 17,
  },
  title: {
    fontSize: normalize(23),
    fontWeight: "700",
    textAlign: "left",
    marginBottom: 2,
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: normalize(13),
    fontWeight: "400",
    marginTop: 10,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 17,
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
    marginVertical: 10,
    paddingVertical: 20,
    paddingHorizontal: 17,
  },
  skip: {
    fontSize: normalize(13),
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
  // nextIcon: {
  //   color: COLORS.whiteBackground,
  //   fontSize: 14,
  //   fontWeight: "700",
  // },
});
