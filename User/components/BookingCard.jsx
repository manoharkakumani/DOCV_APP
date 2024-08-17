import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, Avatar } from "react-native-paper";
import Theme from "@/styles/Theme";
import { useRouter } from "expo-router";

const BookingCard = ({ booking }) => {
  const router = useRouter();

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return Theme.colors.success;
      case "Rejected":
        return Theme.colors.danger;
      case "Pending":
        return Theme.colors.warning;
      case "Ongoing":
        return Theme.colors.info;
      default:
        return Theme.colors.gray;
    }
  };

  const getIconName = (type) => {
    return type === "Service" ? "car-wrench" : "tow-truck";
  };

  return (
    <Card
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/booking-view",
          params: { booking: JSON.stringify(booking) },
        })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <Avatar.Icon icon={getIconName(booking.type)} size={35} />
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>{booking.type}</Text>
            <Text style={styles.dateText}>
              {new Date(booking.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.costText}>${booking.cost.toFixed(2)}</Text>
          <View
            style={[
              styles.statusContainer,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: Theme.margin.sm,
    marginHorizontal: Theme.margin.md,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Theme.padding.md,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeContainer: {
    marginLeft: Theme.margin.sm,
  },
  typeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Theme.colors.dark,
  },
  dateText: {
    fontSize: 14,
    color: Theme.colors.gray,
    marginTop: 2,
  },
  rightContent: {
    alignItems: "flex-end",
  },
  costText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  statusContainer: {
    paddingHorizontal: Theme.padding.sm,
    paddingVertical: 4,
    borderRadius: Theme.radius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Theme.colors.white,
  },
});

export default BookingCard;
