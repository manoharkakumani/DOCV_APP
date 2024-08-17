// This function is responsible for handling messages received from the customer channels.

import { sendTo } from "../websocket.js";
import { handleNewMessage } from "../controllers/chat.js";

import { Booking, ServiceProvider } from "../models/index.js";

const handleChatMessage = (message) => {
  // Implement chat message handling logic
  const { chatId, text, senderId, receiverId, receiverType } = message;
  handleNewMessage(
    { chatId, text, senderId, receiverId },
    receiverType,
    "Customer"
  );
};

const handlePayment = async (message) => {
  const { amount, bookingId, receiverId, receiverType } = message;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    console.log("Booking not found");
    return;
  }

  const serviceProvider = await ServiceProvider.findById(receiverId);
  if (!serviceProvider) {
    console.log("Service provider not found");
    return;
  }

  booking.paid += amount;
  booking.balance ? (booking.balance -= amount) : 0;

  await booking.save();

  serviceProvider.earnings += amount;
  serviceProvider.balance += amount;

  await serviceProvider.save();
};

const handleDataUpdate = (message) => {
  // Implement data update handling logic
  console.log("Data update message received:", message);
};

const handleNotification = (message) => {
  // Implement notification handling logic
  console.log("Notification message received:", message);
};

const responseToServiceRequest = (message) => {
  // Implement service request handling logic
  console.log("Service request received:", message);
};

const handleCustomerChannels = (message) => {
  switch (message.type) {
    case "chat":
      handleChatMessage(message);
      break;
    case "payment":
      handlePayment(message);
      break;
    case "dataUpdate":
      handleDataUpdate(message);
      break;
    case "notification":
      handleNotification(message);
      break;
    case "serviceRequest":
      responseToServiceRequest(message);
      break;

    default:
      console.log("Unknown message type:", message);
  }
};

export default handleCustomerChannels;
