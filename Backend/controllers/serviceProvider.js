import { ServiceProvider, Booking, Ride, Auth } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { pendingRequests, sendTo } from "../websocket.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = "your_jwt_secret"; // Replace with your actual secret

export const addServiceProvider = async (req, res) => {
  try {
    const { name, email, password, location, address, phone, type } = req.body;

    if (!name || !email || !password || !location) {
      return res
        .status(400)
        .json({ error: "Name, location, email, and password are required" });
    }

    let findServiceProvider = await ServiceProvider.findOne({ email });
    if (findServiceProvider) {
      return res.status(400).json({ error: "Service Provider already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const serviceProvider = new ServiceProvider({
      name,
      email,
      address: address || "No address provided",
      phone: phone || "",
      type: type || "Service",
      location: {
        type: "Point",
        coordinates: location,
      },
      ongoingService: [],
    });
    await serviceProvider.save();
    const auth = new Auth({
      userId: serviceProvider._id,
      email,
      type,
      password: hashedPassword,
    });
    await auth.save();
    const token = jwt.sign({ id: serviceProvider._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    serviceProvider.token = token;
    res.status(201).json(serviceProvider);
  } catch (err) {
    console.log("Error during service provider creation:", err);
    res.status(400).json({ error: err.message });
  }
};

export const signinServiceProvider = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password, type, location } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const auth = await Auth.findOne({ email, type });
    if (!auth) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) {
      console.log("Invalid email or password");
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const serviceProvider = await ServiceProvider.findById(auth.userId);
    if (!serviceProvider) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: serviceProvider._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    if (location) {
      serviceProvider.available = true;
      serviceProvider.location = {
        type: "Point",
        coordinates: location,
      };
      await serviceProvider.save();
    }
    serviceProvider.token = token;
    res.status(200).json(serviceProvider);
  } catch (err) {
    console.log("Error during service provider signin:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getServiceProviders = async (req, res) => {
  try {
    const serviceProviders = await ServiceProvider.find().populate("services");
    res.status(200).json(serviceProviders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getServiceProviderById = async (req, res) => {
  try {
    console.log(req.params);
    const serviceProvider = await ServiceProvider.findById(req.params.id);
    console.log(serviceProvider);

    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }
    res.status(200).json(serviceProvider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateServiceProvider = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, address, location, phone } = req.body;

    const auth = await Auth.findOne({ userId: req.params.id });
    if (!auth) {
      return res.status(404).json({ error: "Service Provider not found" });
    }

    if (password) {
      auth.password = await bcrypt.hash(password, SALT_ROUNDS);
      await auth.save();
    }

    const updatedFields = {};
    if (name) updatedFields.name = name;
    else if (email) updatedFields.email = email;
    else if (phone) updatedFields.phone = phone;
    else if (location && address) {
      updatedFields.address = address;
      updatedFields.location = {
        type: "Point",
        coordinates: location,
      };
    }

    const serviceProvider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }

    const serviceProviderResponse = serviceProvider.toObject();
    res.status(200).json(serviceProviderResponse);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ error: errors });
    }
    res
      .status(500)
      .json({ error: "An error occurred while updating the profile" });
  }
};
export const deleteServiceProvider = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findByIdAndDelete(
      req.params.id
    );
    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }
    res.status(200).json({ message: "Service Provider deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getServiceProviderServices = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findById(req.params.id);
    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }
    res.status(200).json(serviceProvider.services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateServiceProviderServices = async (req, res) => {
  try {
    const serviceProvider = await ServiceProvider.findById(req.params.id);
    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }
    serviceProvider.services = req.body;
    await serviceProvider.save();
    res.status(200).json(serviceProvider.services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get todays ongoing services, completed services, upcoming services count for a service provider

export const getServiceProviderServicesCount = async (req, res) => {
  try {
    const date = new Date().toISOString();

    const serviceProviderId = req.params.id;

    const ongoingServices = await Booking.find({
      serviceProviderId,
      status: "Ongoing",
    }).countDocuments();

    const completedServices = await Booking.find({
      serviceProviderId,
      status: "Completed",
      completedAt: { $gte: date },
    }).countDocuments();

    const upcomingServices = await Booking.find({
      serviceProviderId,
      status: "Pending",
      date,
    }).countDocuments();

    res.status(200).json({
      ongoingServices,
      completedServices,
      upcomingServices,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// In your backend (e.g., controllers/bookingController.js)

export const runServiceProviderAudict = async (req, res) => {
  const serviceProviderId = req.params.id;
  const { date } = req.body;
  try {
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);
    const lastAudit = serviceProvider.lastAudit || new Date(0); // Use epoch if no previous audit
    const updateDate = new Date(date);

    const overdueBookings = await Booking.find({
      serviceProviderId,
      status: "Pending",
      date: { $lt: updateDate },
    });

    const cancelledBookingIds = [];

    for (const booking of overdueBookings) {
      booking.status = "Cancelled";
      booking.cancelledAt = updateDate;
      await booking.save();
      cancelledBookingIds.push(booking._id);
    }

    // Update the service provider's last audit date
    await ServiceProvider.findByIdAndUpdate(serviceProviderId, {
      lastAudit: updateDate,
      $push: {
        recentAudits: {
          date: lastAudit,
          cancelledBookings: cancelledBookingIds,
        },
      },
    });

    const serviceProviderObject = await ServiceProvider.findById(
      serviceProviderId
    );

    res.status(200).json({
      message: `Cancelled ${cancelledBookingIds.length} overdue bookings.`,
      cancelledCount: cancelledBookingIds.length,
      auditDate: updateDate,
      serviceProvider: serviceProviderObject,
    });
  } catch (error) {
    console.error("Error cancelling overdue bookings:", error);
    res.status(500).json({ error: "Failed to cancel overdue bookings" });
  }
};

export const reverseLastAudit = async (req, res) => {
  const serviceProviderId = req.params.id;

  try {
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);
    if (!serviceProvider.lastAudit) {
      return res.status(400).json({ error: "No recent audit to reverse" });
    }

    const lastAudit = serviceProvider.recentAudits.pop();
    if (!lastAudit) {
      return res.status(400).json({ error: "No recent audit to reverse" });
    }

    await Booking.updateMany(
      { _id: { $in: lastAudit.cancelledBookings } },
      { $set: { status: "Pending" }, $unset: { cancelledAt: "" } }
    );

    // Remove the last audit and update lastAuditDate
    serviceProvider.lastAudit = lastAudit.date;
    const serviceProviderObject = await serviceProvider.save();

    res.status(200).json({
      message: `Reversed last audit. ${lastAudit.cancelledBookings.length} bookings restored.`,
      auditDate: serviceProvider.lastAudit,
      serviceProvider: serviceProviderObject,
    });
  } catch (error) {
    console.error("Error reversing last audit:", error);
    res.status(500).json({ error: "Failed to reverse last audit" });
  }
};

export const getNearbyServiceProviders = async (req, res) => {
  const { coordinates } = req.body;
  console.log("Coordinates:", coordinates);
  try {
    const serviceProviders = await ServiceProvider.find({
      type: "Service",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          $maxDistance: 15000, // 15 km
        },
      },
    });
    res.status(200).json(serviceProviders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// assign tower

export const assignTower = async (req, res) => {
  const bookingId = req.body.bookingId;
  console.log("Assigning tower to booking", req.body);
  if (!bookingId) {
    return res.status(400).json({ message: "Booking ID is required" });
  }
  const request = pendingRequests[bookingId];
  const nearbyProviders = await ServiceProvider.find({
    type: "Tower",
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: request.coordinates,
        },
        $maxDistance: 15000, // 15 km radius
      },
    },
    available: true,
  });

  console.log("Nearby providers:", nearbyProviders);
  request.towerQueue = nearbyProviders;
  pendingRequests[bookingId] = request;
  if (nearbyProviders.length) {
    const provider = nearbyProviders[0];
    sendTo("Tower", provider._id, {
      type: "serviceRequest",
      message: "New towing request available",
      distance: request.distance,
      cost: request.price,
      bookingId: bookingId,
    });
  } else {
    // No towers available, reject the request
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status: "Rejected",
    });
    await Ride.findByIdAndUpdate(request.rideId, { status: "Rejected" });
    delete pendingRequests[bookingId];
    // Notify the user that the request was not accepted
    sendTo("Customer", booking.customerId, {
      channel: "customer",
      type: "notification",
      message: "Your towing request was not accepted by any available towers",
      bookingId: bookingId,
    });
    return res
      .status(404)
      .json({ message: "No towers available at the moment" });
  }
  res.status(200).json({ message: "Tower Request Sent" });
};

export const withdrawAmount = async (req, res) => {
  const { amount, serviceProviderId } = req.body;
  const serviceProvider = await ServiceProvider.findById(serviceProviderId);
  if (!serviceProvider) {
    return res.status(404).json({ error: "Service Provider not found" });
  }
  if (serviceProvider.balance < amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }
  serviceProvider.balance -= amount;
  await serviceProvider.save();
  res.status(200).json(serviceProvider);
};
