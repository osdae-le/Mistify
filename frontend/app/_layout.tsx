import { Slot, useRouter, useSegments, useRootNavigationState } from "expo-router"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

export default function RootLayout() {
  const segments = useSegments()
  const router = useRouter()
  const navigationState = useRootNavigationState()
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)

  // ✅ Kiểm tra token
  const checkAuth = async () => {
    try {
      let token: string | null

      if (Platform.OS === "web") {
        token = localStorage.getItem("userToken")
      } else {
        token = await AsyncStorage.getItem("userToken")
      }

      setIsAuthed(!!token)
    } catch (err) {
      console.error("🚫 Lỗi khi check token:", err)
      setIsAuthed(false)
    }
  }

  // 🔁 Kiểm tra auth khi app mở
  useEffect(() => {
    checkAuth()
  }, [])

  // 📌 Điều hướng nếu cần
  useEffect(() => {
    if (!navigationState?.key || isAuthed === null) return

    const inAuthGroup = segments[0] === "auth"
    const inTabsGroup = segments[0] === "tabs"
    const onHomeScreen = (segments.length === 1 && typeof segments[0] === "undefined")

    if (!isAuthed && onHomeScreen) return

    // Nếu chưa login mà đang ở tabs → đẩy về login
    if (!isAuthed && inTabsGroup) {
      router.replace("/auth/login")
      return
    }

    // Nếu vừa mới login → đẩy vào /tabs/home ngay
    if (isAuthed && inAuthGroup) {
      // 👇 Flag đặt từ login.tsx để báo "vừa login xong"
      if (typeof window !== "undefined" && (window as any).hasJustLoggedIn) {
        (window as any).hasJustLoggedIn = false
        router.replace("/tabs/home")
      }
    }
  }, [segments, navigationState?.key, isAuthed])

  return <Slot />
}
