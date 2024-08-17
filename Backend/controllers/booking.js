import { Booking, ServiceProvider, Ride } from "../models/index.js";
import { sendTo, pendingRequests } from "../websocket.js";
import { createChat } from "./chat.js";
import { createRide } from "./ride.js";
import { createPaymentIntent2 } from "./payment.js";

// Utility function for error handling
const handleErrorResponse = (res, error, statusCode = 400) => {
  console.error(error);
  res.status(statusCode).json({ error: error.message });
};
const getDateOnly = (dateString = new Date()) => {
  const dateObj = new Date(dateString);
  dateObj.setUTCHours(0, 0, 0, 0); // Reset time to midnight UTC
  return dateObj;
};

// 30 days later
const getDate30DaysLater = (dateString = new Date()) => {
  const dateObj = new Date(dateString);
  dateObj.setUTCHours(0, 0, 0, 0); // Reset time to midnight UTC
  dateObj.setDate(dateObj.getDate() + 30); // Add 30 days
  return dateObj;
};

export const addBooking = async (req, res) => {
  try {
    const { customerId, serviceProviderId, vehicleId, services, date, notes } =
      req.body;

    const chatId = await createChat();

    const newBooking = new Booking({
      date: date ? getDateOnly(date) : getDateOnly(),
      services,
      notes,
      vehicleId,
      customerId,
      serviceProviderId,
      chatId,
      cost: services.reduce((total, service) => total + service.price, 0),
    });
    await newBooking.save();
    res.status(201).json({ message: "Booking received", booking: newBooking });
  } catch (error) {
    handleErrorResponse(res, error, 500);
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("vehicleId");
    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vehicleId")
      .populate("customerId")
      .populate("serviceProviderId")
      .populate("rideId", { strictPopulate: false });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getBookingsByVehicleId = async (req, res) => {
  try {
    const bookings = await Booking.find({ vehicleId: req.params.id }).sort({
      date: -1,
    });

    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getBookingsByUserId = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.params.id })
      .populate("vehicleId")
      .populate("serviceProviderId");
    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getUpcomingBookingsByUserId = async (req, res) => {
  try {
    const { date } = req.query;
    const allBookings = await Booking.find({
      customerId: req.params.id,
      status: {
        $in: ["Pending", "Accepted"],
      },
      date: {
        $gte: getDateOnly(date),
        $lt: getDate30DaysLater(date),
      },
    })
      .populate("vehicleId")
      .populate("serviceProviderId")
      .populate("rideId");
    res.status(200).json(allBookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getFutureBookingsByUserId = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.params.id,
      $or: [
        { status: "Pending", date: { $gte: getDateOnly() } },
        { status: "Accepted" },
      ],
    })
      .populate("vehicleId")
      .populate("serviceProviderId")
      .populate("rideId");

    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getPastBookingsByUserId = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.params.id,
      $or: [
        { status: "Completed", date: { $lt: getDateOnly() } },
        { status: { $in: ["Rejected", "Cancelled"] } },
      ],
    })
      .sort({ date: -1 })
      .populate("vehicleId")
      .populate("serviceProviderId")
      .populate("rideId");

    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getOngoingBookingsByUserId = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.params.id,
      status: "Ongoing",
    })
      .populate("vehicleId")
      .populate("serviceProviderId")
      .populate("rideId");
    console.log(bookings);
    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getBookingsByServiceProviderId = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const bookings = await Booking.find({
      serviceProviderId: req.params.id,
      date: { $gte: startDate, $lte: endDate },
    }).populate("customerId");
    if (!bookings) return res.status(404).json({ error: "No booking found" });
    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getUpcomingBookingsByServiceProviderId = async (req, res) => {
  try {
    const date = req.query.date;
    const bookings = await Booking.find({
      serviceProviderId: req.params.id,
      date: { $eq: getDateOnly(date) },
      status: { $in: ["Pending", "Accepted"] },
    }).populate("customerId");
    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getOngoingBookingsByServiceProviderId = async (req, res) => {
  try {
    const ongoingBookings = await Booking.find({
      serviceProviderId: req.params.id,
      status: "Ongoing",
    })
      .populate("customerId")
      .populate("vehicleId");
    res.status(200).json(ongoingBookings);
  } catch (err) {
    console.error(err);
  }
};

export const getOngoingBookingOfTower = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.find({
      serviceProviderId: id,
      status: {
        $in: ["Accepted", "Ongoing"],
      },
    })
      .populate("rideId")
      .populate("customerId")
      .populate("vehicleId");
    if (!booking) {
      return res.status(404).json({ error: "No ongoing booking found" });
    }
    res.status(200).json({ booking: booking[0] });
  } catch (err) {
    console.error(err);
  }
};

export const getPastBookingsByServiceProviderId = async (req, res) => {
  try {
    const date = req.query.date;
    const bookings = await Booking.find({
      serviceProviderId: req.params.id,
      date: { $eq: getDateOnly(date) },
      status: { $in: ["Completed", "Rejected", "Cancelled"] },
    })
      .populate("customerId")
      .populate("vehicleId");
    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const getAllBookingsByServiceProviderId = async (req, res) => {
  try {
    const bookings = await Booking.find({
      serviceProviderId: req.params.id,
    })
      .populate("vehicleId")
      .populate("customerId");
    res.status(200).json(bookings);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    handleErrorResponse(res, err);
  }
};

export const towing = async (req, res) => {
  try {
    const { customerId, vehicleId, location, destination, distance, price } =
      req.body;
    const rideId = await createRide(
      [location.latitude, location.longitude],
      location.formatted_address,
      [destination.latitude, destination.longitude],
      destination.formatted_address
    );

    const chatId = await createChat();

    const newBooking = new Booking({
      date: new Date().toISOString().split("T")[0], // Store only date
      type: "Towing",
      services: [{ id: 1, name: "Towing", price }],
      notes: `Towing from "${location.formatted_address}" to "${destination.formatted_address}" - (${distance} Mi)`,
      customerId,
      time: new Date(),
      cost: price,
      status: "Pending",
      vehicleId: vehicleId,
      chatId,
      rideId,
    });

    const booking = await newBooking.save();

    const paymentIntent = await createPaymentIntent2(price, customerId);
    // Track the new booking in pendingRequests
    pendingRequests[newBooking._id] = {
      status: "pending",
      customerId: customerId,
      towerId: null,
      towerQueue: [],
      coordinates: [location.latitude, location.longitude],
      currentTowerIndex: 0,
      rideId: rideId,
      distance: distance,
      price: price,
    };

    console.log("Pending Requests:", pendingRequests[newBooking._id]);

    res.status(201).json({
      message: "Booking received",
      booking: booking,
      paymentIntent,
    });
  } catch (error) {
    handleErrorResponse(res, error, 500);
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(req.query.bookingId)
      .populate("rideId")
      .populate("serviceProviderId");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    await Booking.findByIdAndUpdate(bookingId, { status: "Cancelled" });

    if (booking.status == "Accepted" && booking.type === "Towing") {
      // Notify the tower about the cancellation
      sendTo("Tower", booking.serviceProviderId, {
        type: "notification",
        message: "The booking has been cancelled",
        bookingId,
      });

      ServiceProvider.findByIdAndUpdate(booking.serviceProviderId, {
        available: true,
      });
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    handleErrorResponse(res, err);
  }
};
