import express from "express";
import prisma from "../../db/db-config.js";
// import OTP from 'otp-generator';
// import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';


export const addCar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log(userId);

  const { ownerName, seat, doors, fuelType, transmission, ac, sunroof, engineNumber, carNumber, carInsuranceNum, carRcNumber, carName, carModel, rate, unit, description, carCompany, carImages } = req.body;

  const carNumberValidate = await prisma.car.findFirst({
          where:{
            carNumber:carNumber
          }
  })

  if(carNumberValidate){
    return res.status(409).json({message:"car Number is already exists"})
  }

  // Check if req.files is an object or an array
  const interiorImages = req.files['interiorImages'].map(file => file.path);
  const exteriorImages = req.files['exteriorImages'].map(file => file.path);
  console.log("Uploaded interior images:", interiorImages);
  console.log("Uploaded exterior images:", exteriorImages);

  // Create an array of objects for interior images
  const newInteriorImages = interiorImages.map(url => ({ url }));
  // Create an array of objects for exterior images
  const newExteriorImages = exteriorImages.map(url => ({ url }));


  try {
    // Convert string values to appropriate data types
    const seatInt = parseInt(seat);
    const rateInt = parseInt(rate);
    const doorsInt = parseInt(doors);
    const unitInt = parseInt(unit);
    const acBool = ac.toLowerCase() === "true"; // Convert to lowercase and check if it's "true"
    const sunroofBool = sunroof.toLowerCase() === "true"; // Convert to lowercase and check if it's "true"

    if (!carCompany || !ownerName || !seat || !fuelType || !transmission || !sunroof || !ac || !doors || !engineNumber || !carNumber || !carName || !carModel || !carRcNumber || !carInsuranceNum || !rate || !unit) {
      return res.status(400).json({ success: false, message: "Please provide full car detail" });
    }

    // const newCarImages = images.map(url => ({ url }));

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
        },
        carImages: {
          create: [
              ...newInteriorImages.map(image => ({ ...image, type: 'interior' })), // Added 'type: interior'
              ...newExteriorImages.map(image => ({ ...image, type: 'exterior' })) // Added 'type: exterior'
          ] // Associate the uploaded images with the car entry
      }
      },
      include: {
        carImages: true // Include images in the response
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
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



export const getAllCarModel = asyncHandler(async (req, res) => {
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



export const getAllCar = asyncHandler(async (req, res) => {
  try {

    const { page = 1, limit = 10, company, sortBy, sortOrder, minPrice, maxPrice, fuelType, transmission } = req.query;


    const where = {};
    if (company) where.carCompany = company;
    if (minPrice || maxPrice) {
      where.rate = {};
      if (minPrice) where.rate.gte = parseInt(minPrice);
      if (maxPrice) where.rate.lte = parseInt(maxPrice);
    }
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;

    const orderBy = {};
    if (sortBy && sortOrder) {
      orderBy[sortBy] = sortOrder.toLowerCase();
    }


    const cars = await prisma.car.findMany({
      include:{
        carImages:true
      },
      where    , // Apply where condition directly
      orderBy,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      
    });

    const carsWithImages = cars.map(car => {
      const carImages = { interior: [], exterior: [] };

      car.carImages.forEach(image => {
        if (image.type === 'interior') {
          carImages.interior.push(image);
        } else if (image.type === 'exterior') {
          carImages.exterior.push(image);
        }
      });

      return { ...car, carImages };
    });


    const totalCars = await prisma.car.count({ where });

    res.status(200).json({ success: true, data: carsWithImages, total: totalCars });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


export const getSingleCar = asyncHandler(async (req, res) => {
  const carId = req.params.id;
  try {

    if (!carId) {
      return res.status(400).json({ message: "Please provide car id" }); // Return after sending response
    }

    const car = await prisma.car.findFirst({
      where: {
        id: carId
      },
      include: {
        carReview: {
          where: {
            carId: carId
          }
        },
        carImages:true
      }
    });

    const carImages = {
      interior: [],
      exterior: []
    };
    car.carImages.forEach(image => {
      if (image.type === 'interior') {
        carImages.interior.push(image);
      } else if (image.type === 'exterior') {
        carImages.exterior.push(image);
      }
    });    

    if (!car) {
      return res.status(404).json({ message: "Car not found" }); // Return after sending response
    }

    res.status(200).json({ success: true, message: "Car detail fetched successfully",  car: {
      ...car,
      carImages: {
        interior: carImages.interior,
        exterior: carImages.exterior
      }
    }  });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    console.log(error);
  }
});


export const searchCar = asyncHandler(async (req, res) => {
  try {
    const { search: searchQuery, page = 1, pageSize = 10, limit } = req.query;

    const skip = (page - 1) * pageSize;

    let take = pageSize;
    if (limit) {
      // If a limit is provided, adjust take to be the minimum of pageSize and limit
      take = Math.min(parseInt(limit), pageSize);
    }

    const cars = await prisma.car.findMany({
      where: {
        OR: [
          { carName: { contains: searchQuery || '' } },
          { carModel: { contains: searchQuery || '' } },
          { carCompany: { contains: searchQuery || '' } },
          { description: { contains: searchQuery || '' } },
          { transmission: { contains: searchQuery || '' } },
        ],
      },
      skip,
      take,
    });

    res.status(200).json({ success: true, data: cars });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});



export const putCarReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const { carId, rating, review } = req.body;
    if (!carId || !rating || !review) {
      return res.status(400).json({ message: "Please provide car ID, review, and rating" });
    }
    if (rating > 5) {
      return res.status(400).json({ message: "Rating should be less than or equal to 5" });
    }

    const existingCar = await prisma.car.findUnique({
      where: {
        id: carId
      }
    });

    if (!existingCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    const ratingInt = parseInt(rating);
    const newReview = await prisma.carReview.create({
      data: {
        rating: ratingInt,
        review,
        car: {
          connect: { id: carId }
        },
        user: {
          connect: { id: userId }
        }
      },
      include: {
        car: true,
        user: true
      }
    });

    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    console.log(error);
  }
});
