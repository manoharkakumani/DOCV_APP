// SignIn.js
import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { router } from "expo-router";
import { customerLogin } from "@/utils/api";
import { useUserContext } from "@/context/UserContext";

const SignIn = () => {
  const { user, setUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
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
    try {
      const res = await customerLogin(email, password);
      if (res.status === 200) {
        setUser(res.data);
        router.replace("/home");
      } else {
        setError(res.data.error);
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
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
      <Button onPress={() => router.push("/signup")}>
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
