import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../../firebaseConfig"

export default function PersonalScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [name, setName] = useState("")

  const toggleSwitch = () => setNotificationsEnabled(previousState => !previousState)

  const handleLogout = async () => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem("userToken")
        localStorage.removeItem("userName")
      } else {
        await AsyncStorage.multiRemove(["userToken", "userName"])
      }
      router.replace("/")
    } catch (err) {
      console.error("❌ Logout failed:", err)
    }
  }

  const handleChangePassword = async () => {
    try {
      const user = auth.currentUser
      if (!user?.email) {
        return Alert.alert("Error", "No logged in user or missing email.")
      }

      await sendPasswordResetEmail(auth, user.email)
      Alert.alert("Email sent", "Check your email to reset your password.")
    } catch (error: any) {
      console.error("❌ Change password error:", error)
      Alert.alert("Error", error.message || "Something went wrong.")
    }
  }

  useEffect(() => {
    const loadName = async () => {
      try {
        let storedName = ""
        if (Platform.OS === "web") {
          storedName = localStorage.getItem("userName") || ""
        } else {
          const asyncName = await AsyncStorage.getItem("userName")
          storedName = asyncName || ""
        }
        setName(storedName)
      } catch (err) {
        console.error("❌ Failed to load user name:", err)
      }
    }

    loadName()
  }, [])

  return (
    <ScrollView style={styles.container}>
      {/* Profile Bar */}
      <View style={styles.profileBar}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={48} color="white" />
        </View>
        <View>
          <Text style={styles.profileName}>{name ? name : "User"}</Text>
          <Text style={styles.profileLocation}>268 Ly Thuong Kiet</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconWrapper}>
            <Ionicons name="person-outline" size={20} color="#4a4a4a" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>My Account</Text>
            <Text style={styles.settingDescription}>Make changes to your account</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
          <View style={styles.settingIconWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#4a4a4a" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Change password</Text>
            <Text style={styles.settingDescription}>Change your password</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingIconWrapper}>
            <Ionicons name="notifications-outline" size={20} color="#4a4a4a" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Allow notifications</Text>
            <Text style={styles.settingDescription}>Allow device notifications</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={toggleSwitch} />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconWrapper}>
            <Ionicons name="language-outline" size={20} color="#4a4a4a" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Language</Text>
            <Text style={styles.settingDescription}>Change the language to match your preference</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingIconWrapper}>
            <Ionicons name="log-out-outline" size={20} color="#4a4a4a" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Log out</Text>
            <Text style={styles.settingDescription}>Further secure your account for safety</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* More */}
      <View style={styles.moreContainer}>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIconWrapper}>
            <Ionicons name="help-circle-outline" size={20} color="#4a4a4a" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 20,
  },
  profileBar: {
    backgroundColor: "#0D1EB5",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  avatarContainer: {
    marginRight: 12,
  },
  profileName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileLocation: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
  },
  settingsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingIconWrapper: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  moreContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
  },
})
