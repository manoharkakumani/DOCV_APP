import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaArrowDown } from "react-icons/fa";
import NavBar from "./Navbar";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useWebSocket } from "../context/WebSocketProvider";
import { getBooking, getChatMessages } from "../utils/api";
import { toISOString } from "../utils/constants";

const Chat = () => {
  const user = useSelector((state) => state.auth.user);
  const bookingId = useSelector((state) => state.auth.bookingId);

  const [chatId, setChatId] = useState("");
  const { ws, updateToServer } = useWebSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [booking, setBooking] = useState({
    _id: "",
    date: new Date(),
    type: "",
    services: [],
    notes: [],
    customerId: {},
    charges: [],
    status: "",
    vehicleId: {},
    chatId: "",
    location: { type: "", coordinates: [] },
    paid: 0,
    balance: 0,
    time: "",
    cost: 0,
    serviceProviderId: {},
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight > 100) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await getChatMessages(chatId);
      if (response.status === 200) {
        setMessages(response.data.messages);
        setTimeout(scrollToBottom, 100); // Scroll after messages are rendered
      }
    };

    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    setLoading(true);
    const fetchBooking = async (bookingId) => {
      const response = await getBooking(bookingId);
      if (response.status === 200) {
        setBooking(response.data);
        setChatId(response.data.chatId);
      }
    };
    if (bookingId) {
      fetchBooking(bookingId);
    }
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    const handleMessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "chat" && message.chatId === chatId) {
        console.log(message.message);
        setMessages((prevMessages) => [...prevMessages, message.message]);
        setTimeout(checkScroll, 100); // Check scroll position after message is added
      }
    };

    if (ws) {
      ws.addEventListener("message", handleMessage);
    }

    return () => {
      if (ws) {
        ws.removeEventListener("message", handleMessage);
      }
    };
  }, [ws, chatId]);

  useEffect(() => {
    chatContainerRef.current?.addEventListener("scroll", checkScroll);
    return () =>
      chatContainerRef.current?.removeEventListener("scroll", checkScroll);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (text.trim()) {
      const newMessage = {
        type: "chat",
        chatId,
        text,
        senderId: user._id,
        receiverId:
          user._id === booking.serviceProviderId
            ? booking.serviceProviderId
            : booking.customerId._id,
        receiverType: booking.type === "Towing" ? "Tower" : "Service",
      };
      updateToServer(newMessage);
      setText("");
      setTimeout(scrollToBottom, 100); // Scroll after sending a message
    }
  };

  return !user ? (
    <Navigate to="/" />
  ) : (
    <div className="flex flex-col h-screen">
      <NavBar />
      {loading ? (
        <Loading />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Booking Details - Hidden on mobile */}

          <div className="hidden md:block w-1/3 bg-white p-6 rounded-lg shadow-md overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
              Booking Details
            </h2>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-500 pr-5">
                  {" "}
                  Date
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {toISOString(booking.date)}
                </span>
              </div>
              <div className="flex  items-center mb-2">
                <span className="text-sm font-medium text-gray-500 pr-5">
                  Status
                </span>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    booking.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "Ongoing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 pr-5">
                  Type
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {booking.type}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  User Info
                </h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm mb-1">
                    <span className="font-medium text-gray-500">Name:</span>{" "}
                    {booking.customerId.name}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium text-gray-500">Email:</span>{" "}
                    {booking.customerId.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-500">Phone:</span>{" "}
                    {booking.customerId.phone}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Vehicle Info
                </h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm mb-1">
                    <span className="font-medium text-gray-500">Make:</span>{" "}
                    {booking.vehicleId.make}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium text-gray-500">Model:</span>{" "}
                    {booking.vehicleId.model}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-500">Year:</span>{" "}
                    {booking.vehicleId.year}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Service Info
                </h3>
                <div className="bg-gray-50 p-3 rounded">
                  <ul className="list-disc list-inside">
                    {booking.services.map((service, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {service.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Payment Info
                </h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm mb-1">
                    <span className="font-medium text-gray-500">Cost:</span> $
                    {booking.cost.toFixed(2)}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium text-gray-500">Balance:</span>{" "}
                    ${booking.balance.toFixed(2)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-500">Paid:</span> $
                    {booking.paid.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col relative">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.senderId === user._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.senderId === user._id
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-20 right-4 bg-gray-500 text-white p-2 rounded-full shadow-lg"
              >
                <FaArrowDown />
              </button>
            )}
            <form onSubmit={handleSendMessage} className="bg-gray-200 p-4">
              <div className="flex">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-500 text-white p-2 rounded-r-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
