import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Card, Text } from "react-native-paper";
import Theme from "@/styles/Theme"; // Import the theme
import { StatusCard, BookingCard } from "@/components";
import { useUserContext } from "@/context/UserContext";
import { useGlobalRefresh } from "@/context/GlobalRefreshContext";
import { getVehicleBookings } from "@/utils/api";

import { router, useLocalSearchParams } from "expo-router";

const VehicleDetails = () => {
  const { vehicle: vehicleString } = useLocalSearchParams();
  const vehicle = JSON.parse(vehicleString);
  const { user } = useUserContext();
  const [activities, setActivities] = useState([]);

  const { refreshing: globalRefreshing, onRefresh: onGlobalRefresh } =
    useGlobalRefresh();
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    await fetchData();
    setLocalRefreshing(false);
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    await onGlobalRefresh();
    await handleRefresh();
  }, [onGlobalRefresh, handleRefresh]);

  const fetchData = async () => {
    try {
      const appointments = await getVehicleBookings(vehicle._id);
      if (appointments.status === 200) {
        setActivities(appointments.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
      return;
    }
    fetchData();
  }, [user]); // Empty dependency array ensures fetchData runs once on mount

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={localRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Vehicle Info </Text>
          <Text style={styles.detail}>Make: {vehicle.make}</Text>
          <Text style={styles.detail}>Model: {vehicle.model}</Text>
          <Text style={styles.detail}>Year: {vehicle.year}</Text>
          <Text style={styles.detail}>
            Registration Plate: {vehicle.registrationPlate}
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Activity History</Text>
        {activities.length === 0 ? (
          <StatusCard message="No activity found" />
        ) : (
          activities.map((booking, index) => (
            <BookingCard booking={booking} key={index} />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: Theme.colors.light,
    padding: 16,
  },
  card: {
    padding: Theme.padding.md,
  },
  activityCard: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Theme.colors.white,
    borderRadius: 8,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: Theme.colors.primary,
  },
  detail: {
    fontSize: 16,
    color: Theme.colors.dark,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
    color: Theme.colors.primary,
  },
  activityDate: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: Theme.colors.dark,
  },
  activityService: {
    fontSize: 16,
    color: Theme.colors.gray,
  },
});

export default VehicleDetails;
