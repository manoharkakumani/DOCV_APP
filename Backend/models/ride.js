import mongoose from "mongoose";

const RideSchema = new mongoose.Schema({
  driver: {
    type: { type: String, enum: ["Point"] },
    coordinates: {
      type: [Number], // Array of numbers
    },
  },
  from: {
    type: { type: String, enum: ["Point"] },
    coordinates: {
      type: [Number], // Array of numbers
    },
    formatted_address: String,
  },
  from_formatted_address: {
    type: String,
  },
  to: {
    type: { type: String, enum: ["Point"] },
    coordinates: {
      type: [Number], // Array of numbers
    },
  },
  to_formatted_address: {
    type: String,
  },
});

RideSchema.index({ driver: "2dsphere", from: "2dsphere", to: "2dsphere" });

const Ride = mongoose.model("Ride", RideSchema);
export default Ride;
