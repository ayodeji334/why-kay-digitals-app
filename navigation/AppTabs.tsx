// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import HomeScreen from "../screens/HomeScreen";
// import {
//   Graph,
//   Home,
//   PercentageCircle,
//   Setting,
//   Wallet,
// } from "iconsax-react-nativejs";
// import SettingsScreen from "../screens/SettingsScreen";
// import TransactionHistoryScreen from "../screens/TransactionHistory";
// import RatesScreen from "../screens/Rates";
// import WalletScreen from "../screens/WalletScreen";
// import CustomHeader from "../components/CustomHeader";
// import { getFontFamily, normalize } from "../constants/settings";
// import { useColors } from "../hooks/useTheme";

// const Tab = createBottomTabNavigator();

// export default function AppTabs() {
//   const colors = useColors();

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: colors?.text,
//         tabBarInactiveTintColor: colors?.textMuted,
//         tabBarStyle: {
//           height: 90,
//           paddingVertical: 4,
//           backgroundColor: colors.background,
//           borderTopColor: colors.borderLight,
//         },
//         headerTitleAllowFontScaling: false,
//         tabBarAllowFontScaling: false,
//         headerBackgroundContainerStyle: {
//           backgroundColor: colors.background,
//         },
//         headerTitleStyle: {
//           fontFamily: getFontFamily(700),
//           fontSize: normalize(18),
//           padding: 20,
//           color: colors.text,
//         },
//         tabBarLabelStyle: {
//           fontFamily: getFontFamily(700),
//           fontSize: normalize(17),
//           color: colors.text,
//         },
//       }}
//     >
//       <Tab.Screen
//         name="Home"
//         component={HomeScreen}
//         options={{
//           tabBarIcon: ({ color, size, focused }) => (
//             <Home
//               variant={focused ? "Bold" : "Outline"}
//               size={21}
//               color={color}
//             />
//           ),
//           header: () => (
//             <CustomHeader
//               showBack={false}
//               showTitle={false}
//               title="My Wallets"
//             />
//           ),
//           headerTitleAllowFontScaling: false,
//         }}
//       />
//       <Tab.Screen
//         name="Wallets"
//         component={WalletScreen}
//         options={{
//           tabBarIcon: ({ color, size, focused }) => (
//             <Wallet
//               variant={focused ? "Bold" : "Outline"}
//               size={21}
//               color={color}
//             />
//           ),
//           header: () => (
//             <CustomHeader
//               showBack={false}
//               showTitle={true}
//               title="My Wallets"
//             />
//           ),
//           headerTitleAllowFontScaling: false,
//         }}
//       />
//       <Tab.Screen
//         name="Transactions"
//         component={TransactionHistoryScreen}
//         options={{
//           tabBarIcon: ({ color, size, focused }) => (
//             <Graph
//               variant={focused ? "Bold" : "Outline"}
//               size={21}
//               color={color}
//             />
//           ),
//           header: () => (
//             <CustomHeader
//               showBack={false}
//               showTitle={true}
//               title="Transactions History"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Rates"
//         component={RatesScreen}
//         options={{
//           tabBarIcon: ({ color, size, focused }) => (
//             <PercentageCircle
//               variant={focused ? "Bold" : "Outline"}
//               size={21}
//               color={color}
//             />
//           ),
//           header: () => (
//             <CustomHeader showBack={false} showTitle={true} title="Rates" />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Settings"
//         component={SettingsScreen}
//         options={{
//           tabBarIcon: ({ color, size, focused }) => (
//             <Setting
//               variant={focused ? "Bold" : "Outline"}
//               size={21}
//               color={color}
//             />
//           ),
//           header: () => (
//             <CustomHeader
//               showBack={false}
//               showTitle={true}
//               title="Account Setting"
//             />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }
import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import {
  Graph,
  Home,
  PercentageCircle,
  Setting,
  Wallet,
} from "iconsax-react-nativejs";
import SettingsScreen from "../screens/SettingsScreen";
import TransactionHistoryScreen from "../screens/TransactionHistory";
import RatesScreen from "../screens/Rates";
import WalletScreen from "../screens/WalletScreen";
import CustomHeader from "../components/CustomHeader";
import { getFontFamily, normalize } from "../constants/settings";
import { useColors } from "../hooks/useTheme";
import { useUser } from "../stores/authSlice";
import HalfScreenModal from "../components/HalfScreenModal";
import { COLORS } from "../constants/colors";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const colors = useColors();
  const user = useUser();
  const navigation: any = useNavigation();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const isPhoneVerified = !!user?.phone_verified_at;

  const guardTabPress = (e: any) => {
    if (!isPhoneVerified) {
      e.preventDefault();
      setShowPhoneModal(true);
    }
  };

  const handleVerifyNow = () => {
    setShowPhoneModal(false);
    navigation.navigate("PhoneNumberVerification" as never);
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors?.text,
          tabBarInactiveTintColor: colors?.textMuted,
          tabBarStyle: {
            height: 90,
            paddingVertical: 4,
            backgroundColor: colors.background,
            borderTopColor: colors.borderLight,
          },
          headerTitleAllowFontScaling: false,
          tabBarAllowFontScaling: false,
          headerBackgroundContainerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontFamily: getFontFamily(700),
            fontSize: normalize(18),
            padding: 20,
            color: colors.text,
          },
          tabBarLabelStyle: {
            fontFamily: getFontFamily(700),
            fontSize: normalize(17),
            color: colors.text,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Home
                variant={focused ? "Bold" : "Outline"}
                size={21}
                color={color}
              />
            ),
            header: () => (
              <CustomHeader
                showBack={false}
                showTitle={false}
                title="My Wallets"
              />
            ),
            headerTitleAllowFontScaling: false,
          }}
        />
        <Tab.Screen
          name="Wallets"
          component={WalletScreen}
          listeners={{
            tabPress: guardTabPress,
          }}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Wallet
                variant={focused ? "Bold" : "Outline"}
                size={21}
                color={color}
              />
            ),
            header: () => (
              <CustomHeader
                showBack={false}
                showTitle={true}
                title="My Wallets"
              />
            ),
            headerTitleAllowFontScaling: false,
          }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionHistoryScreen}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Graph
                variant={focused ? "Bold" : "Outline"}
                size={21}
                color={color}
              />
            ),
            header: () => (
              <CustomHeader
                showBack={false}
                showTitle={true}
                title="Transactions History"
              />
            ),
          }}
        />
        <Tab.Screen
          name="Rates"
          component={RatesScreen}
          listeners={{
            tabPress: guardTabPress,
          }}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <PercentageCircle
                variant={focused ? "Bold" : "Outline"}
                size={21}
                color={color}
              />
            ),
            header: () => (
              <CustomHeader showBack={false} showTitle={true} title="Rates" />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Setting
                variant={focused ? "Bold" : "Outline"}
                size={21}
                color={color}
              />
            ),
            header: () => (
              <CustomHeader
                showBack={false}
                showTitle={true}
                title="Account Setting"
              />
            ),
          }}
        />
      </Tab.Navigator>

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
    </>
  );
}
