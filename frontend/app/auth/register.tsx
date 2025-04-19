import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Link, router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, firestore } from "../../firebaseConfig"
import { BASE_URL } from "../../constants"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { doc, setDoc } from "firebase/firestore"

export default function RegisterScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert("Missing fields", "Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match")
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const token = await user.getIdToken()

      // 🔹 Lưu name/email vào Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        name,
        email,
        createdAt: new Date(),
      })

      // 🔹 Lưu name local để hiển thị lời chào
      if (Platform.OS === "web") {
        localStorage.setItem("userName", name)
      } else {
        await AsyncStorage.setItem("userName", name)
      }

      // 🔹 Gửi tên đến backend nếu cần
      await fetch(`${BASE_URL}/api/v1/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      Alert.alert("Success", "Registration successful")
      router.replace("/")
    } catch (err: any) {
      console.error("🔥 Firebase error (full):", JSON.stringify(err, null, 2))

      if (err.code === "auth/email-already-in-use") {
        Alert.alert("Email đã được đăng ký", "Vui lòng dùng email khác")
      } else if (err.code === "auth/invalid-email") {
        Alert.alert("Email không hợp lệ", "Vui lòng nhập đúng định dạng email")
      } else if (err.code === "auth/weak-password") {
        Alert.alert("Mật khẩu quá yếu", "Mật khẩu phải có ít nhất 6 ký tự")
      } else {
        Alert.alert("Đăng ký thất bại", err.message || "Có lỗi không xác định")
      }
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
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Create an account to manage your system</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
        </View>

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
            placeholder="Create a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Log in</Text>
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
  registerButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    color: "#1a237e",
    fontWeight: "bold",
  },
})
