import { Customer, Auth } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { stripe } from "../utils/constants.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = "your_jwt_secret"; // Replace with your actual secret

export const addCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    const findCustomer = await Customer.findOne({ email });
    if (findCustomer) {
      return res.status(400).json({ error: "Customer already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const stripeCustomer = await stripe.customers.create({
      email,
      name,
    });

    console.log("Stripe customer:", stripeCustomer);

    const customer = new Customer({
      name,
      email,
      stripeId: stripeCustomer.id,
    });
    await customer.save();

    const auth = new Auth({
      userId: customer._id,
      type: "Customer",
      email,
      password: hashedPassword,
    });
    await auth.save();
    const token = jwt.sign({ id: customer._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    customer.token = token;
    res.status(201).json(customer);
  } catch (err) {
    console.log("Error during customer creation:", err);
    res.status(400).json({ error: err.message });
  }
};

export const signCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const auth = await Auth.findOne({ email, type: "Customer" });
    if (!auth) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const customer = await Customer.findById(auth.userId);
    if (!customer) {
      return res.status(400).json({ error: "Customer not found" });
    }
    customer.token = jwt.sign({ id: customer._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("vehicles");
    res.status(200).json(customers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "vehicles"
    );
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
