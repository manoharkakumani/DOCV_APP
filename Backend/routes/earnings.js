import { EarningsController } from "../controllers/index.js";

import express from "express";

const earningsRouter = express.Router();

earningsRouter.get("/:id", EarningsController.getEarnings);
earningsRouter.post("/withdraw/:id", EarningsController.withdrawEarnings);
earningsRouter.get("/this-week/:id", EarningsController.getThisWeekEarnings);
earningsRouter.get("/last-week/:id", EarningsController.getLastWeekEarnings);
earningsRouter.get(
  "/custom-week/:id",
  EarningsController.getCustomWeekEarnings
);

export default earningsRouter;
