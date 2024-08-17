import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { getPath } from "@/utils/mapsapi";
import { useWebSocketContext } from "@/context/WebSocketProvider";
import { useUserContext } from "@/context/UserContext";
import { getRide } from "@/utils/api";
import { useFocusEffect } from "@react-navigation/native";

import { router } from "expo-router";

const TowingTracking = () => {
  const mapRef = useRef(null);
  const { user } = useUserContext();
  const { ws } = useWebSocketContext();
  const [userLocation, setUserLocation] = useState(null);
  const [towerLocation, setTowerLocation] = useState(null);
  const [pathCoordinates, setPathCoordinates] = useState([]);
  const [ride, setRide] = useState(null);
  const rideId = "66bae30448277102b77aea9e";

  const fetchRideDetails = useCallback(async () => {
    try {
      const response = await getRide(rideId);
      if (response.status === 200) {
        setRide(response.data);
      }
    } catch (error) {
      console.error("Error fetching ride details:", error);
    }
  }, [rideId]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchRideDetails();
      } else {
        router.replace("/(auth)/signin");
      }

      return () => {
        // This function is called when the screen goes out of focus
        console.log("TowingTracking screen is unfocused");
      };
    }, [user, fetchRideDetails])
  );

  useEffect(() => {
    if (ride) {
      setUserLocation({
        latitude: ride.from.coordinates[0],
        longitude: ride.from.coordinates[1],
      });
      setTowerLocation({
        latitude: ride.driver.coordinates[0],
        longitude: ride.driver.coordinates[1],
      });
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: ride.driver.coordinates[0],
            longitude: ride.driver.coordinates[1],
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          3000
        );
      }
    }
  }, [ride]);

  const fetchPath = useCallback(async () => {
    if (!userLocation || !towerLocation || !ride) return;

    const destination =
      ride && ride.status === "Accepted"
        ? userLocation // Tower is coming to the user
        : {
            latitude: ride.to.coordinates[0],
            longitude: ride.to.coordinates[1],
          }; // Tower is going to the destination

    const response = await getPath(towerLocation, destination);
    if (response.status === 200) {
      const data = await response.json();
      setPathCoordinates(
        data.features[0].geometry.coordinates[0].map(
          ([longitude, latitude]) => ({ latitude, longitude })
        )
      );
    }
  }, [userLocation, towerLocation, ride]);

  useEffect(() => {
    fetchPath();
  }, [fetchPath]);

  useEffect(() => {
    const handleLocation = (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "location" && message.rideId === rideId) {
        if (message.location.coordinates[0] === towerLocation.latitude) {
          return;
        }
        setTowerLocation({
          latitude: message.location.coordinates[0],
          longitude: message.location.coordinates[1],
        });

        if (message.pathCoordinates) {
          setPathCoordinates(message.pathCoordinates);
        }
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: message.location.coordinates[0],
              longitude: message.location.coordinates[1],
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            3000
          );
        }
      }
    };

    if (ws) {
      ws.addEventListener("location", handleLocation);
    }

    return () => {
      if (ws) {
        ws.removeEventListener("location", handleLocation);
      }
    };
  }, [ws, rideId]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsTraffic
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 37.78825,
          longitude: userLocation ? userLocation.longitude : -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {userLocation && ride && ride.status === "Accepted" && (
          <Marker
            coordinate={userLocation}
            title="Your location"
            description="You are here"
            icon={require("@/assets/car.png")}
          />
        )}
        {towerLocation && (
          <Marker
            coordinate={towerLocation}
            title="Tower location"
            description="Tower is here"
            icon={
              ride && ride.status === "Ongoing"
                ? require("@/assets/towed.png")
                : require("@/assets/tow-truck.png")
            }
          />
        )}
        {ride && ride.status === "Ongoing" && (
          <Marker
            coordinate={{
              latitude: ride.to.coordinates[0],
              longitude: ride.to.coordinates[1],
            }}
            title="Destination"
            description={ride.to_formatted_address}
            icon={require("@/assets/repair.png")}
          />
        )}
        {pathCoordinates.length > 0 && (
          <Polyline
            coordinates={pathCoordinates}
            strokeColor="#0f53ff"
            strokeWidth={6}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default TowingTracking;
