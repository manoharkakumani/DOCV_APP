import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/styles/Theme";
import { useUserContext } from "@/context/UserContext";
import { useLocalSearchParams, router } from "expo-router";

const DetailSection = ({ title, details }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Divider style={styles.divider} />
    {Object.entries(details).map(([key, value]) => (
      <View key={key} style={styles.detailRow}>
        <Text style={styles.detailKey}>{key}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    ))}
  </View>
);

const BookingView = () => {
  const { booking: bookingString } = useLocalSearchParams();
  const booking = JSON.parse(bookingString);

  const { user } = useUserContext();

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
    }
  }, [user]);

  const ServiceProviderDetails = {
    Name: booking.serviceProviderId ? booking.serviceProviderId.name : "N/A",
    Email: booking.serviceProviderId ? booking.serviceProviderId.email : "N/A",
    Phone: booking.serviceProviderId ? booking.serviceProviderId.phone : "N/A",
  };

  const vehicleDetails = {
    Make: booking.vehicleId.make,
    Model: booking.vehicleId.model,
    Year: booking.vehicleId.year,
    "Plate Number": booking.vehicleId.registrationPlate,
  };

  const serviceInfo = {
    Type: booking.type,
    Status: booking.status,
    Services: booking.services.map((service) => service.name).join(", "),
  };

  const paymentInfo = {
    Cost: `$${booking.cost.toFixed(2)}`,
    Paid: `$${booking.paid.toFixed(2)}`,
    Balance: `$${booking.balance.toFixed(2)}`,
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.bookingCard}>
          <Card.Content>
            <Text style={styles.bookingDate}>
              Booking Date: {new Date(booking.date).toLocaleDateString()}
            </Text>
            <Text style={styles.bookingStatus}>Status: {booking.status}</Text>
          </Card.Content>
        </Card>

        <DetailSection
          title="Service Provider Details"
          details={ServiceProviderDetails}
        />
        <DetailSection title="Vehicle Details" details={vehicleDetails} />
        <DetailSection title="Service Information" details={serviceInfo} />
        <DetailSection title="Payment Information" details={paymentInfo} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Notes</Text>
          <Divider style={styles.divider} />
          {booking.notes.length > 0 &&
            booking.notes.map((note, index) => (
              <Text key={index} style={styles.detailValue}>
                {index + 1}. {note}
              </Text>
            ))}
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        {booking.status !== "Completed" &&
          booking.status !== "Cancelled" &&
          booking.status !== "Rejected" && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/chat",
                  params: { booking: JSON.stringify(booking) },
                })
              }
              style={styles.chatButton}
            >
              <Ionicons
                name="chatbox-outline"
                size={24}
                color={Theme.colors.white}
                style={styles.chatIcon}
              />
              <Text style={styles.chatButtonText}>Open Chat</Text>
            </TouchableOpacity>
          )}
        {booking.rideId &&
          (booking.rideId.status === "Accepted" ||
            booking.rideId.status === "Ongoing") && (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/towing-tracking",
                  params: { rideId: booking.rideId._id },
                })
              }
              style={styles.chatButton}
            >
              <Ionicons
                name="chatbox-outline"
                size={24}
                color={Theme.colors.white}
                style={styles.chatIcon}
              />
              <Text style={styles.chatButtonText}>Track Towing</Text>
            </TouchableOpacity>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.light,
  },
  scrollContainer: {
    padding: 16,
  },
  bookingCard: {
    marginBottom: 16,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookingDate: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: Theme.colors.primary,
  },
  bookingStatus: {
    fontSize: 16,
    color: Theme.colors.dark,
  },
  section: {
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Theme.colors.primary,
    marginBottom: 8,
  },
  divider: {
    backgroundColor: Theme.colors.gray,
    height: 1,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 16,
    color: Theme.colors.dark,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: Theme.colors.gray,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 5,
  },
  chatButton: {
    flexDirection: "row",
    margin: 8,
    justifyContent: "space-between",
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  chatIcon: {
    marginRight: 8,
  },
  chatButtonText: {
    color: Theme.colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BookingView;
