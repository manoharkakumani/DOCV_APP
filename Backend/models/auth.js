import e from "express";
import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  type: {
    enum: ["Customer", "Service", "Tower"],
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Auth = mongoose.model("Auth", AuthSchema);

export default Auth;
