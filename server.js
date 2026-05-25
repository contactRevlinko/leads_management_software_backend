require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// routes
app.use("/api/leads", require("./routes/leads.js"));
app.use("/api/followups", require("./routes/followups.js"));
app.use("/api/auth", require("./routes/auth.js"));

// mongodb connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("mongodb connected successfully"))
  .catch((err) => console.log("error", err));

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});