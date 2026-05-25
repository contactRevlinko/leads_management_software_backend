    // main entry point
    require('dotenv').config();
    const express = require('express');
    const app = express();
    const cors = require('cors');
    const mongoose = require('mongoose')
    const PORT = process.env.PORT || 5000   

    //middleware

    app.use(cors());
    app.use(express.json());


    app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend.vercel.app",
    ],
    credentials: true,
  })
);

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
