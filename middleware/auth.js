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
module.exports = verifyUserToken;