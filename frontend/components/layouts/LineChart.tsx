import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

const LineChartCard = ({
    title = "Temperature Chart (24 hours)",
    labels = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00"],
    datasets = [{ data: [25, 28, 30, 35, 32, 31, 33] }]}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: datasets,
        }}
        width={380}
        height={200}
        chartConfig={chartConfig}
        bezier
      />
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  decimalPlaces: 2,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: 380,
    alignItems: "center",
    marginVertical: 10,
    paddingRight: 40,
    overflow: "hidden"
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
});

export default LineChartCard;