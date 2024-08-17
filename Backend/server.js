import express from "express";
import dbConnection from "./config/dbConnection.js";
import cors from "cors";
import {
  customerRoutes,
  vehicleRoutes,
  bookingRoutes,
  serviceProviderRoutes,
  chatRoutes,
  paymentRoutes,
  earningsRoutes,
  rideRoutes,
} from "./routes/index.js";
import { initializeWebSocketServer, sendTo } from "./websocket.js";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/customer", customerRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/service-provider", serviceProviderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/earnings", earningsRoutes);
app.use("/api/ride", rideRoutes);

app.get("*", (req, res) => {
  res.redirect("/");
});

app.post("/send", (req, res) => {
  const { role, userId, message } = req.body;
  const success = sendTo(role, userId, message);
  if (success) {
    res.status(200).send("Message sent");
  } else {
    res.status(404).send("User not connected");
  }
});

await dbConnection()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    // Initialize WebSocket server
    initializeWebSocketServer(server);
  })
  .catch((err) => {
    console.log(err);
  });
