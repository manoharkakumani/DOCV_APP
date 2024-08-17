import { RideController } from "../controllers/index.js";
import express from "express";

const rideRoutes = express.Router();

rideRoutes.get("/:id", RideController.getRide);
rideRoutes.put("/:id", RideController.updateRide);
rideRoutes.delete("/:id", RideController.deleteRide);

export default rideRoutes;
