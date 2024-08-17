import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useWebSocketContext } from "@/context/WebSocketProvider";
import { useUserContext } from "@/context/UserContext";
import { getChatMessages } from "@/utils/api";

import { useLocalSearchParams, router } from "expo-router";

const Chat = () => {
  const { booking: bookingString } = useLocalSearchParams();
  const booking = JSON.parse(bookingString);
  const { chatId, serviceProviderId, customerId } = booking;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { ws, updateToServer } = useWebSocketContext();
  const { user } = useUserContext();
  const scrollViewRef = useRef();

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/signin");
    }
    const fetchMessages = async () => {
      const response = await getChatMessages(chatId);
      if (response.status === 200) {
        setMessages(response.data.messages);
      }
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    const handleMessage = (e) => {
      const message = JSON.parse(e.data);
      console.log("Message received:", message);
      if (message.type === "chat" && message.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, message.message]);
      }
    };

    if (ws) {
      ws.addEventListener("message", handleMessage);
    }

    return () => {
      if (ws) {
        ws.removeEventListener("message", handleMessage);
      }
    };
  }, [ws, chatId]);

  const sendMessage = () => {
    if (text.trim()) {
      const newMessage = {
        type: "chat",
        chatId,
        text,
        senderId: user._id,
        receiverId:
          user._id === serviceProviderId
            ? customerId._id
            : serviceProviderId._id,
      };
      updateToServer(newMessage);
      setText("");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.messageContainer}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={
              message.senderId === user._id
                ? styles.myMessage
                : styles.otherMessage
            }
          >
            <Text
              style={
                message.senderId === user._id
                  ? styles.myMessageText
                  : styles.otherMessageText
              }
            >
              {message.message}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <MaterialIcons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messageContainer: {
    flex: 1,
    margin: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2C3E50",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: "70%",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    maxWidth: "70%",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  myMessageText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  otherMessageText: {
    fontSize: 16,
    color: "#2C3E50",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#DDD",
  },
  input: {
    flex: 1,
    height: 30,
    fontSize: 16,
    marginRight: 10,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
  },
  sendButton: {
    backgroundColor: "#2C3E50",
    borderRadius: 20,
    padding: 10,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Chat;
