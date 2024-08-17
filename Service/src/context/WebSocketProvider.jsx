import React, {
  createContext,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import { socketURL } from "../utils/api";
import { useSelector } from "react-redux";

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const wsRef = useRef(null);
  const timeoutRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const connectWebSocket = () => {
      if (user) {
        wsRef.current = new WebSocket(`${socketURL}/Service/${user._id}`);

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
      case "notification":
        showNotification("New Notification", message.message);
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          message,
        ]);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const updateToServer = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      message.channel = "Service";
      message.sender = user._id;
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.log("WebSocket not open. Unable to send message:", message);
    }
  };
  return (
    <WebSocketContext.Provider
      value={{
        ws: wsRef.current,
        updateToServer,
        messages,
        notifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
