import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, Card, Avatar } from "react-native-paper";
import { StatusCard, BookingCard } from "@/components";
import Theme from "@/styles/Theme";
import { useUserContext } from "@/context/UserContext";
import { useGlobalRefresh } from "@/context/GlobalRefreshContext";
import {
  getCustomerUpcomingBookings,
  getCustomerOngoingBookings,
} from "@/utils/api";
import { useRouter } from "expo-router";

const Home = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [ongoingServices, setOngoingServices] = useState([]);
  const { user } = useUserContext();
  const router = useRouter();

  const { refreshing: globalRefreshing, onRefresh: onGlobalRefresh } =
    useGlobalRefresh();
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) {
      router.replace("/(auth)/signin");
      return;
    }
    const date = new Date().toISOString();
    try {
      const [appointmentsResponse, servicesResponse] = await Promise.all([
        getCustomerUpcomingBookings(user._id, date),
        getCustomerOngoingBookings(user._id),
      ]);

      if (appointmentsResponse.status === 200) {
        setUpcomingAppointments(appointmentsResponse.data);
      }
      if (servicesResponse.status === 200) {
        setOngoingServices(servicesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [user, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    await fetchData();
    setLocalRefreshing(false);
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    // await onGlobalRefresh();
    await handleRefresh();
  }, [onGlobalRefresh, handleRefresh]);

  const navigateTo = useCallback((path) => () => router.push(path), [router]);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={globalRefreshing || localRefreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.quickAccess}>
          <QuickAccessButton
            icon="history"
            text="Activity"
            color="#ff9800"
            onPress={navigateTo("/activity")}
          />
          <QuickAccessButton
            icon="car"
            text="Bookings"
            color="#f44336"
            onPress={navigateTo("/bookings")}
          />
          <QuickAccessButton
            icon="tow-truck"
            text="Towing"
            color="#8bc34a"
            onPress={navigateTo("/towing")}
          />
          <QuickAccessButton
            icon="car-multiple"
            text="Vehicles"
            color="#9c27b0"
            onPress={navigateTo("/vehicles")}
          />
        </View>
        <SectionList
          title="Ongoing Services"
          data={ongoingServices}
          emptyMessage="No ongoing services at the moment."
        />
        <SectionList
          title="Upcoming Appointments"
          data={upcomingAppointments}
          emptyMessage="No upcoming appointments."
        />
      </ScrollView>
    </View>
  );
};

const QuickAccessButton = ({ icon, text, color, onPress }) => (
  <Card
    style={[styles.quickButton, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Card.Content style={styles.cardContent}>
      <Avatar.Icon icon={icon} size={35} style={styles.icon} />
      <Text style={styles.buttonText}>{text}</Text>
    </Card.Content>
  </Card>
);

const SectionList = ({ title, data, emptyMessage }) => (
  <>
    <Text style={styles.sectionTitle}>{title}</Text>
    {data.length > 0 ? (
      data.map((item) => <BookingCard key={item._id} booking={item} />)
    ) : (
      <StatusCard message={emptyMessage} />
    )}
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.padding.md,
    backgroundColor: Theme.colors.light,
  },
  quickAccess: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: Theme.margin.md,
  },
  quickButton: {
    flexBasis: "48%",
    marginVertical: Theme.margin.xs,
    borderRadius: Theme.radius.md,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    backgroundColor: "transparent",
  },
  buttonText: {
    marginLeft: Theme.margin.sm,
    fontSize: Theme.text.md,
    color: Theme.colors.white,
  },
  sectionTitle: {
    fontSize: Theme.text.lg,
    fontWeight: "bold",
    marginTop: Theme.margin.md,
    marginBottom: Theme.margin.sm,
    color: Theme.colors.gray2,
  },
  card: {
    marginVertical: Theme.margin.sm,
    backgroundColor: Theme.colors.white,
    padding: Theme.padding.md,
    borderRadius: Theme.radius.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default Home;
