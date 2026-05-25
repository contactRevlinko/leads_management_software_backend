require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

// ✅ Manual CORS — no cors package, no path-to-regexp crash
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

// routes
app.use('/api/leads', require('./routes/leads.js'));
app.use('/api/followups', require('./routes/followups.js'));
app.use('/api/auth', require('./routes/auth.js'));

// mongodb
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("mongodb connected successfully"))
  .catch(err => console.log("error", err));

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});