import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Card, Button, Avatar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Theme from "@/styles/Theme";
import * as Location from "expo-location";
import { getNearbyServiceProviders } from "@/utils/api";

import { useUserContext } from "@/context/UserContext";
import { useGlobalRefresh } from "@/context/GlobalRefreshContext";

import { router } from "expo-router";

const NearbyServiceProviders = () => {
  const { user } = useUserContext();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { refreshing: globalRefreshing, onRefresh: onGlobalRefresh } =
    useGlobalRefresh();
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    await fetchServiceProviders();
    setLocalRefreshing(false);
  }, [fetchServiceProviders]);

  const onRefresh = useCallback(async () => {
    // await onGlobalRefresh();
    await handleRefresh();
  }, [onGlobalRefresh, handleRefresh]);

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coordinates = [location.coords.latitude, location.coords.longitude]; // Note the order: [latitude, longitude]

      const response = await getNearbyServiceProviders({ coordinates });

      if (response.status === 200) {
        setServiceProviders(response.data);
      } else {
        setError(response.data.error || "Failed to fetch service providers");
      }
    } catch (error) {
      console.error("Error fetching service providers:", error);
      setError("An error occurred while fetching service providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
    }
    fetchServiceProviders();
  }, [user]);

  const renderServiceProvider = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Avatar.Image
          size={60}
          source={{
            uri: item.avatar || "https://example.com/default-avatar.png",
          }}
        />
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={Theme.colors.warning} />
            <Text style={styles.ratingText}>
              {item.rating?.toFixed(1) || "N/A"}
            </Text>
          </View>
          <Text style={styles.distanceText}>
            {item.distance?.toFixed(1) || "N/A"} km away
          </Text>
        </View>
      </View>
      <View style={styles.servicesContainer}>
        {item.services?.map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service.name}</Text>
          </View>
        ))}
      </View>
      <Button
        mode="contained"
        onPress={() =>
          router.push({
            pathname: "/service-provider",
            params: { serviceProvider: JSON.stringify(item) },
          })
        }
        style={styles.viewProfileButton}
      >
        View Profile
      </Button>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={fetchServiceProviders}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {serviceProviders.length > 0 ? (
        <FlatList
          data={serviceProviders}
          renderItem={renderServiceProvider}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={globalRefreshing || localRefreshing}
              onRefresh={onRefresh}
            />
          }
        />
      ) : (
        <Text style={styles.noProvidersText}>
          No nearby service providers found
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.primary,
    padding: Theme.padding.md,
  },
  listContainer: {
    padding: Theme.padding.sm,
  },
  card: {
    marginBottom: Theme.margin.md,
    borderRadius: Theme.radius.md,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.padding.md,
  },
  providerInfo: {
    flex: 1,
    marginLeft: Theme.margin.md,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Theme.colors.text,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: Theme.colors.text,
  },
  distanceText: {
    color: Theme.colors.gray,
    marginTop: 4,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Theme.padding.sm,
  },
  serviceTag: {
    backgroundColor: Theme.colors.lightGray,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: Theme.padding.sm,
    paddingVertical: 4,
    marginRight: Theme.margin.sm,
    marginBottom: Theme.margin.sm,
  },
  serviceText: {
    color: Theme.colors.text,
    fontSize: 12,
  },
  viewProfileButton: {
    margin: Theme.margin.md,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: Theme.colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 10,
  },
  noProvidersText: {
    fontSize: 16,
    color: Theme.colors.gray,
    textAlign: "center",
    marginTop: 20,
  },
});

export default NearbyServiceProviders;
