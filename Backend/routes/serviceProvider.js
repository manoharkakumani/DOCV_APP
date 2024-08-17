import express from "express";
import { ServiceProviderController } from "../controllers/index.js";

const serviceProviderRoutes = express.Router();

serviceProviderRoutes.post(
  "/signup",
  ServiceProviderController.addServiceProvider
);

serviceProviderRoutes.post(
  "/signin",
  ServiceProviderController.signinServiceProvider
);
serviceProviderRoutes.post(
  "/nearby",
  ServiceProviderController.getNearbyServiceProviders
);
serviceProviderRoutes.get("/", ServiceProviderController.getServiceProviders);
serviceProviderRoutes.get(
  "/:id",
  ServiceProviderController.getServiceProviderById
);
serviceProviderRoutes.put(
  "/:id",
  ServiceProviderController.updateServiceProvider
);
serviceProviderRoutes.delete(
  "/:id",
  ServiceProviderController.deleteServiceProvider
);

serviceProviderRoutes.get(
  "/services/:id",
  ServiceProviderController.getServiceProviderServices
);

serviceProviderRoutes.put(
  "/services/:id",
  ServiceProviderController.updateServiceProviderServices
);

serviceProviderRoutes.get(
  "/services/count/:id",
  ServiceProviderController.getServiceProviderServicesCount
);

serviceProviderRoutes.post(
  "/audit/:id",
  ServiceProviderController.runServiceProviderAudict
);

serviceProviderRoutes.post(
  "/reverse-audit/:id",
  ServiceProviderController.reverseLastAudit
);

serviceProviderRoutes.post(
  "/assign-tower/",
  ServiceProviderController.assignTower
);

serviceProviderRoutes.post(
  "/withdraw/",
  ServiceProviderController.withdrawAmount
);
export default serviceProviderRoutes;
