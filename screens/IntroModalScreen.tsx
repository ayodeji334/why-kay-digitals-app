import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  ViewToken,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../constants/settings";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ArrowRight2 } from "iconsax-react-nativejs";
import { AppText } from "../components/AppText";
import { useColors } from "../hooks/useTheme";

const slides = [
  {
    id: "1",
    title: "Welcome to",
    title2: "WhyKay Digitals",
    highlight: "Your Gateway to Digital Wealth",
    subtitle:
      "Buy, sell, and manage cryptocurrencies with confidence. Pay utility bills, buy airtime, data and gift cards, and join thousands of users taking control of their financial future through smart, secure crypto investing.",
    image: require("../assets/first-slider.webp"),
  },
  {
    id: "2",
    title: "Trade Smarter,",
    title2: "Not Harder",
    highlight: "With Real Insights",
    subtitle:
      "Access real-time market data, price alerts, and intelligent tools designed to help you make better trading decisions anytime, anywhere.",
    image: require("../assets/welcome-pattern1.webp"),
  },
  {
    id: "3",
    title: "Your Security,",
    title2: "Our Top",
    highlight: "Priority",
    subtitle:
      "Your assets are protected with bank-grade encryption, multi-layer authentication, and advanced fraud detection — so you can trade with total peace of mind.",
    image: require("../assets/security_illustration.webp"),
  },
];

const marginTop = Platform.select({
  android: 0,
  ios: 0,
  default: 0,
});

export default function IntroModalScreen() {
  const navigation = useNavigation();
  const colors = useColors();
  // Single source of truth for both dimensions — reactive on rotation/split-view.
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => makeStyles(colors, screenWidth, screenHeight, insets.top),
    [colors, screenWidth, screenHeight, insets.top],
  );
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
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
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
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <View style={styles.textContainer}>
              <View>
                <AppText style={styles.title}>
                  {item.title2}
                  <AppText style={styles.highlight}> {item.highlight}</AppText>
                </AppText>
              </View>
              <AppText style={styles.subtitle}>{item.subtitle}</AppText>
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
          hitSlop={20}
          style={{ paddingVertical: normalizeSpacing(4) }}
          onPress={() => navigation.navigate("Welcome" as never)}
        >
          <AppText style={styles.skip}>Skip</AppText>
        </Pressable>
        <Pressable hitSlop={20} style={styles.nextButton} onPress={handleNext}>
          <ArrowRight2 color="#fff" size={normalize(19)} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (
  colors: ReturnType<typeof useColors>,
  screenWidth: number,
  screenHeight: number,
  topInset: number,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: marginTop,
    },
    slide: {
      paddingTop: topInset + normalize(20),
      width: screenWidth,
      flex: 1,
      justifyContent: "flex-start",
    },
    imageWrapper: {
      height: Math.min(screenHeight * 0.45, 420),
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: getFontFamily(700),
      paddingHorizontal: normalizeSpacing(17),
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    textContainer: {
      marginBottom: normalizeSpacing(40),
      paddingHorizontal: normalizeSpacing(17),
    },
    title: {
      fontSize: normalize(26),
      textAlign: "left",
      marginBottom: normalizeSpacing(2),
      fontFamily: getFontFamily(900),
      color: colors.text,
    },
    highlight: {
      color: colors.primaryLight,
      fontFamily: getFontFamily(900),
    },
    subtitle: {
      fontSize: normalize(20),
      marginTop: normalizeSpacing(10),
      fontFamily: getFontFamily(400),
      color: colors.text,
    },
    dotsContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      marginBottom: normalizeSpacing(40),
      paddingHorizontal: normalizeSpacing(17),
    },
    dot: {
      width: 15,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginHorizontal: normalizeSpacing(4),
    },
    activeDot: {
      width: 30,
      backgroundColor: colors.primary,
    },
    bottomNav: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginVertical: normalizeSpacing(10),
      paddingVertical: normalizeSpacing(20),
      paddingHorizontal: normalizeSpacing(17),
    },
    skip: {
      fontSize: normalize(20),
      fontFamily: getFontFamily(800),
      color: colors.text,
    },
    nextButton: {
      paddingHorizontal: normalizeSpacing(28),
      paddingVertical: normalizeSpacing(14),
      borderRadius: 280,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
  });
