import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MessageScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System</Text>
        <View style={{ width: 40 }} /> {/* Placeholder để cân layout */}
      </View>

      {/* Messages */}
      <ScrollView style={styles.messageContainer}>
        <View style={styles.messageCard}>
          <View style={styles.messageTitleContainer}>
            <Ionicons name="warning-outline" size={18} color="#1a237e" style={{ marginRight: 6 }} />
            <Text style={styles.messageTitle}>Warning temperature</Text>
          </View>
          <Text style={styles.messageText}>Temperature has exceeded 30°C. Turn on.</Text>
          <Text style={styles.timestamp}>20/03/2025 - 12:15</Text>
        </View>

        <View style={styles.messageCard}>
          <View style={styles.messageTitleContainer}>
            <Ionicons name="warning-outline" size={18} color="#1a237e" style={{ marginRight: 6 }} />
            <Text style={styles.messageTitle}>Warning humidity</Text>
          </View>
          <Text style={styles.messageText}>Temperature has exceeded 30°C. Turn on.</Text>
          <Text style={styles.timestamp}>20/03/2025 - 10:43</Text>
        </View>

        <View style={styles.messageCard}>
          <View style={styles.messageTitleContainer}>
            <Ionicons name="warning-outline" size={18} color="#1a237e" style={{ marginRight: 6 }} />
            <Text style={styles.messageTitle}>Warning Brightness</Text>
          </View>
          <Text style={styles.messageText}>Temperature has exceeded 30°C. Turn on.</Text>
          <Text style={styles.timestamp}>19/03/2025 - 16:27</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
   header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a237e",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a237e",
    opacity: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  messageContainer: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1a237e",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  messageTitleContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    textAlign: "right",
  },
});

  