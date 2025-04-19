import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Link } from "expo-router"
import { router } from "expo-router"

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={styles.title}>Misting System</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.heading}>Your system,{"\n"}your rules</Text>
            <Text style={styles.subheading}>Manage your system from{"\n"}anywhere, anytime</Text>
          </View>

          <Image
            source={{
              uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hUSOWP2ldiFzQflhUbswiPTVszH30c.png",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/auth/register")}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuButtonText}>≡</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
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
    justifyContent: "space-between", 
  },
  header: {
    marginTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#211F67",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1, 
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 33,
  },
  heading: {
    fontSize: 40,
    fontWeight: "900",
    color: "#211F67",
    marginBottom: 10,
    textAlign: "center",
    lineHeight: 40,
  },
  subheading: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 20,
  },
  footer: {
    alignItems: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 20,
  },
  loginButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#1a237e",
    width: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#1a237e",
    fontWeight: "bold",
    fontSize: 16,
  },
  menuButton: {
    marginTop: 10,
  },
  menuButtonText: {
    fontSize: 24,
    color: "#211F67",
  },
})
