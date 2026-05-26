// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");

// const app = express();
// const PORT = process.env.PORT || 5000;

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:3000",
//   "https://leads-management-software-frontend.vercel.app",
//   process.env.FRONTEND_URL,
// ].filter(Boolean);

// // CORS
// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   if (!origin || allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin);
//     res.header(
//       "Access-Control-Allow-Methods",
//       "GET,POST,PUT,DELETE,PATCH,OPTIONS"
//     );
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Content-Type, Authorization"
//     );
//     res.header("Access-Control-Allow-Credentials", "true");
//   }

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

// app.use(express.json());

// // routes
// app.use("/api/leads", require("./routes/leads.js"));
// app.use("/api/followups", require("./routes/followups.js"));
// app.use("/api/auth", require("./routes/auth.js"));

// // mongodb
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => console.log("mongodb connected successfully"))
//   .catch((err) => console.log("mongo error", err));

// // test route
// app.get("/", (req, res) => {
//   res.send("API Running");
// });

// app.listen(PORT, () => {
//   console.log(`server running on port ${PORT}`);
// });




require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();  
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://leads-management-software-frontend.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

app.use(async (req, res, next) => {
  try {
    console.log("Trying DB connection...");
    await connectDB();
    console.log("DB connected middleware success");
    next();
  } catch (err) {
    console.log("Middleware DB Error:", err);
    
    return res.status(500).json({
      success: false,
      message: "DB middleware failed",
      error: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/leads", require("./routes/leads.js"));
app.use("/api/followups", require("./routes/followups.js"));
app.use("/api/auth", require("./routes/auth.js"));

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});