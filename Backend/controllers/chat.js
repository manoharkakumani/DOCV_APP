import { Chat, Message } from "../models/index.js";
import { sendTo } from "../websocket.js";

const getChatById = async (req, res) => {
  const chatId = req.params.chatId;
  const chat = await Chat.findById(chatId)
    .populate("messages")
    .populate("lastMessage");
  return res.json(chat).status(200);
};

const createChat = async () => {
  const newChat = new Chat({
    messages: [],
    lastMessage: null,
  });

  await newChat.save();

  return newChat._id;
};

const deleteChat = async (chatId) => {
  return await Chat.findByIdAndDelete(chatId);
};

const handleNewMessage = async (message, reciverType, senderType) => {
  const { chatId, text, senderId, receiverId } = message;
  const newMessage = new Message({
    message: text,
    senderId,
    receiverId,
  });

  await newMessage.save();

  const chat = await Chat.findById(chatId);
  chat.messages.push(newMessage);
  chat.lastMessage = newMessage._id;
  await chat.save();

  const delivered = sendTo(reciverType, receiverId, {
    type: "chat",
    chatId,
    message: newMessage,
  });

  console.log("Message sent to reciver:", delivered);

  if (delivered) {
    newMessage.status = "delivered";
    await newMessage.save();
  }

  sendTo(senderType, senderId, {
    type: "chat",
    chatId,
    message: newMessage,
  });
};

export { getChatById, createChat, deleteChat, handleNewMessage };
