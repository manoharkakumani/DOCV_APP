// This file contains the logic for handling messages received from the service channel.
import { handleNewMessage } from "../controllers/chat.js";

const handleChatMessage = async (message) => {
  const { chatId, text, senderId, receiverId } = message;
  await handleNewMessage(
    { chatId, text, senderId, receiverId },
    "Customer",
    "Service"
  );
};

const handleDataUpdate = (message) => {
  // Implement data update handling logic
  console.log("Data update message received:", message);
};

const handleNotification = (message) => {
  // Implement notification handling logic
  console.log("Notification message received:", message);
};

const handleServiceChannels = (message) => {
  console.log("Service request response received:", message);

  switch (message.type) {
    case "chat":
      handleChatMessage(message);
      break;
    case "dataUpdate":
      handleDataUpdate(message);
      break;
    case "notification":
      handleNotification(message);
      break;
    default:
      console.log("Unknown message type:", message);
  }
};

export default handleServiceChannels;
