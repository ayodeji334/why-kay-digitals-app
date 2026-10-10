import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  FlatList,
  ImageBackground,
  View,
  Pressable,
  Linking,
  ViewToken,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  getFontFamily,
  normalize,
  width as SCREEN_WIDTH,
  normalizeSpacing,
} from "../constants/settings";
import useAxios from "../hooks/useAxios";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import HalfScreenModal from "./HalfScreenModal";
import { usePhoneVerification } from "../hooks/usePhoneVerification";

type Banner = {
  id: number;
  image_url: string;
  identifier: string;
  linking_type: "internal" | "external";
};

const CARD_WIDTH_RATIO = 0.46;
const CARD_WIDTH = SCREEN_WIDTH * CARD_WIDTH_RATIO;
const CARD_GAP = 20;
const ITEM_STRIDE = CARD_WIDTH + CARD_GAP; // horizontal distance between card starts
const AUTO_SCROLL_INTERVAL_MS = 4000;

const AdvertsBanner = () => {
  const navigation = useNavigation();
  const { apiGet } = useAxios();

  const { isPhoneVerified } = usePhoneVerification();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(0); // avoids stale closures inside the interval
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const fetchBanners = async (): Promise<Banner[]> => {
    return apiGet("/banners")
      .then(res => res.data?.data)
      .catch(err => {
        throw err;
      });
  };

  const {
    data: banners,
    isLoading,
    isError,
    refetch,
  } = useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: fetchBanners,
    refetchOnWindowFocus: true,
  });

  const clearAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    clearAutoScroll();

    if (!banners || banners.length <= 1) return;

    autoScrollTimer.current = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % banners.length;

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * ITEM_STRIDE,
        animated: true,
      });

      currentIndexRef.current = nextIndex;
    }, AUTO_SCROLL_INTERVAL_MS);
  }, [banners, clearAutoScroll]);

  useEffect(() => {
    if (!isUserInteracting) {
      startAutoScroll();
    }

    return clearAutoScroll;
  }, [banners, isUserInteracting, startAutoScroll, clearAutoScroll]);

  const handleVerifyNow = () => {
    setShowPhoneModal(false);
    setTimeout(
      () => navigation.navigate("PhoneNumberVerification" as never),
      600,
    );
  };

  const handleBannerPress = (banner: Banner) => {
    if (banner.linking_type === "internal") {
      if (!isPhoneVerified) {
        setShowPhoneModal(true);
        return;
      }
      navigation.navigate(banner.identifier as never);
    } else {
      Linking.openURL(banner.identifier);
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        currentIndexRef.current = viewableItems[0].index;
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  if (isLoading) return <LoadingState message="Laoding advert banners..." />;
  if (isError)
    return (
      <ErrorState error={`Failed to load banners`} handleOnPress={refetch} />
    );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={item => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => setIsUserInteracting(true)}
        onMomentumScrollEnd={() => setIsUserInteracting(false)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item: banner }) => (
          <Pressable onPress={() => handleBannerPress(banner)}>
            <ImageBackground
              source={{ uri: banner.image_url }}
              style={styles.card}
              imageStyle={{ borderRadius: 10 }}
            />
          </Pressable>
        )}
      />

      <HalfScreenModal
        isVisible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title="Verify your phone number"
        description="You need to verify your phone number before you can continue."
        buttonText="Verify Now"
        actionButton={handleVerifyNow}
        secondaryButtonText="Maybe later"
        secondaryAction={() => setShowPhoneModal(false)}
        showCloseButton
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: normalizeSpacing(20),
    flex: 1,
  },
  text: {
    paddingVertical: normalizeSpacing(30),
    textAlign: "center",
    borderBottomColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: normalizeSpacing(20),
    fontFamily: getFontFamily(700),
    fontSize: normalize(18),
  },
  scrollContent: {
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 70,
    borderRadius: 10,
    paddingVertical: normalizeSpacing(16),
    backgroundColor: "#e7e7e7",
  },
});

export default AdvertsBanner;
