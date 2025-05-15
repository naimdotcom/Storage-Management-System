const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected to Port:", process.env.PORT || 4000);
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
