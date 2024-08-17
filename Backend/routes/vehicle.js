import express from "express";
import {
  addVehicle,
  getVehicles,
  getVehicleById,
  getVehiclesByUserId,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.js";

const vehicleRoutes = express.Router();

vehicleRoutes.post("/", addVehicle);
vehicleRoutes.get("/", getVehicles);
vehicleRoutes.get("/:id", getVehicleById);
vehicleRoutes.get("/user/:id", getVehiclesByUserId); // Get vehicles by user ID
vehicleRoutes.put("/:id", updateVehicle);
vehicleRoutes.delete("/:id", deleteVehicle);

export default vehicleRoutes;
