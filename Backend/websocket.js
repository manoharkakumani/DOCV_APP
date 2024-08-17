// websocketServer.js

import { WebSocketServer, WebSocket } from "ws";

import {
  handleCustomerChannels,
  handleTowerChannels,
  handleServiceChannels,
} from "./channels/index.js";

const clients = {};

const pendingRequests = {};

const initializeWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    // Extract userId and role (user/tower) from URL
    const urlParts = req.url.split("/");
    const userId = urlParts.pop();
    const role = urlParts.pop();
    console.log(`Connection established for ${role}_${userId}`);
    const clientKey = `${role}_${userId}`;
    clients[clientKey] = ws;

    ws.on("message", (message) => {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.channel) {
        case "Customer":
          handleCustomerChannels(parsedMessage);
          break;
        case "Tower":
          handleTowerChannels(parsedMessage);
          break;
        case "Service":
          handleServiceChannels(parsedMessage);
          break;
        default:
          console.log("Unknown channel:", parsedMessage.channel);
      }
    });

    ws.on("close", () => {
      console.log(`Connection closed for ${clientKey}`);
      delete clients[clientKey];
    });
  });

  return wss;
};

const sendTo = (role, userId, message) => {
  const clientKey = `${role}_${userId}`;
  console.log(`Sending message to ${clientKey}`);
  const userSocket = clients[clientKey];
  message.channel = role;
  if (userSocket && userSocket.readyState === WebSocket.OPEN) {
    userSocket.send(JSON.stringify(message));
    return true;
  }
  return false;
};

export { initializeWebSocketServer, sendTo, pendingRequests };
