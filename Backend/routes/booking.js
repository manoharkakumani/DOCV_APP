import express from "express";
import { BookingController } from "../controllers/index.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/", BookingController.addBooking);
bookingRoutes.get("/", BookingController.getBookings);
bookingRoutes.post("/cancel", BookingController.cancelBooking);
bookingRoutes.get("/:id", BookingController.getBookingById);
bookingRoutes.get("/vehicle/:id", BookingController.getBookingsByVehicleId); // Get bookings by vehicle ID
bookingRoutes.get("/customer/:id", BookingController.getBookingsByUserId); // Get bookings by user ID
bookingRoutes.get(
  "/customer/future/:id",
  BookingController.getFutureBookingsByUserId
); // Get future bookings by user ID
bookingRoutes.get(
  "/customer/past/:id",
  BookingController.getPastBookingsByUserId
); // Get past bookings by user ID
bookingRoutes.get(
  "/customer/ongoing/:id",
  BookingController.getOngoingBookingsByUserId
); // Get ongoing bookings by user ID
bookingRoutes.get(
  "/customer/upcoming/:id",
  BookingController.getUpcomingBookingsByUserId
); // Get upcoming bookings by user ID

bookingRoutes.get(
  "/service-provider/:id",
  BookingController.getBookingsByServiceProviderId
); // Get bookings by service provider ID

bookingRoutes.get(
  "/service-provider/upcoming/:id",
  BookingController.getUpcomingBookingsByServiceProviderId
); // Get upcoming bookings by service provider ID

bookingRoutes.get(
  "/service-provider/past/:id",
  BookingController.getPastBookingsByServiceProviderId
); // Get past bookings by service provider ID

bookingRoutes.get(
  "/service-provider/all/:id",
  BookingController.getAllBookingsByServiceProviderId
); // Get all bookings by service provider ID
bookingRoutes.get(
  "/service-provider/ongoing/:id",
  BookingController.getOngoingBookingsByServiceProviderId
); // Get ongoing bookings by service provider ID

bookingRoutes.get(
  "/tower/ongoing/:id",
  BookingController.getOngoingBookingOfTower
); // Get ongoing bookings by service provider ID

bookingRoutes.put("/:id", BookingController.updateBooking);
bookingRoutes.delete("/:id", BookingController.deleteBooking);
bookingRoutes.post("/towing", BookingController.towing);

export default bookingRoutes;
