    // main entry point
    require('dotenv').config();
    const express = require('express');
    const app = express();
    const cors = require('cors');
    const mongoose = require('mongoose')
    const PORT = process.env.PORT || 5000   
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // your deployed Vercel frontend URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors()); // ← must be BEFORE routes

    //routes

    app.use('/api/leads', require('./routes/leads.js'));
    app.use('/api/followups', require('./routes/followups.js'));
    app.use('/api/auth' , require('./routes/auth.js'));
    //mongoDb connection
    mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("mongodb connected successfully"))
    .catch(err => console.log("error" , err));

    app.listen(PORT , () =>{
        console.log(`server running on port ${PORT}`);
    });
