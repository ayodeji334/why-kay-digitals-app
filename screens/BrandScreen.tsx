import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getFontFamily, normalize } from "../constants/settings";
import { COLORS } from "../constants/colors";
import { AppText } from "../components/AppText";
import CountryPicker from "../components/CountryPicker";
import useAxios from "../hooks/useAxios";
import { Country } from "../libs/types";
import { getCachedCountries, loadCountries } from "../libs/countries";
import { useCountries } from "../hooks/useCountries";

const ITEMS_PER_PAGE = 20;

export default function BrandsScreen() {
  const navigation = useNavigation<any>();
  const { apiGet } = useAxios();

  // const [countries, setCountries] = useState<Country[]>(
  //   () => getCachedCountries() ?? [],
  // );
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    data: countries = [],
    isPending: countriesLoading,
    isError: countriesError,
  } = useCountries();

  useEffect(() => {
    if (!selectedCountry && countries.length) {
      setSelectedCountry(countries.find(c => c.cca2 === "US"));
    }
  }, [countries, selectedCountry]);

  // useEffect(() => {
  //   let cancelled = false;

  //   loadCountries()
  //     .then(all => {
  //       if (cancelled) return;
  //       setCountries(all);
  //       const def = all.find(c => c.cca2 === "US");
  //       if (def) setSelectedCountry(def);
  //     })
  //     .catch(() => {});

  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchBrands = useCallback(
    async ({ pageParam = 1 }: { pageParam?: number }): Promise<any> => {
      const params = new URLSearchParams({
        page: String(pageParam),
        per_page: String(ITEMS_PER_PAGE),
        ...(selectedCountry && { country: selectedCountry.cca2.toLowerCase() }),
        ...(debouncedSearch && { brand: debouncedSearch }),
      });

      const res = await apiGet(`/gift-cards/brands?${params.toString()}`);

      return {
        data: res.data?.data?.brands,
        pagination: res.data?.data?.pagination,
      };
    },
    [selectedCountry, debouncedSearch],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["brands", selectedCountry?.cca2, debouncedSearch],
    queryFn: fetchBrands,
    getNextPageParam: lastPage => {
      return lastPage?.pagination?.current_page <
        lastPage?.pagination?.last_page
        ? lastPage.pagination?.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: !!selectedCountry,
  });

  const brands = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data?.pages],
  );

  const renderBrand = ({ item }: { item: any }) => {
    console.log("Item value", item);
    return (
      <TouchableOpacity
        hitSlop={10}
        style={styles.brandCard}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("BrandDetail", {
            brand: item,
            country: selectedCountry?.cca2,
            title: item?.brand_name ?? "Example Here",
          })
        }
      >
        {item.brand_logo ? (
          <Image
            source={{ uri: item.brand_logo }}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.brandLogoPlaceholder}>
            <AppText style={styles.brandLogoInitial}>
              {item?.brand_name?.charAt(0)}
            </AppText>
          </View>
        )}
        <AppText style={styles.brandName}>{item.brand_name}</AppText>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <ActivityIndicator
        color={COLORS.primary}
        style={{ marginVertical: 16 }}
      />
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <AppText style={styles.emptyText}>
          {isError
            ? "Failed to load brands. Pull down to retry."
            : `No gift card brands found for ${
                selectedCountry?.name ?? "this country"
              }.`}
        </AppText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.filterRow}>
          <View style={styles.countryPickerWrap}>
            {/* <CountryPicker
              countries={countries}
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder="Select country"
              showCode
            /> */}
            <CountryPicker
              countries={countries}
              value={selectedCountry}
              onChange={setSelectedCountry}
              loading={isLoading}
              emptyText={
                isError
                  ? "Couldn't load countries. Check your connection."
                  : "No countries found"
              }
            />
          </View>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search brands…"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {isLoading ? (
          <ActivityIndicator
            color={COLORS.primary}
            size="small"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={brands}
            keyExtractor={item => item.brand_code}
            renderItem={renderBrand}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            onRefresh={refetch}
            refreshing={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const CARD_GAP = 12;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: normalize(16) },
  filterRow: {
    marginTop: normalize(12),
    marginBottom: normalize(10),
  },
  countryPickerWrap: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderRadius: normalize(12),
    overflow: "hidden",
    marginBottom: normalize(12),
  },
  searchBox: {
    borderWidth: 1,
    borderColor: "#d4d5d7",
    borderRadius: normalize(12),
    paddingHorizontal: normalize(15),
    marginBottom: normalize(14),
  },
  searchInput: {
    fontSize: normalize(20),
    fontFamily: getFontFamily("400"),
    color: "#1A1A1A",
    paddingVertical: normalize(15),
  },
  listContent: {
    paddingBottom: normalize(32),
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  brandCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: normalize(12),
    padding: normalize(12),
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 8,
  },
  brandLogo: {
    width: "100%",
    height: normalize(70),
    borderRadius: 8,
  },
  brandLogoPlaceholder: {
    width: "100%",
    height: normalize(70),
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogoInitial: {
    fontSize: normalize(28),
    fontFamily: getFontFamily("800"),
    color: COLORS.primary,
  },
  brandName: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("800"),
    color: "#1A1A1A",
    textAlign: "center",
    textTransform: "uppercase",
  },
  emptyState: {
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: normalize(19),
    fontFamily: getFontFamily("400"),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
