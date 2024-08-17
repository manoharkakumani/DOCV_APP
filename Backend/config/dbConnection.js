import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `MongoDB connected: ${connection.connection.host}, ${connection.connection.name}`
    );
  } catch (error) {
    console.error(`Error connecting to the database. \n${error}`);
    // process.exit(1);
  }
};

export default dbConnection;
