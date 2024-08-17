import mongoose from "mongoose";

const ServiceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    enum: ["Tower", "Service"],
    type: String,
    default: "Service",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    // required: true
  },
  address: {
    type: String,
    // required: true,
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  available: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  services: {
    type: Array,
    default: [],
  },
  earnings: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  lastAudit: {
    type: Date,
    default: new Date(Date.now()),
  },
  recentAudits: {
    type: Array,
    default: [],
  },
});

ServiceProviderSchema.index({ location: "2dsphere" });

const ServiceProvider = mongoose.model(
  "ServiceProvider",
  ServiceProviderSchema
);

export default ServiceProvider;
