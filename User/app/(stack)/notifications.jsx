import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Theme from "@/styles/Theme"; // Import the theme

const Notifications = () => {
  // Dummy data for notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Notification 1", message: "This is notification 1." },
    { id: 2, title: "Notification 2", message: "This is notification 2." },
    { id: 3, title: "Notification 3", message: "This is notification 3." },
  ]);

  // Function to render each notification item
  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.notificationList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.light,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.black,
  },
  notificationList: {
    flexGrow: 1,
  },
  notificationItem: {
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Theme.colors.primary,
  },
  notificationMessage: {
    fontSize: 16,
    color: Theme.colors.dark,
  },
});

export default Notifications;
