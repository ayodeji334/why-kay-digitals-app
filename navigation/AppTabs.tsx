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
        tabBarActiveTintColor: "#03001A",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 60 },
        headerTitleStyle: {
          fontFamily: getFontFamily(700),
          fontSize: normalize(18),
        },
        tabBarLabelStyle: {
          fontFamily: getFontFamily(800),
          fontSize: normalize(14),
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
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Wallet
              variant={focused ? "Bold" : "Outline"}
              size={size}
              color={color}
            />
          ),
          header: () => (
            <CustomHeader showBack={false} showTitle={true} title="Wallets" />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionHistoryScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Graph
              variant={focused ? "Bold" : "Outline"}
              size={size}
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
              size={size}
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
              size={size}
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
