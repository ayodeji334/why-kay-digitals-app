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
import { getFontFamily, height, normalize } from "../constants/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight2 } from "iconsax-react-nativejs";

const slides = [
  {
    id: "1",
    title: "Welcome to",
    title2: "WhyKay Crypto",
    highlight: "Your Gateway to Digital Wealth",
    subtitle:
      "Buy, sell, and manage cryptocurrencies with confidence. Join thousands of users taking control of their financial future through smart, secure crypto investing.",
    image: require("../assets/slide-1.png"),
  },
  {
    id: "2",
    title: "Trade Smarter,",
    title2: "Not Harder",
    highlight: "With Real Insights",
    subtitle:
      "Access real-time market data, price alerts, and intelligent tools designed to help you make better trading decisions anytime, anywhere.",
    image: require("../assets/welcome-illustration.png"),
  },
  {
    id: "3",
    title: "Your Security,",
    title2: "Our Top",
    highlight: "Priority",
    subtitle:
      "Your assets are protected with bank-grade encryption, multi-layer authentication, and advanced fraud detection — so you can trade with total peace of mind.",
    image: require("../assets/security_illustration.png"),
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
    <SafeAreaView
      edges={["bottom", "left", "right", "top"]}
      style={styles.container}
    >
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
                {/* <Text style={styles.title}>{item.title}</Text> */}
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
          <ArrowRight2 color="white" size={15} />
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
    height: Math.min(height * 0.8, 390),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: getFontFamily(700),
    paddingHorizontal: 17,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  textContainer: {
    marginTop: 20,
    paddingHorizontal: 17,
  },
  title: {
    fontSize: normalize(30),
    textAlign: "left",
    marginBottom: 2,
    lineHeight: 30,
    fontFamily: getFontFamily(900),
  },
  highlight: {
    color: COLORS.primary,
    fontFamily: getFontFamily(900),
  },
  subtitle: {
    fontSize: normalize(22),
    marginTop: 10,
    lineHeight: 20,
    fontFamily: getFontFamily(400),
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
    backgroundColor: COLORS.primary,
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
    fontSize: normalize(19),
    fontFamily: getFontFamily(700),
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
