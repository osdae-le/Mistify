import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { StatusBar } from "expo-status-bar"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../../firebaseConfig"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      Alert.alert(
        "Password Reset Email Sent",
        "Check your email for instructions to reset your password",
        [{ text: "OK", onPress: () => router.push("/auth/login") }]
      )
    } catch (error: any) {
      console.error("❌ Reset password error:", error)
      let message = "Something went wrong."
      if (error.code === "auth/user-not-found") {
        message = "This email is not registered."
      } else if (error.code === "auth/invalid-email") {
        message = "The email address is not valid."
      }
      Alert.alert("Reset Failed", message)
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
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to reset your password</Text>
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

        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
          <Text style={styles.resetButtonText}>Reset Password</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            We'll send you an email with instructions to reset your password
          </Text>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
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
  resetButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  infoText: {
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    color: "#1a237e",
    fontWeight: "bold",
  },
})
