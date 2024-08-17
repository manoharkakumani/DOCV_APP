import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  fuelType: {
    type: String,
    required: true,
  },
  transmission: {
    type: String,
    required: true,
  },
  registrationPlate: {
    type: String,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
});

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

export default Vehicle;
