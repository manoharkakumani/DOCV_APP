import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Theme from "@/styles/Theme";
import {
  getFutureBookingsByUserId,
  getCustomerPastBookings,
} from "@/utils/api";
import StatusCard from "./StatusCard";
import BookingCard from "./BookingCard";
import { useUserContext } from "@/context/UserContext";
import { useGlobalRefresh } from "@/context/GlobalRefreshContext";
import { useRouter } from "expo-router";

const Bookings = ({ type }) => {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const { user } = useUserContext();
  const { refreshing: globalRefreshing, onRefresh: onGlobalRefresh } =
    useGlobalRefresh();
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) {
      router.replace("/(auth)/signin");
      return;
    }
    try {
      const response =
        type === "future"
          ? await getFutureBookingsByUserId(user._id)
          : await getCustomerPastBookings(user._id);
      if (response.status === 200) {
        setActivities(response.data);
      } else {
        console.log(response.data.error);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
    console.log("Fetching data");
  }, [user, type]);

  const handleRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    await fetchData();
    setLocalRefreshing(false);
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    await onGlobalRefresh();
    await handleRefresh();
  }, [onGlobalRefresh, handleRefresh]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const renderItem = ({ item, index }) => (
    <BookingCard
      booking={item}
      style={[
        styles.bookingCard,
        index === 0 && styles.firstBookingCard,
        index === activities.length - 1 && styles.lastBookingCard,
      ]}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {activities.length === 0 ? (
        type === "future" ? (
          <StatusCard message="No Bookings found" style={styles.statusCard} />
        ) : (
          <StatusCard message="No activities found" style={styles.statusCard} />
        )
      ) : (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={globalRefreshing || localRefreshing}
              onRefresh={onRefresh}
              colors={[Theme.colors.primary]}
              tintColor={Theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.light,
  },
  listContainer: {
    padding: Theme.padding.md,
    paddingBottom: 100, // Add extra padding at the bottom to prevent the last item from being covered
  },
  statusCard: {
    margin: Theme.padding.md,
  },
  bookingCard: {
    marginBottom: Theme.padding.md,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.md,
    shadowColor: Theme.colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstBookingCard: {
    marginTop: Theme.padding.sm,
  },
  lastBookingCard: {
    marginBottom: Theme.padding.xl,
  },
});

export default Bookings;
