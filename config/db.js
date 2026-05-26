// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     if (!process.env.MONGO_URL) {
//       throw new Error("MONGO_URL is missing");
//     }

//     await mongoose.connect(process.env.MONGO_URL, {
//       serverSelectionTimeoutMS: 10000,
//     });

//     console.log("MongoDB connected successfully");
//   } catch (err) {
//     console.log("MongoDB connection error:", err.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;



const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is missing");
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 10000,
  });

  isConnected = true;
  console.log("MongoDB connected successfully");
};

module.exports = connectDB;