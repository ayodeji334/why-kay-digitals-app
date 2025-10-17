import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { normalize } from "../../constants/settings";
import {
  ArrowDown,
  ArrowUp,
  CallCalling,
  Flash,
  Gift,
  Monitor,
  TickCircle,
  Wifi,
} from "iconsax-react-nativejs";
import { useNavigation } from "@react-navigation/native";

const ServicesSection = () => {
  const navigation = useNavigation();
  const mainServices: Array<{
    id: number;
    title: string;
    icon: React.JSX.Element;
    screenName: string;
  }> = [
    {
      id: 3,
      title: "Sell Crypto",
      icon: <ArrowUp size="19" />,
      screenName: "",
    },
    {
      id: 4,
      title: "Buy Crypto",
      icon: <ArrowDown size="19" />,
      screenName: "",
    },
    {
      id: 5,
      title: "Swap",
      screenName: "",
      icon: <TickCircle size="19" color="#000" />,
    },
    {
      id: 6,
      title: "Buy Giftcards",
      icon: <Gift size="19" color="#000" />,
      screenName: "",
    },
    {
      id: 7,
      title: "Airtime",
      screenName: "BuyAirtime",
      icon: <CallCalling size="19" color="#000" />,
    },
    {
      id: 73,
      title: "Data",
      screenName: "BuyData",
      icon: <Wifi size="19" color="#000" />,
    },
    {
      id: 790,
      screenName: "PayElectricityBills",
      title: "Electricity Bills",
      icon: <Flash size="19" color="#000" />,
    },
    {
      id: 8,
      title: "Cable Tv",
      screenName: "PayCableTVSubscription",
      icon: <Monitor size="19" color="#000" />,
    },
  ];

  const handleNavigation = (service: {
    id: number;
    title: string;
    icon: React.JSX.Element;
    screenName: string;
  }) => {
    if (service.screenName == "") {
      Alert.alert(
        "Coming Soon",
        "The screen is not available for now. Kindly check back later",
      );
      return;
    }
    navigation.navigate(service.screenName as never);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.servicesGrid}>
        {mainServices.map(service => (
          <TouchableOpacity
            activeOpacity={0.8}
            key={service.id}
            onPress={() => handleNavigation(service)}
            style={styles.serviceItem}
          >
            <View style={styles.iconContainer}>{service.icon}</View>
            <Text style={styles.serviceText}>{service.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 20,
    gap: 14,
    rowGap: 0,
  },
  serviceItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#EFF7EC",
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
    fontSize: normalize(13),
    textAlign: "center",
    color: "#333",
    fontWeight: "500",
    paddingBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  descriptionSection: {
    paddingVertical: 16,
  },
  subServicesSection: {
    paddingVertical: 16,
  },
  subServiceCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: normalize(14),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  subServiceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  subServiceText: {
    fontSize: normalize(13),
    color: "#333",
  },
  finalDescription: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  finalDescriptionText: {
    fontSize: normalize(12),
    color: "#666",
    fontStyle: "italic",
  },
});

export default ServicesSection;
