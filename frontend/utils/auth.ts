import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

export const checkAuth = async () => {
  try {
    if (Platform.OS === "web") {
      const token = localStorage.getItem("userToken")
      return !!token
    } else {
      const token = await AsyncStorage.getItem("userToken")
      return !!token
    }
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra token:", error)
    return false
  }
}
