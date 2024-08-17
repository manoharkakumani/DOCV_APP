import React, { useState, useCallback } from "react";
import {
  View,
  Alert,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Text, Card, IconButton, Button } from "react-native-paper";
import { CardField, useConfirmSetupIntent } from "@stripe/stripe-react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getPaymentMethods,
  createSetupIntent,
  deletePaymentMethod,
} from "@/utils/api"; // Assume these are defined

import { useUserContext } from "@/context/UserContext";
import { useGlobalRefresh } from "@/context/GlobalRefreshContext";

const Payments = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addCard, setAddCard] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const { confirmSetupIntent, loading } = useConfirmSetupIntent();
  const { user } = useUserContext();

  const { refreshing: globalRefreshing, onRefresh: onGlobalRefresh } =
    useGlobalRefresh();
  const [localRefreshing, setLocalRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setLocalRefreshing(true);
    await fetchPaymentMethods();
    setLocalRefreshing(false);
  }, [fetchPaymentMethods]);

  const onRefresh = useCallback(async () => {
    await onGlobalRefresh();
    await handleRefresh();
  }, [onGlobalRefresh, handleRefresh]);

  const fetchPaymentMethods = async () => {
    const response = await getPaymentMethods(user.stripeId);
    if (response.status === 200) {
      setPaymentMethods(response.data);
    } else {
      Alert.alert("Error", "Failed to load payment methods");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPaymentMethods();
    }, [])
  );

  const handleDeletePaymentMethod = async (paymentMethodId) => {
    const response = await deletePaymentMethod(paymentMethodId);
    if (response.status === 200) {
      setPaymentMethods((prevMethods) =>
        prevMethods.filter((method) => method.id !== paymentMethodId)
      );
      Alert.alert("Success", "Payment method deleted successfully");
    } else {
      Alert.alert("Error", "Failed to delete payment method");
    }
  };

  const handleSaveCard = async () => {
    if (!cardDetails) {
      Alert.alert("Error", "Please enter card details");
      return;
    }

    if (
      cardDetails.validNumber === "Incomplete" ||
      cardDetails.validNumber === "Invalid"
    ) {
      Alert.alert("Error", "Please enter a valid card number");
      return;
    }

    if (
      cardDetails.validCVC === "Incomplete" ||
      cardDetails.validCVC === "Invalid"
    ) {
      Alert.alert("Error", "Please enter a valid CVC");
      return;
    }

    if (
      cardDetails.expiryMonth === "Incomplete" ||
      cardDetails.expiryMonth === "Invalid"
    ) {
      Alert.alert("Error", "Please enter a valid expiry month");
      return;
    }

    if (
      cardDetails.expiryYear === "Incomplete" ||
      cardDetails.expiryYear === "Invalid"
    ) {
      Alert.alert("Error", "Please enter a valid expiry year");
      return;
    }

    const response = await createSetupIntent(user.stripeId);

    if (response.status === 200) {
      const { client_secret } = response.data;
      const { error } = await confirmSetupIntent(client_secret, {
        paymentMethodType: "Card",
        billingDetails: {
          name: user.name,
          email: user.email,
        },
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Card added successfully");
        setAddCard(false);
        setCardDetails(null);
        fetchPaymentMethods();
      }
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={localRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        {addCard ? (
          <View style={styles.addCard}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Add Card
            </Text>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: "4242 4242 4242 4242",
              }}
              cardStyle={{
                backgroundColor: "#FFFFFF",
                textColor: "#000000",
              }}
              style={{
                width: "100%",
                height: 50,
                marginVertical: 30,
              }}
              onCardChange={(cardDetails) => {
                setCardDetails(cardDetails);
              }}
            />
            <Button
              mode="contained"
              onPress={() => handleSaveCard()}
              style={styles.button}
            >
              Save Card
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setAddCard(false);
                setCardDetails(null);
              }}
              style={styles.button}
            >
              Cancel
            </Button>
          </View>
        ) : (
          <View>
            <Button
              mode="contained"
              onPress={() => setAddCard(true)}
              style={styles.button}
            >
              Add Card
            </Button>
            {paymentMethods.length === 0 && (
              <Text style={{ marginTop: 20 }}>No payment methods added</Text>
            )}
            {paymentMethods.length > 0 &&
              paymentMethods.map((method) => (
                <Card style={styles.card} key={method.id}>
                  <Card.Title
                    title={method.card.brand}
                    subtitle={`**** **** **** ${method.card.last4}`}
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="delete"
                        onPress={() => handleDeletePaymentMethod(method.id)}
                      />
                    )}
                  />
                  <Card.Content>
                    <Text>
                      Expires:{" "}
                      {`${method.card.exp_month}/${method.card.exp_year}`}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginVertical: 10,
    width: "90%",
    alignSelf: "center",
  },
  addCard: {
    marginVertical: 20,
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    width: "90%",
    alignSelf: "center",
  },
});

export default Payments;
