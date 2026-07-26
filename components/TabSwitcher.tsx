import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { getFontFamily, normalize } from "../constants/settings";
import { AppText } from "./AppText";
import { useColors } from "../hooks/useTheme";

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
  const colors = useColors();
  const styles = makeStyles(colors);

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
          <AppText
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
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.inputBackground,
      borderRadius: 800,
      padding: 4,
      // marginBottom: 20,
    },
    tab: {
      flex: 1,
      paddingVertical: 7,
      paddingHorizontal: 16,
      borderRadius: 600,
      alignItems: "center",
    },
    activeTab: {
      backgroundColor: colors.inputBackground,
      shadowColor: "white",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    tabText: {
      fontSize: normalize(17),
      fontFamily: getFontFamily(800),
      color: colors.text,
      textTransform: "capitalize",
    },
    activeTabText: {
      color: colors.text,
      fontWeight: getFontFamily(800),
      textTransform: "capitalize",
    },
  });

export default TabSwitcher;
