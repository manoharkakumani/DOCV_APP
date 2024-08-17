import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text, Card } from "react-native-paper";
import Theme from "@/styles/Theme"; // Import the theme
import { getCustomerVehicles } from "@/utils/api";
import { StatusCard } from "@/components"; // Import the StatusCard component

import { useUserContext } from "@/context/UserContext";
import { useGlobalRefresh } from "@/context/GlobalRefreshContext";
import { router } from "expo-router";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const { user } = useUserContext();
  const { refreshing: globalRefreshing, onRefresh: onGlobalRefresh } =
    useGlobalRefresh();

  const [localRefreshing, setLocalRefreshing] = useState(false);

  const fetchData = async () => {
    const response = await getCustomerVehicles(user._id);
    if (response.status === 200) {
      if (response.data.length === 0) {
        return;
      } else setVehicles(response.data);
    }
  };

  const handleRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    await fetchData();
    setLocalRefreshing(false);
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    await onGlobalRefresh();
    await handleRefresh();
  }, [onGlobalRefresh, handleRefresh]);

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
    }
    fetchData();
  }, [user]);

  const renderVehicle = ({ item }) => (
    <Card
      style={styles.card}
      key={item._id}
      onPress={() =>
        router.push({
          pathname: "/(stack)/vehicle-details",
          params: { vehicle: JSON.stringify(item) },
        })
      }
    >
      <Card.Title
        title={`${item.make} ${item.model}`}
        subtitle={`Year: ${item.year}`}
      />
      <Card.Content>
        <Text>Registration Plate: {item.registrationPlate}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {vehicles.length === 0 ? (
        <StatusCard message="No vehicles found" />
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicle}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={globalRefreshing || localRefreshing}
              onRefresh={onRefresh}
            />
          }
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
    paddingBottom: 150,
  },
  listContainer: {
    paddingBottom: Theme.padding.md,
  },
  card: {
    margin: Theme.margin.md,
    backgroundColor: Theme.colors.white,
    padding: Theme.padding.md,
    borderRadius: Theme.radius.md,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButton: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 10,
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
  },
});

export default Vehicles;
