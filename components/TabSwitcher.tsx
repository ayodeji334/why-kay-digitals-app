import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { getFontFamily } from "../constants/settings";

export type TabOption = {
  value: string;
  label: string;
};

export type TabSwitcherProps = {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabStyle?: object;
  activeTabStyle?: object;
  tabTextStyle?: object;
  activeTabTextStyle?: object;
  containerStyle?: object;
};

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeTab,
  onTabChange,
  tabStyle = {},
  activeTabStyle = {},
  tabTextStyle = {},
  activeTabTextStyle = {},
  containerStyle = {},
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.value}
          style={[
            styles.tab,
            tabStyle,
            activeTab === tab.value && [styles.activeTab, activeTabStyle],
          ]}
          onPress={() => onTabChange(tab.value)}
        >
          <Text
            style={[
              styles.tabText,
              tabTextStyle,
              activeTab === tab.value && [
                styles.activeTabText,
                activeTabTextStyle,
              ],
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fefdfdff",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: getFontFamily(800),
    color: "#000",
    textTransform: "capitalize",
  },
  activeTabText: {
    color: "#000",
    fontWeight: getFontFamily(800),
    textTransform: "capitalize",
  },
});

export default TabSwitcher;
