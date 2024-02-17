import express from "express";
import prisma from "../../db/db-config.js";
// import OTP from 'otp-generator';
// import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';


export const addCar = asyncHandler(async(req,res)=>{
    const { company, model } = req.body; // Assuming model includes both car model name and car company ID
  
    try {
      // Check if the company exists
      const existingCompany = await prisma.carCompany.findFirst({
        where: {
          company: company,
        },
      });
  
      let companyId;
  
      // If the company doesn't exist, create it
      if (!existingCompany) {
        const newCompany = await prisma.carCompany.create({
          data: {
            company: company,
          },
        });
        companyId = newCompany.id;
      } else {
        companyId = existingCompany.id;
      }
  
      // Add the car model
      const newCarModel = await prisma.carModel.create({
        data: {
          model: model,
          carCompanyId: companyId,
        },
      });
  
      res.status(201).json({ success: true, data: newCarModel ,existingCompany });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
})




