import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUserContext } from "./UserContext";
import { socketURL, assignTower } from "../utils/api";
import { showNotification } from "../utils/notificationService";
import { router } from "expo-router";
import { Alert, View, Text, Button, StyleSheet } from "react-native";
import Modal from "react-native-modal";

import { StripeProvider, usePaymentSheet } from "@stripe/stripe-react-native";

export const WebSocketContext = createContext(null);

export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const { user } = useUserContext();
  const wsRef = useRef(null);
  const timeoutRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [dataUpdates, setDataUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const { initPaymentSheet, presentPaymentSheet, loading } = usePaymentSheet();

  useEffect(() => {
    const connectWebSocket = () => {
      if (user) {
        wsRef.current = new WebSocket(`${socketURL}/Customer/${user._id}`);

        wsRef.current.onopen = () => {
          console.log("WebSocket connection opened");
        };

        wsRef.current.onmessage = (e) => {
          const message = JSON.parse(e.data);
          handleMessage(message);
        };

        wsRef.current.onerror = (e) => {
          console.log("WebSocket error:", e.message);
        };

        wsRef.current.onclose = (e) => {
          console.log("WebSocket connection closed, retrying...");
          setTimeout(connectWebSocket, 1000);
        };
      }
    };

    if (user) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user]);

  const handleMessage = (message) => {
    switch (message.type) {
      case "chat":
        setMessages((prevMessages) => [...prevMessages, message]);
        break;
      case "dataUpdate":
        setDataUpdates((prevDataUpdates) => [...prevDataUpdates, message]);
        break;
      case "notification":
        showNotification("New Notification", message.message);
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          message,
        ]);
        break;
      case "navigation":
        console.log("Navigation message:", message);
        break;
      case "serviceAccepted":
        handleServiceAccepted(message);
        break;
      case "serviceRejected":
        handleServiceRejected(message);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const processPayment = async (
    client_secret,
    ephemeralKey,
    stripeId,
    bookingId
  ) => {
    try {
      const { error: paymentSheetError } = await initPaymentSheet({
        merchantDisplayName: "Example, Inc.",
        paymentIntentClientSecret: client_secret,
        customerId: stripeId,
        customerEphemeralKeySecret: ephemeralKey,
        allowsDelayedPaymentMethods: true,
        merchantCountryCode: "US",
        applePay: {
          merchantId: "merchant.com.example",
          merchantCountryCode: "US",
        },
        googlePay: {
          merchantCountryCode: "US",
          merchantName: "Example, Inc.",
        },
        style: "alwaysSave",
        defaultBillingDetails: {
          email: user.email,
          name: user.name,
        },
      });

      if (paymentSheetError) {
        Alert.alert("Something went wrong", paymentSheetError.message);
        return;
      }
      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        Alert.alert(`Error code: ${paymentError.code}`, paymentError.message, [
          { text: "OK", onPress: () => router.push("/home") },
          {
            text: "Try Again",
            onPress: () => processPayment(clientSecret, ephemeralKey, stripeId),
          },
        ]);
        return;
      }
      Alert.alert("Payment succeeded", "Your payment was successful!");
      console.log("Payment succeeded");
      await assignTower(bookingId);
      router.push("/home");
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Payment error", "There was an error processing the payment");
    }
  };

  const handleServiceAccepted = async (message) => {
    try {
      showNotification("Service Request Accepted", message.message);
    } catch (error) {
      console.error("Payment intent error:", error);
      Alert.alert("Payment error", "There was an error processing the payment");
    }
  };

  const handleServiceRejected = (message) => {
    Alert.alert(
      "Service Request Rejected",
      "Your towing request was rejected.",
      [{ text: "OK", onPress: () => router.push("/home") }]
    );
  };

  const updateToServer = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      message.channel = "Customer";
      message.sender = user._id;
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.log("WebSocket not open. Unable to send message:", message);
    }
  };

  const handleAccept = () => {
    updateToServer({
      type: "serviceRequest",
      response: "accept",
      bookingId: currentRequest.bookingId,
    });
    clearTimeout(timeoutRef.current);
    setModalVisible(false);
    router.push("/home");
  };

  const handleReject = () => {
    updateToServer({
      type: "serviceRequest",
      response: "reject",
      bookingId: currentRequest.bookingId,
    });
    clearTimeout(timeoutRef.current);
    setModalVisible(false);
  };

  return (
    <WebSocketContext.Provider
      value={{
        ws: wsRef.current,
        messages,
        dataUpdates,
        notifications,
        processPayment,
        updateToServer,
      }}
    >
      <StripeProvider
        publishableKey="pk_test_51PU46lF9Z6JyizBXk35EkAAGx2WJ0B2OfG6DPg24PKt5knNPq7ffRfhHSmpXLkB8l3JRbdSvDTSiCGUKvu3z3hFV000DoRxu7g"
        merchantIdentifier="merchant.com.example"
      >
        {children}
        <Modal isVisible={isModalVisible}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Request</Text>
            <Text style={styles.modalMessage}>{currentRequest?.message}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Accept" onPress={handleAccept} />
              <Button title="Reject" onPress={handleReject} />
            </View>
          </View>
        </Modal>
      </StripeProvider>
    </WebSocketContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default WebSocketProvider;
