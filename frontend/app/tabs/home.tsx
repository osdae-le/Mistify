import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRealtimeValue from "../../hook/useRealtimeValue"; // ✅ realtime hook

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [name, setName] = useState("");

  const latestTemp = useRealtimeValue("temperatureData");
  const latestHumid = useRealtimeValue("humidityData");
  const latestLight = useRealtimeValue("lightData");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadName = async () => {
      try {
        let storedName = "";
        if (Platform.OS === "web") {
          storedName = localStorage.getItem("userName") || "";
        } else {
          const asyncName = await AsyncStorage.getItem("userName");
          storedName = asyncName || "";
        }
        setName(storedName);
      } catch (err) {
        console.error("❌ Failed to load user name:", err);
      }
    };

    loadName();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>Hi {name.trim() || "there"}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileImage}>
              <Ionicons name="happy-outline" size={28} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Location Card */}
        <TouchableOpacity style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <Ionicons name="home" size={35} color="white" />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationTitle}>Ho Chi Minh City</Text>
              <Text style={styles.locationAddress}>268 Ly Thuong Kiet</Text>
            </View>
          </View>
          <View style={styles.locationDetails}>
            <View style={styles.dateTimeContainer}>
              <Ionicons name="calendar-outline" size={20} color="white" />
              <Text style={styles.dateTimeText}>{currentTime.toLocaleDateString()}</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <Ionicons name="time-outline" size={20} color="white" />
              <Text style={styles.dateTimeText}>{currentTime.toLocaleTimeString()}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Category Icons */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryItem}>
            <View style={styles.iconWrapper}>
              <Ionicons name="thermometer-outline" size={28} color="#E53935" />
            </View>
            <Text style={styles.categoryLabel}>Temperature</Text>
          </View>

          <View style={styles.categoryItem}>
            <View style={styles.iconWrapper}>
              <Ionicons name="water-outline" size={28} color="#1E88E5" />
            </View>
            <Text style={styles.categoryLabel}>Humidity</Text>
          </View>

          <View style={styles.categoryItem}>
            <View style={styles.iconWrapper}>
              <Ionicons name="sunny-outline" size={28} color="#FFA726" />
            </View>
            <Text style={styles.categoryLabel}>Brightness</Text>
          </View>
        </View>

        {/* Control Panel */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Control panel</Text>

          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Temperature</Text>
            <Text style={styles.dataValue}>{latestTemp !== null ? `${latestTemp} °C` : "-- °C"}</Text>
            <Text style={styles.dataNote}>So với hôm qua</Text>
          </View>

          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Humidity</Text>
            <Text style={styles.dataValue}>{latestHumid !== null ? `${latestHumid} %` : "-- %"}</Text>
            <Text style={styles.dataNote}>So với hôm qua</Text>
          </View>

          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Brightness</Text>
            <Text style={styles.dataValue}>{latestLight !== null ? `${latestLight} lux` : "-- lux"}</Text>
            <Text style={styles.dataNote}>So với hôm qua</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 50,
  },
  greeting: {
    fontSize: 20,
    color: "#666",
  },
  userName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
  },
  profileButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: "#FFA500",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 30,
    marginLeft: 30,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  locationCard: {
    backgroundColor: "#1a237e",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  locationTextContainer: {
    marginLeft: 15,
  },
  locationTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  locationAddress: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
  },
  locationDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    color: "white",
    fontSize: 14,
    marginLeft: 5,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    marginTop: 12,
  },
  categoryItem: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 35,
    padding: 12,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    marginTop: 6,
    fontSize: 14,
    color: "#333",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  dataContainer: {
    marginBottom: 5,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
  },
  dataTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  dataValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  dataNote: {
    fontSize: 14,
    color: "#FFA500",
    marginTop: 5,
  },
});
