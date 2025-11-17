import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  ScrollView,
  ImageBackground,
  View,
  Pressable,
  Linking,
  Text,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../api/axios";
import { getFontFamily, normalize } from "../constants/settings";

type Banner = {
  id: number;
  image_url: string;
  identifier: string;
  linking_type: "internal" | "external";
};

const AdvertsBanner = () => {
  const navigation = useNavigation();
  const { apiGet } = useAxios();

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
  } = useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: fetchBanners,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <Text style={styles.text}>Loading banners...</Text>;
  if (isError) return <Text style={styles.text}>Error loading banners</Text>;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {banners?.map(banner => (
          <Pressable
            key={banner.id}
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
        ))}
      </ScrollView>
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
    gap: 12,
  },
  card: {
    width: 300,
    height: 100,
    borderRadius: 10,
    paddingVertical: 16,
  },
});

export default AdvertsBanner;
