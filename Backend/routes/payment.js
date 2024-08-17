import { PaymentController } from "../controllers/index.js";
import express from "express";

const paymentRoutes = express.Router();

paymentRoutes.post("/payment-intent", PaymentController.createPaymentIntent);

paymentRoutes.get("/:id", PaymentController.getPaymentMethods);
paymentRoutes.get("/intent/:id", PaymentController.addPaymentMethod);
paymentRoutes.delete("/:id", PaymentController.deletePaymentMethod);

export default paymentRoutes;
