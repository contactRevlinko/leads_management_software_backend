require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// connect mongo
connectDB();

app.use(express.json());

// routes
app.use("/api/leads", require("./routes/leads"));
app.use("/api/followups", require("./routes/followups"));
app.use("/api/auth", require("./routes/auth"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});