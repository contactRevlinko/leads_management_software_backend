require('dotenv').config();
const express = require("express")
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyUserToken = require("../middleware/auth")



router.post("/register" , async (req, res) =>{
    try{
        const {name , phone, email , password} = req.body;
        const existingUser = await User.findOne({email});
        console.log("existingUser" , existingUser);
        if(existingUser){
            return res.status(400).json({
                success:false,
                message :"User Already Exists",
            })
        }
const hashPassword = await bcrypt.hash(password , 10)
        const user = await User.create({
            name , 
            phone,
            email,
            password:hashPassword
        })
        res.status(201).json({
            success:true,
            message:"user created successfully",
            data : user,
        })
console.log(user);
   console.log(password , hashPassword);

    }
    catch(err){
        console.log(err);
        res.status(500).json({
           success:false,
            message:"server error",
            err : err.message,

        })
    }
})

router.post("/login" , async(req , res) => {
    try{
        const {email , password} = req.body;
        const existingUser = await User.findOne({email})
        if(!existingUser){
          return res.status(401).json({
            success:false ,
             message:"invalid eamil or password"
           })
        }
        const match = await bcrypt.compare(password , existingUser.password )
        console.log("password" , password , "existingUser.password" ,existingUser.password )
     
        console.log(match);
        if(!match){
           return res.status(401).json({
            success:false ,
             message:"invalid eamil or password"
           })
        }

        const token = jwt.sign({
            id : existingUser._id,
            email : existingUser.email,
        } , process.env.JWT_SECRET,{expiresIn : "365d"})
     console.log("token",token )
         console.log(User);
     return res.status(200).json({
        success : true ,
        message:"user loggedin successfully",
        token : token ,
        user:{
             id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email
        }
     })
 
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            success :false,
            message:"server error",
            err : err.message,
        })
    }
})

router.get("/profile", verifyUserToken, (req, res) => {
    
  try{
    res.json({
    success: true,
    user: req.user,
  });
  }catch(err){
    console.log(err)
     res.status(500).json({
      success:false,
      message: err.message
   })
  }
})

module.exports = router;