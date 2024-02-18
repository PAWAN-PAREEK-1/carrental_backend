import express from "express";
import prisma from "../../db/db-config.js";
// import OTP from 'otp-generator';
// import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';


export const addCar = asyncHandler(async(req,res)=>{
    const userId = req.user.id
    const {
        ownerName,
        seat,
        doors,
        fuelType,
        transmission,
        ac,
        sunroof,
        engineNumber,
        carNumber,
        carInsuranceNum,
        carRcNumber,
        carName,
        carModel,
        rate,
        unit,
        description,
        carCompany
    } = req.body;
    try {

        // Convert string values to appropriate data types
        const seatInt = parseInt(seat);
        const rateInt = parseInt(rate);
        const doorsInt = parseInt(doors);
        const unitInt = parseInt(unit);
        const acBool = ac.toLowerCase() === "true"; // Convert to lowercase and check if it's "true"
        const sunroofBool = sunroof.toLowerCase() === "true"; // Convert to lowercase and check if it's "true"

        if(
            !carCompany ||
            !ownerName ||
            !seatInt ||
            !fuelType ||
            !transmission ||
            !sunroofBool ||
            !acBool ||
            !doorsInt ||
            !engineNumber ||
            !carNumber ||
            !carName ||
            !carModel ||
            !carRcNumber ||
            !carInsuranceNum ||
            !rate ||
            !unit
        ) {
            return res.status(400).json({ success: false, message: "Please provide full car detail" });
        }

        const newCar = await prisma.car.create({
            data: {
                ownerName,
                seat: seatInt,
                doors: doorsInt,
                fuelType,
                transmission,
                ac: acBool,
                sunroof: sunroofBool,
                engineNumber,
                carNumber,
                carInsuranceNum,
                carRcNumber,
                carName,
                carModel,
                rate: rateInt,
                unit,
                description,
                carCompany,
                // Include the user information
                user: {
                    connect: { id: userId } // Connect to the existing user based on the userId
                }
            }
        });

        // Fetch user details based on userId
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        res.status(201).json({ success: true, data: { car: newCar, user } });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
})

export const getAllCarModel = asyncHandler(async(req,res)=>{
    try {
        // Retrieve all cars from the database
        const allCars = await prisma.carCompany.findMany({
            include: {
              model: true // Include the relation 'model' directly
            }
          });

        res.status(200).json({ success: true, data: allCars });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error' });
      }
})



export const getAllCar = async (req, res) => {
  try {
      // Extract query parameters
      const { page = 1, limit = 10, company, sortBy, sortOrder, minPrice, maxPrice, fuelType, transmission } = req.query;

      // Prepare filtering conditions
      const where = {};
      if (company) where.carCompany = company; // Filter by company name directly from the car table
      if (minPrice || maxPrice) {
          where.rate = {};
          if (minPrice) where.rate.gte = parseInt(minPrice);
          if (maxPrice) where.rate.lte = parseInt(maxPrice);
      }
      if (fuelType) where.fuelType = fuelType;
      if (transmission) where.transmission = transmission;

      // Prepare sorting options
      const orderBy = {};
      if (sortBy && sortOrder) {
          orderBy[sortBy] = sortOrder.toLowerCase();
      }

      // Retrieve cars with pagination, filtering, and sorting
      const cars = await prisma.car.findMany({
          where, // Apply where condition directly
          orderBy,
          take: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
      });

      // Count total number of cars for pagination
      const totalCars = await prisma.car.count({ where });

      res.status(200).json({ success: true, data: cars, total: totalCars });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server error' });
  }
};



