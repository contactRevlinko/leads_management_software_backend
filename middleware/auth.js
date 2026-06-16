    // jwt verify middleware
    require("dotenv").config();
    const jwt = require("jsonwebtoken");
    const express = require('express');
    

    const verifyUserToken = ((req ,res ,next) => {
    try{
   const token = req.headers.authorization?.split(" ")[1];
    console.log(token);
    if(!token){
        return res.status(401).json({
            success:false ,
            message :"unauthorized user , token is missing"
        })}
     const decoded = jwt.verify(token , process.env.JWT_SECRET)
        req.user = decoded;
        console.log(decoded , "user");
        next();

    }catch(err){
        console.log(err)
    res.status(500).json({
        success : false,
        message : "server error",
        err :err.message
    })
    }
    })

const verifiedSuperAdmin = (req , res , next) => {
    if(req.user.role !== "SUPER_ADMIN"){
        return res.status(403).json({
            success:false,
            message:"Access denied , only super admin allowed "
        })
    }
    next();
}

module.exports = verifyUserToken;
