import { stripe } from "../utils/constants.js";
import { Booking, Customer } from "../models/index.js";

export const createPaymentIntent2 = async (cost, customerId) => {
  const customer = await Customer.findById(customerId);
  if (!customer) return { error: "Customer not found" };

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.stripeId },
    { apiVersion: "2020-08-27" }
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: cost * 100, // Convert to cents
    customer: customer.stripeId,
    currency: "usd",
    metadata: { integration_check: "accept_a_payment" },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    client_secret: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    stripeId: customer.stripeId,
  };
};

export const createPaymentIntent = async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId).populate("customerId");
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: booking.customerId.stripeId },
    { apiVersion: "2020-08-27" }
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.cost * 100, // Convert to cents
    customer: booking.customerId.stripeId,
    currency: "usd",
    metadata: { integration_check: "accept_a_payment" },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.status(200).json({
    client_secret: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    stripeId: booking.customerId.stripeId,
  });
};

export const getPaymentMethods = async (req, res) => {
  console.log("Getting payment methods", req.params);
  const { id } = req.params;

  console.log("Customer ID:", id);
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: id,
      type: "card",
    });
    res.status(200).json(paymentMethods.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

export const addPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    // const ephemeralKey = await stripe.ephemeralKeys.create(
    //   { customer: id },
    //   { apiVersion: "2020-08-27" }
    // );

    const setupIntent = await stripe.setupIntents.create({
      customer: id,
      payment_method_types: ["card"],
    });

    res.status(200).json({
      client_secret: setupIntent.client_secret,
      // ephemeralKey: ephemeralKey.secret,
      stripeId: id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePaymentMethod = async (req, res) => {
  const { id } = req.params;

  try {
    await stripe.paymentMethods.detach(id);
    res.status(200).json({ message: "Payment method deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
