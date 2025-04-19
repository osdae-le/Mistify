import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { G, Line } from "react-native-svg";

const HumidityGauge = ({ city = "Ho Chi Minh City", humidity = 80 }) => {
  const totalTicks = 30;
  const activeTicks = Math.round((humidity / 100) * totalTicks);
  const radius = 100;
  const angleStep = 180 / totalTicks;

  return (
    <View style={styles.container}>
      <Text style={styles.city}>{city}</Text>
      <Svg width={radius * 2} height={radius} viewBox={`0 0 ${radius * 2} ${radius}`}>
        <G transform={`translate(${radius}, ${radius})`}>
          {Array.from({ length: totalTicks }).map((_, index) => {
            const angle = 183 + index * angleStep;
            const isActive = index < activeTicks;
            const x1 = radius * Math.cos((angle * Math.PI) / 180);
            const y1 = radius * Math.sin((angle * Math.PI) / 180);
            const x2 = (radius - 15) * Math.cos((angle * Math.PI) / 180);
            const y2 = (radius - 15) * Math.sin((angle * Math.PI) / 180);

            return (
              <Line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? "#2E3192" : "#E0E3EB"}
                strokeWidth="4"
              />
            );
          })}
        </G>
      </Svg>
      <Text style={styles.humidity}>{humidity}%</Text>
      <Text style={styles.label}>Humidity</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: 380,
    alignItems: "center",
    marginVertical: 10,
    paddingRight: 40,
    overflow: "hidden"
  },
  city: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: 30,
  },
  humidity: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E3192",
    marginTop: -50,
  },
  label: {
    fontSize: 16,
    color: "#7D8EA8",
  },
});

export default HumidityGauge;
