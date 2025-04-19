import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";


const WeeklyChart = ({label = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets = [{ data: [30, 32, 35, 25, 28, 30, 33] }],
    title = "Weekly Average Temperature"}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <BarChart
        data={{
          labels: label,
          datasets: datasets,
        }}
        width={400}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={chartConfig}
        fromZero={true}
        style={{ marginLeft: -20 }}
      />
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  decimalPlaces: 0,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: 380,
    alignItems: "center",
    marginVertical: 10,
    marginBottom: 10,
    paddingRight: 35,
    overflow: "hidden",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
});

export default WeeklyChart;
