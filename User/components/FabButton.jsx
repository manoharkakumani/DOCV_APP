import React from "react";
import { StyleSheet, View } from "react-native";
import { FAB } from "react-native-paper";
import Theme from "../styles/Theme";
import { useRouter } from "expo-router";
const FabButton = ({ currentRoute }) => {
  const router = useRouter();
  return (
    <View style={styles.fabContainer}>
      {currentRoute === "/home" ||
      currentRoute === "/bookings" ||
      currentRoute === "/activity" ||
      currentRoute === "/profile" ? (
        <FAB
          style={styles.fab}
          icon="plus"
          color={Theme.colors.white}
          onPress={() => router.push("/nearby-service-providers")}
        />
      ) : currentRoute === "/vehicles" ? (
        <FAB
          style={styles.fab}
          icon="plus"
          color={Theme.colors.white}
          onPress={() => router.push("/add-vehicle")}
        />
      ) : currentRoute === "/chat" ? null : (
        <FAB
          style={styles.fab}
          icon="home"
          color={Theme.colors.white}
          onPress={() => router.push("/home")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    right: 18,
    bottom: 85,
  },
  fab: {
    backgroundColor: Theme.colors.primary,
  },
});

export default FabButton;
