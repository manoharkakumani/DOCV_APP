import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Alert } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { Button, Text, Card } from "react-native-paper";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import Theme from "@/styles/Theme";
import { MapSarchBar } from "@/components";
import { GOOGLE_MAPS_APIKEY, MAPS_APIKEY } from "@/utils/apikey";
import {
  getCustomerVehicles,
  addTowingBooking,
  updateBooking,
} from "@/utils/api";
import { getAddress, getPath } from "@/utils/mapsapi";
import { useWebSocketContext } from "@/context/WebSocketProvider";
import { useUserContext } from "@/context/UserContext";
import { router } from "expo-router";

const Towing = () => {
  const mapRef = useRef(null);
  const { processPayment } = useWebSocketContext();
  const { user } = useUserContext();
  const [vehicle, setVehicle] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);
  const [pathCoordinates, setPathCoordinates] = useState([]);

  const PRICE_PER_MILE = {
    5: 10,
    10: 8,
    20: 6,
    50: 4,
  };

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
    }
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      if (mapRef.current)
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          3000
        );
      const response = await getAddress(
        location.coords.latitude,
        location.coords.longitude
      );
      if (response.status === 200) {
        let data = await response.json();
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          formatted_address: data.features[0].properties.formatted,
        });
      }
    })();

    (async () => {
      const response = await getCustomerVehicles(user._id);
      if (response.status === 200) {
        setVehicles(response.data);
      }
    })();
  }, []);

  const validate = () => {
    let isValid = true;
    if (vehicle === "") {
      setVehicleError("Vehicle is required");
      isValid = false;
    } else {
      setVehicleError("");
    }
    return isValid;
  };

  const handleRequestService = async () => {
    console.log("Requesting service");
    if (validate()) {
      try {
        const bookingResponse = await addTowingBooking({
          customerId: user._id,
          vehicleId: vehicle,
          location: userLocation,
          destination: destination,
          distance: distance,
          price: price.toFixed(2),
        });
        if (bookingResponse.status === 201) {
          const { client_secret, ephemeralKey, stripeId } =
            bookingResponse.data.paymentIntent;
          console.log("Payment intent", bookingResponse.data.paymentIntent);
          if (client_secret && ephemeralKey && stripeId) {
            await processPayment(
              client_secret,
              ephemeralKey,
              stripeId,
              bookingResponse.data.booking._id
            );
          } else {
            await updateBooking(bookingResponse.data.booking._id, {
              status: "Pending",
            });
            Alert.alert(
              "Payment error",
              "There was an error creating the payment intent"
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchPath = async () => {
    const response = await getPath(userLocation, destination);
    if (response.status === 200) {
      const data = await response.json();
      setPathCoordinates(
        data.features[0].geometry.coordinates[0].map(
          ([longitude, latitude]) => ({ latitude, longitude })
        )
      );
      const distance = data.features[0].properties.distance;
      setDistance(data.features[0].properties.distance);

      if (distance > 50) {
        setPrice(PRICE_PER_MILE[50] * distance);
      } else if (distance > 20) {
        setPrice(PRICE_PER_MILE[20] * distance);
      } else if (distance > 10) {
        setPrice(PRICE_PER_MILE[10] * distance);
      } else {
        setPrice(PRICE_PER_MILE[5] * distance);
      }
      if (distance > 0 && distance < 160) {
        mapRef.current.fitToCoordinates(pathCoordinates, {
          edgePadding: {
            right: 30,
            left: 30,
            top: 30,
            bottom: 30,
          },
        });
      }
    }
  };

  useEffect(() => {
    if (userLocation && destination) {
      fetchPath();
    }
  }, [userLocation, destination]);

  return (
    <View style={styles.container}>
      <View style={{ ...styles.mapContainer }}>
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
          <Marker
            coordinate={{
              latitude: userLocation ? userLocation.latitude : 37.78825,
              longitude: userLocation ? userLocation.longitude : -122.4324,
            }}
            title="Your location"
            icon={require("@/assets/car.png")}
            description={userLocation ? userLocation.formatted_address : ""}
            flat={true}
          />
          {userLocation && destination && distance < 160 && (
            <>
              <Marker
                coordinate={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                }}
                pinColor="#447aca"
                title="Destination"
                icon={require("@/assets/repair.png")}
                flat={true}
                description={destination.formatted_address}
                onDragEnd={(e) => setDestination(e.nativeEvent.coordinate)}
              />
              <Polyline
                coordinates={pathCoordinates}
                strokeColor="#0f53ff" // Path color
                strokeWidth={6}
              />
            </>
          )}
        </MapView>
        {distance > 160 &&
          Alert.alert(
            "Destination is too far",
            "Please select a destination within 100 miles",
            [
              {
                text: "OK",
                onPress: () => {
                  setDistance(0);
                  setDestination(null);
                },
              },
            ]
          )}
        <View style={styles.searchBar}>
          <View>
            <Picker
              selectedValue={vehicle}
              onValueChange={(itemValue) => setVehicle(itemValue)}
              style={styles.picker}
            >
              {vehicles.map((vehicle, index) => (
                <Picker.Item
                  key={index}
                  label={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
                  value={vehicle._id}
                />
              ))}
            </Picker>
            <Text style={{ color: "red" }}>{vehicleError}</Text>
          </View>
          <MapSarchBar
            // apikey={GOOGLE_MAPS_APIKEY}
            selectedItem={(item) =>
              setDestination({
                latitude: item.geometry.coordinates[1],
                longitude: item.geometry.coordinates[0],
                formatted_address: item.properties.formatted,
              })
            }
          />
        </View>
      </View>
      {distance > 0 && distance < 160 && (
        <View style={styles.nearbyContainer}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.priceText}>
                Distance: {distance.toFixed(2)} mi
              </Text>
              <Text style={styles.priceText}>
                Estimated Price: ${price.toFixed(2)}
              </Text>
              <Button
                mode="contained"
                icon="tow-truck"
                onPress={handleRequestService}
                style={styles.button}
              >
                Request Service
              </Button>
            </Card.Content>
          </Card>
        </View>
      )}
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
    left: 20,
    right: 20,
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
    backgroundColor: Theme.colors.primary,
  },
  picker: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
});

export default Towing;
