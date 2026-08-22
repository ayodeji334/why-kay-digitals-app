// import { useNavigation } from "@react-navigation/native";
// import React from "react";
// import {
//   StyleSheet,
//   ScrollView,
//   ImageBackground,
//   View,
//   Pressable,
//   Linking,
// } from "react-native";
// import { useQuery } from "@tanstack/react-query";
// import { getFontFamily, normalize } from "../constants/settings";
// import useAxios from "../hooks/useAxios";
// import ErrorState from "./ErrorState";
// import LoadingState from "./LoadingState";

// type Banner = {
//   id: number;
//   image_url: string;
//   identifier: string;
//   linking_type: "internal" | "external";
// };

// const AdvertsBanner = () => {
//   const navigation = useNavigation();
//   const { apiGet } = useAxios();

//   const fetchBanners = async (): Promise<Banner[]> => {
//     return apiGet("/banners")
//       .then(res => res.data?.data)
//       .catch(err => {
//         throw err;
//       });
//   };

//   const {
//     data: banners,
//     isLoading,
//     isError,
//     refetch,
//   } = useQuery<Banner[]>({
//     queryKey: ["banners"],
//     queryFn: fetchBanners,
//     refetchOnWindowFocus: true,
//   });

//   if (isLoading) return <LoadingState message="Laoding advert banners..." />;
//   if (isError)
//     return (
//       <ErrorState error={`Failed to load banners`} handleOnPress={refetch} />
//     );

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {banners?.map(banner => (
//           <Pressable
//             key={banner.id}
//             onPress={() => {
//               if (banner.linking_type === "internal") {
//                 navigation.navigate(banner.identifier as never);
//               } else {
//                 Linking.openURL(banner.identifier);
//               }
//             }}
//           >
//             <ImageBackground
//               source={{ uri: banner.image_url }}
//               style={styles.card}
//               imageStyle={{ borderRadius: 10 }}
//             />
//           </Pressable>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     paddingVertical: 20,
//     flex: 1,
//   },
//   text: {
//     paddingVertical: 30,
//     textAlign: "center",
//     borderBottomColor: "gray",
//     borderWidth: 1,
//     borderRadius: 10,
//     marginBottom: 20,
//     fontFamily: getFontFamily(700),
//     fontSize: normalize(18),
//   },
//   scrollContent: {
//     gap: 12,
//   },
//   card: {
//     width: 300,
//     height: 100,
//     borderRadius: 10,
//     paddingVertical: 16,
//     backgroundColor: "#e7e7e7",
//   },
// });

// export default AdvertsBanner;
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
import { getFontFamily, normalize } from "../constants/settings";
import useAxios from "../hooks/useAxios";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";

type Banner = {
  id: number;
  image_url: string;
  identifier: string;
  linking_type: "internal" | "external";
};

const CARD_WIDTH = 340;
const CARD_GAP = 12;
const ITEM_STRIDE = CARD_WIDTH + CARD_GAP; // horizontal distance between card starts
const AUTO_SCROLL_INTERVAL_MS = 4000;

const AdvertsBanner = () => {
  const navigation = useNavigation();
  const { apiGet } = useAxios();

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
          <Pressable
            onPress={() => {
              if (banner.linking_type === "internal") {
                navigation.navigate(banner.identifier as never);
              } else {
                Linking.openURL(banner.identifier);
              }
            }}
          >
            <ImageBackground
              source={{ uri: banner.image_url }}
              style={styles.card}
              imageStyle={{ borderRadius: 10 }}
            />
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    flex: 1,
  },
  text: {
    paddingVertical: 30,
    textAlign: "center",
    borderBottomColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    fontFamily: getFontFamily(700),
    fontSize: normalize(18),
  },
  scrollContent: {
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 120,
    borderRadius: 10,
    paddingVertical: 16,
    backgroundColor: "#e7e7e7",
  },
});

export default AdvertsBanner;
