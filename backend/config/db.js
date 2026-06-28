const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the database");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

module.exports = connectDB;