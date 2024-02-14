import express from "express";
import prisma from "../db/db-config.js";
import OTP from 'otp-generator';
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';


export const verifyOTPHandler = asyncHandler(async (req, res,next) => {
    try {
        const { email, otp } = req.body;
  
     
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        
  
     
        const otpEntry = await prisma.otpTable.findFirst({
            where: {
                email
            },
            orderBy: {
                createdAt: 'desc' 
            }
        });
  
         
          if (otpEntry.email !== email) {
            return res.status(400).json({ message: "Email does not match the OTP" });
        }
  
       
        if (!otpEntry || Date.now() - otpEntry.createdAt.getTime() > 10 * 60 * 1000) {
            return res.status(400).json({ message: "OTP expired or invalid" });
        }
  
        
        const isValidOTP = await bcrypt.compare(otp.toString(), otpEntry.otp.toString());

  
        if (!isValidOTP) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
  
      
            next()
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
  });
  