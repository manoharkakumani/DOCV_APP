import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { Button } from "react-native-paper";
import * as Location from "expo-location";
import { router } from "expo-router";
import { getAddress, getPath } from "@/utils/mapsapi";
import { useWebSocketContext } from "@/context/WebSocketProvider";
import { useUserContext } from "@/context/UserContext";
import Theme from "@/styles/Theme";

import {
  getServiceProviderOngoingBookings,
  endRide,
  updateRide,
  updateBooking,
} from "@/utils/api";
import { useFocusEffect } from "@react-navigation/native";

const Home = () => {
  const mapRef = useRef(null);
  const { user, SetUser } = useUserContext();
  const { updateToServer } = useWebSocketContext();
  const [booking, setBooking] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [ride, setRide] = useState(null);
  const [isNearPickup, setIsNearPickup] = useState(false);
  const [isNearDestination, setIsNearDestination] = useState(false);
  const locationUpdateIntervalRef = useRef(null);
  const [isRerouting, setIsRerouting] = useState(false);
  const [pathCoordinates, setPathCoordinates] = useState([]);

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
      return;
    }
    setIsOnline(user.available);
  }, [user]);

  const fetchLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          3000
        );
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
      return location;
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  }, []);

  const fetchPath = async (destination) => {
    try {
      const response = await getPath(userLocation, destination);
      if (response && response.status === 200) {
        const data = await response.json();
        setPathCoordinates(
          data.features[0].geometry.coordinates[0].map(
            ([longitude, latitude]) => ({ latitude, longitude })
          )
        );
      }
    } catch (error) {
      console.error("Error fetching path:", error);
    }
  };

  useEffect(() => {
    if (userLocation && ride && booking?.status === "Accepted") {
      fetchPath({
        latitude: ride.from.coordinates[0],
        longitude: ride.from.coordinates[1],
      });
    } else if (userLocation && ride && booking?.status === "Ongoing") {
      fetchPath({
        latitude: ride.to.coordinates[0],
        longitude: ride.to.coordinates[1],
      });
    }
  }, [userLocation, ride, booking]);

  const checkLocationAndUpdate = useCallback(async () => {
    if (!userLocation || !ride || !pathCoordinates.length) return;

    if (!isPointOnPath(userLocation, pathCoordinates)) {
      setIsRerouting(true);
      const destination =
        booking && booking.status === "Accepted"
          ? {
              latitude: ride.from.coordinates[0],
              longitude: ride.from.coordinates[1],
            }
          : {
              latitude: ride.to.coordinates[0],
              longitude: ride.to.coordinates[1],
            };

      await fetchPath(destination);
      setIsRerouting(false);
    }
  }, [userLocation, ride, pathCoordinates, booking, fetchPath]);

  const updateLocationAndSendToServer = useCallback(async () => {
    const location = await fetchLocation();
    if (location) {
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      updateToServer({
        type: "location",
        servicemanId: user?._id,
        bookingId: booking?._id,
        rideId: ride?._id,
        customerId: booking?.customerId?._id,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
      await checkLocationAndUpdate();
    }
  }, [
    fetchLocation,
    updateToServer,
    user,
    booking,
    ride,
    checkLocationAndUpdate,
  ]);

  const startLocationUpdates = useCallback(() => {
    if (locationUpdateIntervalRef.current) return; // Don't start if already running
    locationUpdateIntervalRef.current = setInterval(
      updateLocationAndSendToServer,
      60000
    ); // 60000 ms = 1 minute
  }, [updateLocationAndSendToServer]);

  const stopLocationUpdates = useCallback(() => {
    if (locationUpdateIntervalRef.current) {
      clearInterval(locationUpdateIntervalRef.current);
      locationUpdateIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (booking) {
      startLocationUpdates();
    } else {
      stopLocationUpdates();
    }

    return () => stopLocationUpdates(); // Cleanup on component unmount
  }, [booking, startLocationUpdates, stopLocationUpdates]);

  const fetchBookingData = useCallback(async () => {
    try {
      if (!user) return;
      const ongoingBookingResponse = await getServiceProviderOngoingBookings(
        user._id
      );
      if (
        ongoingBookingResponse &&
        ongoingBookingResponse.status === 200 &&
        ongoingBookingResponse.data &&
        ongoingBookingResponse.data.booking
      ) {
        const fetchedBooking = ongoingBookingResponse.data.booking;
        setRide(fetchedBooking.rideId || null);
        setBooking(fetchedBooking);
      } else {
        setBooking(null);
        setRide(null);
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
      setBooking(null);
      setRide(null);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchLocation();
      fetchBookingData();
      return () => console.log("Screen unfocused");
    }, [fetchLocation, fetchBookingData])
  );

  const handleToggleOnline = useCallback(async () => {
    try {
      const newOnlineStatus = !isOnline;
      SetUser({ ...user, available: newOnlineStatus });
      setIsOnline(newOnlineStatus);
      updateToServer({
        type: "availability",
        servicemanId: user?._id,
        isOnline: newOnlineStatus,
        location: userLocation,
      });
    } catch (error) {
      console.log(error);
    }
  }, [isOnline, user, SetUser, updateToServer, userLocation]);

  const handleStartRide = useCallback(async () => {
    if (!ride) return;
    try {
      const response = await updateBooking(booking._id, { status: "Ongoing" });
      if (response && response.status === 200) {
        setBooking({ ...booking, status: "Ongoing" });
      } else {
        console.log("Error starting ride", response);
      }
    } catch (error) {
      console.error("Error starting ride:", error);
    }
  }, [ride, booking]);

  const handleEndRide = useCallback(async () => {
    if (!booking) return;
    try {
      const response = await endRide(booking._id);
      if (response.status === 200) {
        setBooking(null);
        setRide(null);
      } else {
        console.log("Error ending ride", response);
      }
    } catch (error) {
      console.log("Error ending ride", error);
    }
  }, [booking]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  const isPointOnPath = (point, path, tolerance = 0.0001) => {
    for (let i = 0; i < path.length - 1; i++) {
      const start = path[i];
      const end = path[i + 1];

      const distanceToLine = distanceToSegment(point, start, end);
      if (distanceToLine <= tolerance) {
        return true;
      }
    }
    return false;
  };

  const distanceToSegment = (point, start, end) => {
    const { latitude: x, longitude: y } = point;
    const { latitude: x1, longitude: y1 } = start;
    const { latitude: x2, longitude: y2 } = end;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    if (userLocation && ride) {
      const distanceToPickup = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        ride.from.coordinates[0],
        ride.from.coordinates[1]
      );
      const distanceToDestination = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        ride.to.coordinates[0],
        ride.to.coordinates[1]
      );

      setIsNearPickup(distanceToPickup <= 10);
      setIsNearDestination(distanceToDestination <= 10);
    }
  }, [userLocation, ride]);

  const renderActionButton = () => {
    if (!booking) {
      return (
        <Button
          onPress={handleToggleOnline}
          buttonColor={isOnline ? "red" : "#104e13"}
          textColor="#fff"
          style={styles.button}
        >
          {isOnline ? "Go Offline" : "Go Online"}
        </Button>
      );
    }

    if (booking.status === "Accepted" && isNearPickup) {
      return (
        <Button
          onPress={handleStartRide}
          buttonColor={Theme.colors.primary}
          textColor="#fff"
          style={styles.button}
        >
          Start Ride
        </Button>
      );
    }

    if (booking.status === "Ongoing" && isNearDestination) {
      return (
        <Button
          onPress={handleEndRide}
          buttonColor={Theme.colors.primary}
          textColor="#fff"
          style={styles.button}
        >
          End Ride
        </Button>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
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
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your location"
              description="You are here"
              icon={
                ride && booking?.status === "Ongoing"
                  ? require("@/assets/towed.png")
                  : require("@/assets/tow-truck.png")
              }
              flat={true}
            />
          )}
          {userLocation && booking && ride && (
            <>
              {booking.status === "Accepted" ? (
                <Marker
                  coordinate={{
                    latitude: ride.from.coordinates[0],
                    longitude: ride.from.coordinates[1],
                  }}
                  title="Pickup"
                  description={ride.from_formatted_address}
                  icon={require("@/assets/car.png")}
                />
              ) : (
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
              <Polyline
                coordinates={pathCoordinates}
                strokeColor="#0f53ff"
                strokeWidth={6}
              />
            </>
          )}
        </MapView>
        <View style={styles.searchBar}>{renderActionButton()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchBar: {
    position: "absolute",
    top: 20,
    width: "100%",
    alignItems: "center",
  },
  nearbyContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    alignItems: "center",
  },
  card: {
    width: "90%",
    borderRadius: Theme.radius.md,
    elevation: 4,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    justifyContent: "space-between",
  },
  priceText: {
    fontSize: 18,
    color: Theme.colors.primary,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  button: {
    width: "50%",
    marginTop: 25,
    borderRadius: Theme.radius.lg,
    shadowColor: Theme.colors.black,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
});

export default Home;
