import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Link, router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, firestore } from "../../firebaseConfig"
import { BASE_URL } from "../../constants"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { doc, getDoc } from "firebase/firestore"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password")
      return
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const token = await user.getIdToken()

      console.log("✅ ID Token:", token)

      // ✅ Lưu token
      if (Platform.OS === "web") {
        localStorage.setItem("userToken", token)
      } else {
        await AsyncStorage.setItem("userToken", token)
      }

      // ✅ Lấy name từ Firestore
      const docSnap = await getDoc(doc(firestore, "users", user.uid))
      if (docSnap.exists()) {
        const name = docSnap.data().name || "there"
        if (Platform.OS === "web") {
          localStorage.setItem("userName", name)
        } else {
          await AsyncStorage.setItem("userName", name)
        }
      }

      Alert.alert("Success", "Logged in successfully")

      // ✅ Gắn cờ vừa login để RootLayout biết chuyển trang
      if (typeof window !== "undefined") {
        (window as any).hasJustLoggedIn = true
      }
      
      router.replace("/tabs/home")
      
    } catch (error: any) {
      console.error("❌ Login Error:", error)
      Alert.alert("Login failed", error.message)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#1a237e" style={styles.backIcon} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>Welcome back to your misting system</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Link href="/auth/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#1a237e",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 40,
    marginBottom: 30,
  },
  backIcon: {
    marginRight: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: "#1a237e",
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#1a237e",
  },
  loginButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    color: "#666",
  },
  registerLink: {
    color: "#1a237e",
    fontWeight: "bold",
  },
})
