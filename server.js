require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
    "http://localhost:5174",
  "http://localhost:3000",
   "http://localhost:5175",
   "http://localhost:5176",
  "https://leads-management-software-frontend.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middlewares
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API Running");
});

// Routes
app.use("/api/leads", require("./routes/leads.js"));
app.use("/api/followups", require("./routes/followups.js"));
app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/team" , require("./routes/team.js"));
app.use("/api/super-admin" , require("./routes/superAdmin.js"));
app.use("/api/package" , require("./routes/package.js"));
app.use("/api/payment" , require("./routes/payment.js"))
app.use("/api/razorpay-setting", require("./routes/razorpaySettingRoute"));
app.use("/api/source" , require("./routes/source.js"));
// Start server after DB connected
const startServer = async () => {
  try {
    await connectDB();
  
    

    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("Server startup error:", err.message);
  }
};

startServer();