import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Snackbar } from "react-native-paper";
import { useUserContext } from "@/context/UserContext";
// import { withdrawFunds } from "@/utils/api";

import { router, useLocalSearchParams } from "expo-router";
import Theme from "../../styles/Theme";

const Withdraw = () => {
  const { balance: balanceString } = useLocalSearchParams();
  const balance = JSON.parse(balanceString);
  const { user } = useUserContext();
  const [amount, setAmount] = useState(String(balance)); // Set the initial value to the user's balance
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      if (amount === "") {
        setError("Amount is required");
        return;
      } else if (parseInt(amount) > balance) {
        setError("Insufficient funds");
        return;
      } else {
        setError("Withdrawal successful!");
      }

      //   const response = await withdrawFunds(user._id, amount, paymentMethod);
      //   if (response.status === 200) {
      //     setSuccess(true);
      //     // Update user balance and transaction history context or state
      //   } else {
      //     setError("Failed to withdraw funds. Please try again later.");
      //   }
    } catch (error) {
      setError("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/(auth)/signin");
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <TextInput
        label="Withdrawal Amount ($)"
        value={amount}
        onChangeText={(text) => setAmount(text)}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleWithdraw}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Withdraw
      </Button>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        style={styles.snackbar}
        duration={Snackbar.DURATION_SHORT}
      >
        {error}
      </Snackbar>
      <Snackbar
        style={styles.snackbar}
        visible={success}
        onDismiss={() => {
          setSuccess(false);
          navigation.goBack();
        }}
        duration={Snackbar.DURATION_SHORT}
      >
        Withdrawal successful!
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  snackbar: {
    backgroundColor: Theme.colors.primary,
  },
});

export default Withdraw;
