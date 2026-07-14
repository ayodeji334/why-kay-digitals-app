import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#6c6c6c",
        tabBarStyle: { height: 78, paddingTop: 4 },
        headerTitleAllowFontScaling: false,
        tabBarAllowFontScaling: false,
        headerTitleStyle: {
          fontFamily: getFontFamily(700),
          fontSize: normalize(18),
          padding: 20,
        },
        tabBarLabelStyle: {
          fontFamily: getFontFamily(700),
          fontSize: normalize(17),
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
          headerShown: false,
          headerTitleAllowFontScaling: false,
        }}
      />
      <Tab.Screen
        name="Wallets"
        component={WalletScreen}
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
  );
}
