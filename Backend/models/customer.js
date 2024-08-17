import mongoose from "mongoose";
const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  vehicles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  ],
  stripeId: {
    type: String,
    required: true,
  },
});

const Customer = mongoose.model("Customer", CustomerSchema);

export default Customer;
