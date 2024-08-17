// SignUp.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import * as Location from "expo-location";

import { serviceProviderSignup } from "@/utils/api";

import { useUserContext } from "@/context/UserContext";
import { router } from "expo-router";

const SignUp = () => {
  const { user, SetUser } = useUserContext();
  const [location, setLocation] = useState([null, null]);
  const [name, setName] = useState("");
  const [NameError, setNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/home");
      return;
    }
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation([location.coords.latitude, location.coords.longitude]);
    })();
  }, []);

  const validate = () => {
    let isValid = true;
    if (name === "") {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }
    if (phone === "") {
      setPhoneError("Phone is required");
      isValid = false;
    } else {
      setPhoneError("");
    }
    if (email === "") {
      setEmailError("Email is required");
      isValid = false;
    } else {
      setEmailError("");
    }
    if (password === "") {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }
    if (confirmPassword === "") {
      setConfirmPasswordError("Confirm Password is required");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    return isValid;
  };

  const handleSignUp = async () => {
    if (validate()) {
      const response = await serviceProviderSignup({
        name,
        email,
        password,
        location,
        type: "Tower",
      });
      if (response.status === 200) {
        SetUser(response.data);
        router.replace("/home");
      } else {
        setError(response.data.error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        {NameError && <Text style={styles.errorText}>{NameError}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
        {phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
        />
        {confirmPasswordError && (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button mode="contained" onPress={handleSignUp}>
        Sign Up
      </Button>
      <Button onPress={() => router.replace("/(auth)/signin")}>
        Already have an account? Sign In
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  // input: {
  //   backgroundColor: "transparent",
  // },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
});

export default SignUp;
