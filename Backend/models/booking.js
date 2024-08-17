import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  cancledAt: { type: Date, default: null },
  type: {
    type: String,
    enum: ["Towing", "Service"],
    default: "Service",
  },
  services: {
    type: Array,
    default: [],
    required: true,
  },
  notes: {
    type: Array,
    default: [],
  },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  charges: {
    type: Array,
    default: [],
  },
  cost: { type: Number, required: true },
  paid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Ongoing", "Completed", "Cancelled"],
    default: "Pending",
  },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
  },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },

  // For Towing
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
  },
});

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
