// import React from "react";
// import {
//   View,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { getFontFamily, normalize } from "../../constants/settings";
// import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import { COLORS } from "../../constants/colors";
// import CustomIcon from "../CustomIcon";
// import {
//   SellCryptoIcon,
//   BuyCryptoIcon,
//   SwapIcon,
//   GiftCardIcon,
//   AirtimeIcon,
//   DataIcon,
//   ElectricityBillIcon,
//   CableTVIcon,
//   TransferIcon,
// } from "../../assets";
// import { useQueryClient } from "@tanstack/react-query";
// import { TradeIntent } from "../../libs/types";
// import { Dribbble } from "iconsax-react-nativejs";
// import { AppText } from "../AppText";

// const ServicesSection = () => {
//   const queryClient = useQueryClient();
//   const navigation: any = useNavigation();
//   const mainServices: Array<{
//     id: number;
//     title: string;
//     icon: React.JSX.Element;
//     screenName: string;
//     action?: TradeIntent["action"];
//   }> = [
//     {
//       id: 3,
//       title: "Sell Crypto",
//       icon: (
//         <CustomIcon source={SellCryptoIcon} size={20} color={COLORS.primary} />
//       ),
//       screenName: "SelectAsset",
//       action: "sell",
//     },
//     {
//       id: 4,
//       title: "Buy Crypto",
//       icon: (
//         <CustomIcon source={BuyCryptoIcon} size={24} color={COLORS.primary} />
//       ),
//       screenName: "SelectAsset",
//       action: "buy",
//     },
//     {
//       id: 40,
//       title: "Transfer",
//       icon: (
//         <CustomIcon source={TransferIcon} size={24} color={COLORS.primary} />
//       ),
//       screenName: "Transfer",
//     },
//     {
//       id: 5,
//       title: "Swap",
//       screenName: "SwapCrypto",
//       icon: <CustomIcon source={SwapIcon} size={24} color={COLORS.primary} />,
//     },
//     {
//       id: 6,
//       title: "Buy Giftcards",
//       icon: (
//         <CustomIcon source={GiftCardIcon} size={24} color={COLORS.primary} />
//       ),
//       screenName: "BuyGiftCard",
//     },
//     {
//       id: 7,
//       title: "Airtime",
//       screenName: "BuyAirtime",
//       icon: (
//         <CustomIcon source={AirtimeIcon} size={28} color={COLORS.primary} />
//       ),
//     },
//     {
//       id: 73,
//       title: "Data",
//       screenName: "BuyData",
//       icon: <CustomIcon source={DataIcon} size={20} color={COLORS.primary} />,
//     },
//     {
//       id: 790,
//       screenName: "PayElectricityBills",
//       title: "Electricity Bills",
//       icon: (
//         <CustomIcon
//           source={ElectricityBillIcon}
//           size={24}
//           color={COLORS.primary}
//         />
//       ),
//     },
//     {
//       id: 799,
//       screenName: "FundBettingAccount",
//       title: "Betting",
//       icon: (
//         <Dribbble
//           // source={ElectricityBillIcon}
//           size={24}
//           color={COLORS.primary}
//         />
//       ),
//     },
//     {
//       id: 8,
//       title: "Cable Tv",
//       screenName: "PayCableTVSubscription",
//       icon: (
//         <CustomIcon source={CableTVIcon} size={25} color={COLORS.primary} />
//       ),
//     },
//   ];

//   const handleNavigation = (service: (typeof mainServices)[0]) => {
//     if (!service.screenName) {
//       Alert.alert(
//         "Coming Soon",
//         "The screen is not available for now. Kindly check back later",
//       );
//       return;
//     }

//     // Navigate with intent for Buy/Sell Crypto
//     if (service.action === "buy" || service.action === "sell") {
//       navigation.navigate(
//         service.screenName as never,
//         {
//           action: service.action,
//           source: "home",
//         } as never,
//       );
//       return;
//     }

//     // Default navigation for other screens
//     navigation.navigate(service.screenName as never);
//   };

//   useFocusEffect(() => {
//     queryClient.prefetchQuery({ queryKey: ["supported-pairs"] });
//     queryClient.prefetchQuery({ queryKey: ["electricityProviders"] });
//     queryClient.prefetchQuery({ queryKey: ["user-wallets"] });
//     queryClient.prefetchQuery({ queryKey: ["assets"] });
//   });

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       <View style={styles.servicesGrid}>
//         {mainServices.map(service => (
//           <TouchableOpacity
//             hitSlop={30}
//             activeOpacity={0.89}
//             key={service.id}
//             onPress={() => handleNavigation(service)}
//             style={styles.serviceItem}
//           >
//             <View style={styles.iconContainer}>{service.icon}</View>
//             <AppText style={styles.serviceText}>{service.title}</AppText>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, marginBottom: 20 },
//   servicesGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "flex-start",
//     columnGap: 15,
//     rowGap: 15,
//   },
//   serviceItem: {
//     minWidth: "30%",
//     alignItems: "center",
//     backgroundColor: "#EFF7EC",
//     padding: 5,
//     borderRadius: 10,
//     justifyContent: "space-between",
//   },
//   iconContainer: {
//     width: 40,
//     height: 40,
//     padding: 10,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   serviceText: {
//     fontSize: normalize(18),
//     fontFamily: getFontFamily(800),
//     textAlign: "center",
//     color: "#333",
//     paddingBottom: 10,
//   },
// });

// export default ServicesSection;
import React from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { getFontFamily, normalize } from "../../constants/settings";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CustomIcon from "../CustomIcon";
import {
  SellCryptoIcon,
  BuyCryptoIcon,
  SwapIcon,
  GiftCardIcon,
  AirtimeIcon,
  DataIcon,
  ElectricityBillIcon,
  CableTVIcon,
  TransferIcon,
} from "../../assets";
import { useQueryClient } from "@tanstack/react-query";
import { TradeIntent } from "../../libs/types";
import { Dribbble } from "iconsax-react-nativejs";
import { AppText } from "../AppText";
import { useColors } from "../../hooks/useTheme";

const ServicesSection = () => {
  const queryClient = useQueryClient();
  const navigation: any = useNavigation();
  const colors = useColors();
  const styles = makeStyles(colors);

  const mainServices: Array<{
    id: number;
    title: string;
    icon: React.JSX.Element;
    screenName: string;
    action?: TradeIntent["action"];
  }> = [
    {
      id: 3,
      title: "Sell Crypto",
      icon: (
        <CustomIcon source={SellCryptoIcon} size={20} color={colors.primary} />
      ),
      screenName: "SelectAsset",
      action: "sell",
    },
    {
      id: 4,
      title: "Buy Crypto",
      icon: (
        <CustomIcon source={BuyCryptoIcon} size={24} color={colors.primary} />
      ),
      screenName: "SelectAsset",
      action: "buy",
    },
    {
      id: 40,
      title: "Transfer",
      icon: (
        <CustomIcon source={TransferIcon} size={24} color={colors.primary} />
      ),
      screenName: "Transfer",
    },
    {
      id: 5,
      title: "Swap",
      screenName: "SwapCrypto",
      icon: <CustomIcon source={SwapIcon} size={24} color={colors.primary} />,
    },
    {
      id: 6,
      title: "Buy Giftcards",
      icon: (
        <CustomIcon source={GiftCardIcon} size={24} color={colors.primary} />
      ),
      screenName: "BuyGiftCard",
    },
    {
      id: 7,
      title: "Airtime",
      screenName: "BuyAirtime",
      icon: (
        <CustomIcon source={AirtimeIcon} size={28} color={colors.primary} />
      ),
    },
    {
      id: 73,
      title: "Data",
      screenName: "BuyData",
      icon: <CustomIcon source={DataIcon} size={20} color={colors.primary} />,
    },
    {
      id: 790,
      screenName: "PayElectricityBills",
      title: "Electricity Bills",
      icon: (
        <CustomIcon
          source={ElectricityBillIcon}
          size={24}
          color={colors.primary}
        />
      ),
    },
    {
      id: 799,
      screenName: "FundBettingAccount",
      title: "Betting",
      icon: <Dribbble size={24} color={colors.primary} />,
    },
    {
      id: 8,
      title: "Cable Tv",
      screenName: "PayCableTVSubscription",
      icon: (
        <CustomIcon source={CableTVIcon} size={25} color={colors.primary} />
      ),
    },
  ];

  const handleNavigation = (service: (typeof mainServices)[0]) => {
    if (!service.screenName) {
      Alert.alert(
        "Coming Soon",
        "The screen is not available for now. Kindly check back later",
      );
      return;
    }

    if (service.action === "buy" || service.action === "sell") {
      navigation.navigate(
        service.screenName as never,
        {
          action: service.action,
          source: "home",
        } as never,
      );
      return;
    }

    navigation.navigate(service.screenName as never);
  };

  useFocusEffect(() => {
    queryClient.prefetchQuery({ queryKey: ["supported-pairs"] });
    queryClient.prefetchQuery({ queryKey: ["electricityProviders"] });
    queryClient.prefetchQuery({ queryKey: ["user-wallets"] });
    queryClient.prefetchQuery({ queryKey: ["assets"] });
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.servicesGrid}>
        {mainServices.map(service => (
          <TouchableOpacity
            hitSlop={30}
            activeOpacity={0.89}
            key={service.id}
            onPress={() => handleNavigation(service)}
            style={styles.serviceItem}
          >
            <View style={styles.iconContainer}>{service.icon}</View>
            <AppText style={styles.serviceText}>{service.title}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, marginBottom: 20 },
    servicesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      columnGap: 15,
      rowGap: 15,
    },
    serviceItem: {
      minWidth: "30%",
      alignItems: "center",
      backgroundColor: colors.infoCardBackgroundColor,
      padding: 5,
      borderRadius: 10,
      justifyContent: "space-between",
    },
    iconContainer: {
      width: 40,
      height: 40,
      padding: 10,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    serviceText: {
      fontSize: normalize(18),
      fontFamily: getFontFamily(800),
      textAlign: "center",
      color: colors.text,
      paddingBottom: 10,
    },
  });

export default ServicesSection;
