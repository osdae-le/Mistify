import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

const tabs = ["Brightness", "Setting", "Temperature", "Humidity"];
const screenWidth = Dimensions.get("window").width;

// 👇 Sửa dòng này
interface SettingTabProps {
  onSelect: (tab: string) => void;
}

const SettingTab: React.FC<SettingTabProps> = ({ onSelect }) => {
  const [selectedTab, setSelectedTab] = useState("Setting");
  const scrollViewRef = useRef<ScrollView>(null);

  const handlePress = (tab: string, index: number) => {
    setSelectedTab(tab);
    onSelect(tab);

    const tabWidth = screenWidth / 3;
    const offset = index * tabWidth - screenWidth / 2 + tabWidth / 2;

    scrollViewRef.current?.scrollTo({ x: offset, animated: true });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.selectedTab]}
            onPress={() => handlePress(tab, index)}
          >
            <Text style={[styles.text, selectedTab === tab && styles.selectedText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedTab: {
    backgroundColor: "#63B4FF1A",
  },
  text: {
    fontSize: 16,
    color: "#8696BB",
  },
  selectedText: {
    color: "#4894FE",
    fontWeight: "bold",
  },
});

export default SettingTab;
