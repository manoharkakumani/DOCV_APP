import React, { useState, useEffect } from "react";

import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import Theme from "@/styles/Theme"; // Import the theme
import { addVehicle } from "@/utils/api";
import { useUserContext } from "@/context/UserContext";
import { router } from "expo-router";

const AddVehicle = () => {
  const [make, setMake] = useState("");
  const [makeError, setMakeError] = useState("");
  const [model, setModel] = useState("");
  const [modelError, setModelError] = useState("");
  const [year, setYear] = useState("");
  const [yearError, setYearError] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [fuelTypeError, setFuelTypeError] = useState("");
  const [transmission, setTransmission] = useState("");
  const [transmissionError, setTransmissionError] = useState("");
  const [registrationPlate, setRegistrationPlate] = useState("");
  const [registrationPlateError, setRegistrationPlateError] = useState("");
  const [error, setError] = useState("");

  const { user } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.replace("SignIn");
      }
    };
    fetchData();
  }, [user]);

  const validateVehicle = () => {
    let isValid = true;
    if (!make) {
      setMakeError("Make is required");
      isValid = false;
    } else {
      setMakeError("");
    }
    if (!model) {
      setModelError("Model is required");
      isValid = false;
    } else {
      setModelError("");
    }
    if (!year) {
      setYearError("Year is required");
      isValid = false;
    } else {
      setYearError("");
    }

    if (!fuelType) {
      setFuelTypeError("Fuel Type is required");
      isValid = false;
    } else {
      setFuelTypeError("");
    }
    if (!transmission) {
      setTransmissionError("Transmission is required");
      isValid = false;
    } else {
      setTransmissionError("");
    }
    if (!registrationPlate) {
      setRegistrationPlateError("Registration Plate is required");
      isValid = false;
    } else {
      setRegistrationPlateError("");
    }
    return isValid;
  };

  const handleAddVehicle = async () => {
    if (!validateVehicle()) {
      return;
    }
    const vehicle = {
      make,
      model,
      year,
      fuelType,
      transmission,
      registrationPlate,
      customerId: user._id,
    };

    const response = await addVehicle(vehicle);
    if (response.status === 201) {
      router.replace("/vehicles");
    } else {
      setError(response.data.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            label="Make"
            mode="outlined"
            value={make}
            onChangeText={setMake}
            placeholder="Toyota"
            style={styles.textInput}
          />
          <Text style={{ color: "red" }}>{makeError}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            label="Model"
            mode="outlined"
            value={model}
            onChangeText={setModel}
            placeholder="Camry"
            style={styles.textInput}
          />
          <Text style={{ color: "red" }}>{modelError}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            label="Year"
            mode="outlined"
            value={year}
            onChangeText={setYear}
            placeholder="2024"
            keyboardType="numeric"
            style={styles.textInput}
          />
          <Text style={{ color: "red" }}>{yearError}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            label="Fuel Type"
            mode="outlined"
            value={fuelType}
            onChangeText={setFuelType}
            placeholder="Petrol"
            style={styles.textInput}
          />
          <Text style={{ color: "red" }}>{fuelTypeError}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            label="Transmission"
            mode="outlined"
            value={transmission}
            onChangeText={setTransmission}
            placeholder="Automatic"
            style={styles.textInput}
          />
          <Text style={{ color: "red" }}>{transmissionError}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            label="Registration Plate"
            mode="outlined"
            value={registrationPlate}
            onChangeText={setRegistrationPlate}
            placeholder="ABC-1234"
            style={styles.textInput}
          />
          <Text style={{ color: "red" }}>{registrationPlateError}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleAddVehicle}
          style={styles.addButton}
        >
          Add Vehicle
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.light,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  textInput: {
    backgroundColor: Theme.colors.white,
    marginBottom: 5,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
    width: "100%",
  },
});

export default AddVehicle;
