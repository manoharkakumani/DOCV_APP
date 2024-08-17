// This file contains the logic for handling messages received from the tower channel.

import { sendTo, pendingRequests } from "../websocket.js";
import { Booking, ServiceProvider, Ride } from "../models/index.js";
import { handleNewMessage } from "../controllers/chat.js";

const handleChatMessage = async (message) => {
  const { chatId, text, senderId, receiverId } = message;
  await handleNewMessage(
    { chatId, text, senderId, receiverId },
    "Customer",
    "Tower"
  );
};

const handleStatus = async (message) => {
  const { servicemanId, isOnline, location } = message;

  const serviceProvider = await ServiceProvider.findById(servicemanId);
  if (!serviceProvider) {
    console.log("Service provider not found:", servicemanId);
    return;
  }

  serviceProvider.available = isOnline;
  serviceProvider.location = {
    type: "Point",
    coordinates: [location.latitude, location.longitude],
  };
  await serviceProvider.save();

  // console.log("Status message received:", message);
};

const handleDataUpdate = (message) => {
  // Implement data update handling logic
  console.log("Data update message received:", message);
};

const handleNotification = (message) => {
  // Implement notification handling logic
  console.log("Notification message received:", message);
};

const handleLocation = async (message) => {
  console.log("Location message received:", message);
  const { servicemanId, bookingId, rideId, customerId, location } = message;
  await ServiceProvider.findByIdAndUpdate(servicemanId, {
    location: {
      type: "Point",
      coordinates: [location.latitude, location.longitude],
    },
  });
  await Ride.findByIdAndUpdate(rideId, {
    driver: {
      type: "Point",
      coordinates: [location.latitude, location.longitude],
    },
  });

  sendTo("Customer", customerId, {
    type: "location",
    location,
    bookingId,
    rideId,
  });

  console.log("Location updated:", servicemanId, location);
};

const handleServiceRequestResponse = async (message) => {
  const { bookingId, response } = message;
  const requestStatus = pendingRequests[bookingId];
  console.log("Service request response received:", requestStatus);

  if (!requestStatus || requestStatus.status !== "pending") {
    sendTo("Tower", message.sender, {
      type: "notification",
      message: "Request already handled",
    });
    return;
  }

  if (response === "accept") {
    pendingRequests[bookingId].status = "accepted";
    pendingRequests[bookingId].towerId = `Tower_${message.sender}`;

    // Update the booking in the database
    await Booking.findByIdAndUpdate(bookingId, {
      serviceProviderId: message.sender,
      status: "Accepted",
    });

    await Ride.findByIdAndUpdate(requestStatus.rideId, {
      status: "Accepted",
    });

    await ServiceProvider.findByIdAndUpdate(message.sender, {
      available: false,
    });

    // Notify the user about the acceptance
    sendTo("Customer", requestStatus.customerId, {
      type: "notification",
      message: "Your towing request has been accepted",
      bookingId,
      towerId: message.sender,
    });
    sendTo("Customer", requestStatus.customerId, {
      type: "navigation",
      screen: "/bookings",
    });
  } else {
    // Move to the next tower in the queue
    const nextTowerIndex = requestStatus.currentTowerIndex + 1;
    if (nextTowerIndex < requestStatus.towerQueue.length) {
      const nextTowerId = requestStatus.towerQueue[nextTowerIndex]._id;
      requestStatus.currentTowerIndex = nextTowerIndex;
      sendTo("Tower", nextTowerId, {
        type: "serviceRequest",
        message: "New towing request available",
        bookingId,
      });
    } else {
      // No more towers available, reject the request
      await Booking.findByIdAndUpdate(bookingId, { status: "Rejected" });
      await Ride.findByIdAndUpdate(requestStatus.rideId, {
        status: "Rejected",
      });

      delete pendingRequests[bookingId];

      // Notify the user that the request was not accepted
      sendTo("Customer", requestStatus.customerId, {
        type: "notification",
        message: "Your towing request was not accepted by any available towers",
        bookingId,
      });
      sendTo("Customer", requestStatus.customerId, {
        type: "navigation",
        screen: "/bookings",
      });
      console.log("No more towers available for the request:", bookingId);
    }
  }
};

const handleTowerChannels = (message) => {
  switch (message.type) {
    case "chat":
      handleChatMessage(message);
      break;
    case "dataUpdate":
      handleDataUpdate(message);
      break;
    case "location":
      handleLocation(message);
      break;
    case "notification":
      handleNotification(message);
      break;
    case "serviceRequest":
      handleServiceRequestResponse(message);
      break;
    case "availability":
      handleStatus(message);
      break;
    default:
      console.log("Unknown message type:", message);
  }
};

export default handleTowerChannels;
