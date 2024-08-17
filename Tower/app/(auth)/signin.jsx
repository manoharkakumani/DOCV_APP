// SignIn.js
import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { serviceProviderLogin } from "@/utils/api";
import { useUserContext } from "@/context/UserContext";

import { router } from "expo-router";

import * as Location from "expo-location";

const SignIn = () => {
  const [location, setLocation] = useState([null, null]);
  const { user, SetUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setLocation([location.coords.latitude, location.coords.longitude]);
    console.log("Location:", location.coords);
  };
  useEffect(() => {
    if (user) {
      router.replace("/home");
      return;
    }
    fetchLocation();
  }, [user]);

  const validate = () => {
    let isValid = true;
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
    return isValid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    const response = await serviceProviderLogin({
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        {emailError && <Text style={styles.error}>{emailError}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        {passwordError && <Text style={styles.error}>{passwordError}</Text>}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="contained" onPress={handleSignIn}>
        Sign In
      </Button>
      <Button onPress={() => router.push("/(auth)/signup")}>
        Don't have an account? Sign Up
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
  error: {
    color: "red",
    fontSize: 12,
  },
});

export default SignIn;
