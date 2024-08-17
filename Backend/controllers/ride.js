import Ride from "../models/ride.js";

export const getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    res.status(200).json(ride);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createRide = async (from, from_format, to, to_format) => {
  const ride = new Ride({
    from: {
      type: "Point",
      coordinates: from,
    },
    to: {
      type: "Point",
      coordinates: to,
    },
    from_formatted_address: from_format,
    to_formatted_address: to_format,
  });
  await ride.save();
  return ride._id;
};

export const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    ride.driver = req.body.driverCoordinates
      ? req.body.driverCoordinates
      : ride.driver;
    ride.from = req.body.from ? req.body.fromCoordinates : ride.from;
    ride.to = req.body.to ? req.body.toCoordinates : ride.to;
    await ride.save();
    res.status(200).json(ride);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteRide = async (req, res) => {
  try {
    await Ride.findByIdAndRemove(req.params.id);
    res.status(200).json({ message: "Ride deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
