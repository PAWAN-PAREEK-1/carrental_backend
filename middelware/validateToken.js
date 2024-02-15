import express from "express";
import prisma from "../db/db-config.js";
import OTP from 'otp-generator';
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';

export const authUser = asyncHandler(async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userId = decoded.id; // Assuming your decoded token contains the user ID
            const user = await prisma.user.findFirst({
                where: { id: userId } // Specify 'id' as the unique identifier
            });

            if (!user) {
                return res.status(401).json({ message: "Unauthorized - User not found" });
            }

       
            req.user = user;

            next();
        } else {
            res.status(401).json({ message: "Please provide a valid token" });
        }
    } catch (error) {
        console.error("Error authenticating user:", error.message); // Log the error message
        res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
});
