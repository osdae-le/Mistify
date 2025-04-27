import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingCardProps {
  title: string;
  description: string;
  buttonText?: string;
}

const SettingCardDefault: React.FC<SettingCardProps> = ({ title, description, buttonText }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <View style={styles.card}>
      {/* Icon + Title */}
      <View style={styles.header}>
        <View style={styles.icon} />
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Status + Toggle */}
      <View style={styles.statusRow}>
        <View style={styles.status}>
          <Ionicons name="calendar-outline" size={18} color="#7B8DAB" />
          <Text style={styles.statusText}> Status: <Text style={{ fontWeight: "bold",color: isEnabled ? "#4CAF50" : "#F44336", fontSize: 16 }}>{isEnabled ? "On" : "Off"}</Text></Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={() => setIsEnabled(!isEnabled)}
          trackColor={{ false: "#E5E7EB", true: "#2AD9D0" }}
          thumbColor="#fff"
        />
      </View>

      {/* Button */}
      {buttonText && (
        <>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginVertical: 5,
    marginLeft: 10,
    marginRight: 10,
    width: "96%"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E4E7EB",
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  description: {
    fontSize: 16,
    color: "#7B8DAB",
  },
  separator: {
    height: 0.5,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
    marginBottom: 15
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {

    flexDirection: "row",
    alignItems: "center",
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 5,
    color: "#7B8DAB",
  },
  button: {
    marginTop: 15,
    backgroundColor: "#63B4FF1A",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#4894FE",
    fontWeight: 600,
  },
});

export default SettingCardDefault;