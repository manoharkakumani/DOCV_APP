import { useEffect } from "react";
import { StyleSheet, View, Image, StatusBar } from "react-native";
import { Text } from "react-native-paper";

import { useUserContext } from "@/context/UserContext";

import { useRouter } from "expo-router";

export default function Splash() {
  const router = useRouter();
  const { user } = useUserContext();
  useEffect(() => {
    setTimeout(() => {
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/signin");
      }
    }, 2000);
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image
        style={styles.image}
        source={require("@/assets/splash-screen.png")}
      />
      <Text style={styles.text}>DOCV</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  image: {
    width: "100%",
    height: 300,
    margin: 20,
    resizeMode: "contain",
  },

  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
