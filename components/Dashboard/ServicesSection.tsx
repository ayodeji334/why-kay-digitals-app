import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import {
  getFontFamily,
  normalize,
  normalizeSpacing,
} from "../../constants/settings";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CustomIcon from "../CustomIcon";
import {
  SellCryptoIcon,
  BuyCryptoIcon,
  SwapIcon,
  AirtimeIcon,
  DataIcon,
  ElectricityBillIcon,
  CableTVIcon,
  TransferIcon,
  GiftCardIcon,
} from "../../assets";
import { useQueryClient } from "@tanstack/react-query";
import { TradeIntent } from "../../libs/types";
import { Dribbble } from "iconsax-react-nativejs";
import { AppText } from "../AppText";
import { useColors } from "../../hooks/useTheme";
import { usePhoneVerification } from "../../hooks/usePhoneVerification";
import HalfScreenModal from "../HalfScreenModal";
import { useUser } from "../../stores/authSlice";
import { useLiveChat } from "../../context/LiveChatProvider";

const ServicesSection = () => {
  const queryClient = useQueryClient();
  const navigation: any = useNavigation();
  const colors = useColors();
  const styles = makeStyles(colors);

  const user = useUser();
  const { isPhoneVerified } = usePhoneVerification();
  const { openLiveChat } = useLiveChat();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  const [showTierModal, setShowTierModal] = useState(false);

  const isSuspended = user?.status === "SUSPEND";
  const isTierOne = user?.tier_level === "TIER_1";

  const handleUpgradeTier = () => {
    setShowTierModal(false);
    setTimeout(() => navigation.navigate("Verification" as never), 600);
  };

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

  const handleVerifyNow = () => {
    setShowPhoneModal(false);
    setTimeout(
      () => navigation.navigate("PhoneNumberVerification" as never),
      600,
    );
  };

  const handleOpenSupportChat = () => {
    setShowSuspendedModal(false);
    openLiveChat();
  };

  const handleNavigation = (service: (typeof mainServices)[0]) => {
    if (isSuspended) {
      setShowSuspendedModal(true);
      return;
    }

    if (!isPhoneVerified) {
      setShowPhoneModal(true);
      return;
    }

    if (service.screenName === "BuyGiftCard" && isTierOne) {
      setShowTierModal(true);
      return;
    }

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
        { action: service.action, source: "home" } as never,
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
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View>
          <AppText
            style={{
              fontFamily: getFontFamily(800),
              fontSize: normalize(18),
              marginVertical: 10,
            }}
          >
            Quick Actions
          </AppText>
        </View>
        <View style={styles.servicesGrid}>
          {chunk(mainServices, GRID_COLUMNS).map((row, rowIndex) => (
            <View key={rowIndex} style={styles.servicesRow}>
              {row.map(service => (
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
              {/* Invisible spacers keep a short last row's tiles the same width */}
              {Array.from({ length: GRID_COLUMNS - row.length }, (_, i) => (
                <View key={`spacer-${i}`} style={styles.serviceSpacer} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

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

      <HalfScreenModal
        isVisible={showSuspendedModal}
        onClose={() => setShowSuspendedModal(false)}
        title="Account Suspended"
        description="Your account has been suspended. Please contact support for help getting this resolved."
        buttonText="Chat with Support"
        actionButton={handleOpenSupportChat}
        secondaryButtonText="Cancel"
        secondaryAction={() => setShowSuspendedModal(false)}
        showCloseButton
      />

      <HalfScreenModal
        isVisible={showTierModal}
        onClose={() => setShowTierModal(false)}
        title="Upgrade Required"
        description="Buying gift cards isn't available on your current account tier. Upgrade your account to unlock this service."
        buttonText="Upgrade Account"
        actionButton={handleUpgradeTier}
        secondaryButtonText="Maybe later"
        secondaryAction={() => setShowTierModal(false)}
        showCloseButton
      />
    </>
  );
};

const GRID_COLUMNS = 3;
const GRID_GAP = 15;

// Splits items into rows of `size` (the last row may be shorter).
const chunk = <T,>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  );

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, marginBottom: normalizeSpacing(20) },
    servicesGrid: {
      rowGap: GRID_GAP,
    },
    // Each row shares its width equally between GRID_COLUMNS tiles, so there
    // are always exactly three per row, flush with both edges.
    servicesRow: {
      flexDirection: "row",
      columnGap: GRID_GAP,
    },
    serviceSpacer: {
      flex: 1,
    },
    serviceItem: {
      flex: 1,
      paddingHorizontal: normalizeSpacing(6),
      alignItems: "center",
      backgroundColor: colors.infoCardBackgroundColor,
      paddingVertical: normalizeSpacing(15),
      borderRadius: 10,
      justifyContent: "space-between",
    },
    iconContainer: {
      width: 40,
      height: 40,
      padding: normalizeSpacing(10),
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    serviceText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily(800),
      textAlign: "center",
      color: colors.text,
    },
  });

export default ServicesSection;
