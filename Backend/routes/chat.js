import { ChatController } from "../controllers/index.js";
import express from "express";

const chatRouter = express.Router();

chatRouter.get("/:chatId", ChatController.getChatById);
chatRouter.delete("/:chatId", ChatController.deleteChat);

export default chatRouter;
