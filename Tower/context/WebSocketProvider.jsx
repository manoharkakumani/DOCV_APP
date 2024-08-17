import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUserContext } from "./UserContext";
import { socketURL } from "@/utils/api";
import { showNotification } from "@/utils/notificationService";
import { View, Text, Button, StyleSheet } from "react-native";
import Modal from "react-native-modal";

import { router } from "expo-router";

const WebSocketContext = createContext(null);

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

  useEffect(() => {
    const connectWebSocket = () => {
      if (user) {
        wsRef.current = new WebSocket(`${socketURL}/Tower/${user._id}`);

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

    if (user !== "null") {
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
        console.log("Chat message received:", message);
        showNotification("New Message", message.message);
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
        console.log("Navigation message received:", message);
        break;
      case "serviceRequest":
        setCurrentRequest(message);
        setModalVisible(true);
        timeoutRef.current = setTimeout(() => {
          updateToServer({
            type: "serviceRequest",
            response: "reject",
            bookingId: message.bookingId,
          });
          setModalVisible(false);
        }, 30000);
        break;
      case "responseToServiceRequest":
        showNotification("Request Response", message.text);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const updateToServer = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      message.channel = "Tower";
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
        updateToServer,
      }}
    >
      {children}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{currentRequest?.message} </Text>
          <Text style={styles.modalMessage}>
            {" "}
            Distance : {currentRequest?.distance + " mi"}
          </Text>
          <Text style={styles.modalMessage}>
            {" "}
            Price : ${currentRequest?.cost}
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Accept" onPress={handleAccept} />
            <Button title="Reject" onPress={handleReject} />
          </View>
        </View>
      </Modal>
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
