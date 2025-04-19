import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CityCard = ({city = "Ho Chi Minh City", subText = "Current Time", valueText="28°C"}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cityText}>{city}</Text>
      <Text style={styles.subText}>{subText}</Text>
      <Text style={styles.valueText}>{valueText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: 380,
    alignItems: "center",
    marginVertical: 10,
  },
  cityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subText: {
    fontSize: 14,
    color: "#8696BB",
  },
  valueText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
});

export default CityCard;