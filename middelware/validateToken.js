import express from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';


export const authUser = asyncHandler(async(req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
         
            req.user = decoded;
            next(); 
        } else {
            res.status(401).json({ message: "please give token" });
        }
    } catch (error) {
        console.error("Error authenticating user:", error);
        res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
});