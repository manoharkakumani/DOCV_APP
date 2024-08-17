import { Booking, ServiceProvider } from "../models/index.js";

const getDateOnly = (date = new Date()) =>
  new Date(date).toISOString().split("T")[0];

// withdrawals for service provider
export const withdrawEarnings = async (req, res) => {
  try {
    const serviceProviderId = req.params.id;
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);

    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }

    const { amount } = req.body;

    if (amount > serviceProvider.balance) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // pending stripe integration

    // const payout = await stripeInstance.payouts.create({
    //     amount: amount * 100, // Convert to cents
    //     currency: 'usd',
    //     destination: serviceProvider.stripeId, // Assuming this is the Stripe account ID
    //   });

    serviceProvider.balance -= amount;
    await serviceProvider.save();

    res.status(200).json({ message: "Withdrawal successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch earnings for the service provider
export const getEarnings = async (req, res) => {
  try {
    const serviceProviderId = req.params.id;
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);

    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }

    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );

    const bookings = await Booking.find({
      serviceProviderId,
      status: "Completed",
    });

    const todayEarnings = bookings
      .filter((booking) => booking.date.toDateString() === today.toDateString())
      .reduce((total, booking) => total + booking.cost, 0);

    const thisWeekEarnings = bookings
      .filter(
        (booking) => booking.date >= startOfWeek && booking.date <= new Date()
      )
      .reduce((total, booking) => total + booking.cost, 0);

    const thisMonthEarnings = bookings
      .filter(
        (booking) =>
          booking.date.getMonth() === today.getMonth() &&
          booking.date.getFullYear() === today.getFullYear()
      )
      .reduce((total, booking) => total + booking.cost, 0);

    res.status(200).json({
      todayEarnings,
      thisWeekEarnings,
      thisMonthEarnings,
      balance: serviceProvider.balance,
      totalEarnings: serviceProvider.earnings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// this week earnings

export const getThisWeekEarnings = async (req, res) => {
  try {
    const serviceProviderId = req.params.id;
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);

    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }

    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );

    const bookings = await Booking.find({
      serviceProviderId,
      status: "Completed",
    });

    const thisWeekEarnings = bookings
      .filter(
        (booking) => booking.date >= startOfWeek && booking.date <= new Date()
      )
      .map((booking) => ({
        date: getDateOnly(booking.date),
        amount: booking.cost,
      }));
    res.status(200).json({ thisWeekEarnings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// last week earnings

export const getLastWeekEarnings = async (req, res) => {
  try {
    const serviceProviderId = req.params.id;
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);

    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }

    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() - 7);

    const bookings = await Booking.find({
      serviceProviderId,
      status: "Completed",
    });

    const lastWeekEarnings = bookings
      .filter(
        (booking) => booking.date >= endOfWeek && booking.date <= startOfWeek
      )
      .map((booking) => ({
        date: getDateOnly(booking.date),
        amount: booking.cost,
      }));

    res.status(200).json({ lastWeekEarnings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// custom week earnings

export const getCustomWeekEarnings = async (req, res) => {
  try {
    const serviceProviderId = req.params.id;
    const serviceProvider = await ServiceProvider.findById(serviceProviderId);

    if (!serviceProvider) {
      return res.status(404).json({ error: "Service Provider not found" });
    }

    const { start, end } = req.body;

    const bookings = await Booking.find({
      serviceProviderId,
      status: "Completed",
    });

    const customWeekEarnings = bookings
      .filter(
        (booking) =>
          booking.date >= new Date(start) && booking.date <= new Date(end)
      )
      .map((booking) => ({
        date: getDateOnly(booking.date),
        amount: booking.cost,
      }));
    res.status(200).json({ customWeekEarnings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
