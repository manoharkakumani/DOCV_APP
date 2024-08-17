import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Card, Text, Avatar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import Theme from "@/styles/Theme";
import { StatusCard, BookingCard } from "@/components";
import { useUserContext } from "@/context/UserContext";
import { router } from "expo-router";

import {
  getServiceProviderPastBookings,
  getServiceProviderOngoingBookings,
} from "@/utils/api";

const Activity = () => {
  const { user } = useUserContext();
  const [ongoingActivity, setOngoingActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) {
        router.replace("/(auth)/signin");
        return;
      }
      const id = user._id;
      const ongoing = await getServiceProviderOngoingBookings(id);
      if (ongoing.status === 200) {
        setOngoingActivity(ongoing.data.message ? null : ongoing.data.booking);
      } else {
        console.log("Error fetching ongoing bookings:", ongoing);
        setOngoingActivity(null);
        setError("Failed to fetch ongoing activity");
      }
      const past = await getServiceProviderPastBookings(id);
      if (past.status === 200) {
        setActivities(past.data);
      } else {
        setActivities([]);
        setError("Failed to fetch past activities");
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const renderItem = useCallback(({ item }) => {
    return <BookingCard booking={item} />;
  }, []);

  const memoizedActivities = useMemo(() => activities, [activities]);

  if (isLoading) {
    return <StatusCard message="Loading..." />;
  }

  if (error) {
    return <StatusCard message={error} />;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Ongoing Activity</Text>
      {ongoingActivity ? (
        <Card style={styles.card}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/booking-view",
                params: { booking: JSON.stringify(ongoingActivity) },
              })
            }
          >
            <Card.Title
              title={ongoingActivity.type}
              subtitle={new Date(ongoingActivity.date).toLocaleDateString()}
              left={(props) => <Avatar.Icon {...props} icon="clock" />}
              right={(props) => (
                <Text style={{ right: 10, fontWeight: "bold" }}>
                  ${ongoingActivity.cost.toFixed(2)}
                </Text>
              )}
            />
          </TouchableOpacity>
        </Card>
      ) : (
        <StatusCard message="No Ongoing Activity" />
      )}
      <Text style={styles.sectionTitle}>Past Activities</Text>
      {memoizedActivities.length === 0 ? (
        <StatusCard message="No activities found" />
      ) : (
        <FlatList
          data={memoizedActivities}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.padding.md,
    backgroundColor: Theme.colors.light,
  },
  listContainer: {
    paddingBottom: Theme.padding.md,
  },
  card: {
    marginBottom: Theme.margin.md,
    borderRadius: Theme.radius.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: Theme.text.lg,
    fontWeight: "bold",
    marginTop: Theme.margin.md,
    marginBottom: Theme.margin.sm,
    color: Theme.colors.gray2,
  },
});

export default Activity;
