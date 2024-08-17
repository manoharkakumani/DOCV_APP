import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Avatar, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/styles/Theme";
import { useUserContext } from "@/context/UserContext";

import { useRouter } from "expo-router";

const Profile = () => {
  const { user, signOut } = useUserContext();
  const router = useRouter();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          router.replace("/(auth)/signin");
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      signOut();
      router.replace("/(auth)/signin");
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return null; // Return null or a loading indicator if user is not loaded yet
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image
          size={100}
          source={require("@/assets/user.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.handle}>{user.email}</Text>
      </View>
      <Divider style={styles.divider} />
      {/* <SettingsItem icon="camera" title="Add a profile photo" /> */}
      <SectionTitle title="Account & Settings" />
      <SettingsItem
        icon="person"
        title="Personal"
        onPress={() => router.push("/profile-edit")}
      />
      <SettingsItem
        icon="card"
        title="Linked Payments"
        onPress={() => router.push("/payments")}
      />
      {/* <SettingsItem
        icon="notifications"
        title="Notifications"
        onPress={() => navigation.navigate("Notifications")}
      /> */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => handleSignOut()}
      >
        <Text style={styles.signOutButtonText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const SettingsItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={Theme.colors.primary} />
    </View>
    <Text style={styles.itemTitle}>{title}</Text>
    <Ionicons
      name="chevron-forward-outline"
      size={24}
      color={Theme.colors.primary}
    />
  </TouchableOpacity>
);

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.light,
  },
  header: {
    alignItems: "center",
    padding: Theme.padding.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    borderWidth: 2,
    borderColor: Theme.colors.white,
  },
  name: {
    color: Theme.colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: Theme.margin.sm,
  },
  handle: {
    color: Theme.colors.gray,
    fontSize: 16,
  },
  location: {
    color: Theme.colors.gray,
    fontSize: 16,
    marginBottom: Theme.margin.sm,
  },
  divider: {
    marginVertical: Theme.margin.md,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Theme.padding.md,
    paddingHorizontal: Theme.padding.lg,
    backgroundColor: Theme.colors.white,
    marginVertical: Theme.margin.xs,
    marginHorizontal: Theme.margin.md,
    borderRadius: Theme.radius.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: Theme.colors.light,
    borderRadius: Theme.radius.md,
    padding: Theme.padding.sm,
    marginRight: Theme.margin.md,
  },
  itemTitle: {
    color: Theme.colors.primary,
    flex: 1,
    fontSize: 16,
  },
  sectionTitle: {
    color: Theme.colors.primary,
    fontSize: 20,
    paddingVertical: Theme.padding.sm,
    paddingHorizontal: Theme.padding.md,
    fontWeight: "bold",
    marginTop: Theme.margin.md,
  },
  signOutButton: {
    backgroundColor: Theme.colors.danger,
    padding: Theme.padding.md,
    margin: Theme.margin.lg,
    borderRadius: Theme.radius.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  signOutButtonText: {
    color: Theme.colors.white,
    textAlign: "center",
    fontSize: 16,
  },
});

export default Profile;
