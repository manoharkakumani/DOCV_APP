import express from "express";
import { CustomerController } from "../controllers/index.js";

const customerRoutes = express.Router();

customerRoutes.post("/signup", CustomerController.addCustomer);
customerRoutes.post("/signin", CustomerController.signCustomer);
customerRoutes.get("/", CustomerController.getCustomers);
customerRoutes.get("/:id", CustomerController.getCustomerById);
customerRoutes.put("/:id", CustomerController.updateCustomer);
customerRoutes.delete("/:id", CustomerController.deleteCustomer);

export default customerRoutes;
