import { Vehicle, Customer } from "../models/index.js";

export const addVehicle = async (req, res) => {
  try {
    const {
      make,
      model,
      year,
      fuelType,
      transmission,
      registrationPlate,
      customerId,
    } = req.body;

    if (
      !make ||
      !model ||
      !year ||
      !fuelType ||
      !transmission ||
      !registrationPlate ||
      !customerId
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    const vehicle = new Vehicle({
      make,
      model,
      year,
      fuelType,
      transmission,
      registrationPlate,
      customerId,
    });

    await vehicle.save();

    customer.vehicles.push(vehicle._id);
    await customer.save();

    console.log("Vehicle added successfully");
    res.status(201).json(vehicle);
  } catch (err) {
    console.log("Error during vehicle creation:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("bookings");
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("bookings");
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getVehiclesByUserId = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "vehicles"
    );
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer.vehicles);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    // Remove the vehicle reference from the associated customer
    const customer = await Customer.findById(vehicle.customerId);
    if (customer) {
      customer.vehicles.pull(vehicle._id);
      await customer.save();
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
