import express from "express";
import prisma from "../../db/db-config.js";
import OTP from 'otp-generator';
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';

export const login = asyncHandler(async(req, res, next) => {
   try {
    const {mobileNumber,password}=req.body
    if(!mobileNumber ){
      res.status(404).json({message:"please provide email and password "})
    }
    const userExist = await prisma.user.findFirst({
      where: {
          mobileNumber: parseInt(mobileNumber)
      }
  });
  
    if(!userExist){
      res.status(200).json({message:"mobile number is not matched"})
    }
    const isMatch = await bcrypt.compare(password,userExist.password);
    if(!isMatch){
      res.status(404).json({message:"invalid password"})
    }

    const accessToken = jwt.sign({ 
      userId: userExist.id,
      firstName: userExist.firstName,
      lastName: userExist.lastName,
      email: userExist.email,
      type: userExist.type
  }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "Login successful", accessToken: accessToken });
   } catch (error) {
    console.log(error)
   } 
});

export const register = asyncHandler(async (req, res, next) => {
  try {
      const { firstName, profileImage, password, mobileNumber, lastName, email, type } = req.body;
      console.log(req.body);

      if (!firstName || !password || !mobileNumber || !lastName || !email || !type) {
          return res.status(400).json({ message: "All fields are required" });
      }

      const findUser = await prisma.user.findFirst({
          where: {
              OR: [
                  { email: { equals: email } },
                  { mobileNumber: { equals: parseInt(mobileNumber) } }, // Convert mobileNumber to integer
              ],
          },
      });
      if (findUser) {
          return res.status(400).json({ message: "Email or mobile number already in use" });
      }

      if (!password || password.length === 0) {
          return res.status(400).json({ message: "Password is required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
          data: {
              firstName: firstName,
              lastName: lastName,
              password: hashedPassword,
              mobileNumber: parseInt(mobileNumber), // Convert mobileNumber to integer
              email: email,
              profileImage: profileImage,
              type: type, // Include the type field
          },
      });

      return res.status(200).json({ message: "User created successfully", data: newUser });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
  }
});





// Function to generate OTP
// const generateOTP = () => {
//   const otp = OTP.generate(4, { digits: true, alphabets: false, upperCase: false, specialChars: false });
//   return otp;
// };

// // Function to send OTP via email
// const sendOTPEmail = async (email, otp) => {
//   const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//           user: 'knikniknikni506@gmail.com', // Your Gmail email address
//           pass: 'Pawan@6150', // Your Gmail password
//       },
//   });

//   const mailOptions = {
//       from: 'knikniknikni506@gmail.com',
//       to: email,
//       subject: 'OTP Verification',
//       text: `Your OTP for registration is ${otp}. It will expire in 10 minutes.`,
//   };

//   await transporter.sendMail(mailOptions);
// };

// export const generateOTPHandler = asyncHandler(async (req, res) => {
//   try {
//       const { email } = req.body;

//       // Check if the email is provided
//       if (!email) {
//           return res.status(400).json({ message: "Email is required" });
//       }

//       // Generate OTP
//       const otp = generateOTP();

//       // Hash the OTP before saving
//       const hashedOTP = await bcrypt.hash(otp, 10);

//       // Save OTP to the database with a timestamp
//       const otpRecord = await prisma.otp.create({
//           data: {
//               email,
//               hashedOTP,
//               createdAt: new Date(),
//           },
//       });

//       // Send OTP to the user's email
//       await sendOTPEmail(email, otp);

//       return res.status(200).json({ message: "OTP sent successfully" });
//   } catch (error) {
//       console.log(error);
//       return res.status(500).json({ message: "Internal server error" });
//   }
// });

// export const verifyOTPHandler = asyncHandler(async (req, res) => {
//   try {
//       const { email, otp } = req.body;

//       // Check if the email and OTP are provided
//       if (!email || !otp) {
//           return res.status(400).json({ message: "Email and OTP are required" });
//       }

//       // Retrieve the OTP record from the database
//       const otpRecord = await prisma.otp.findFirst({
//           where: {
//               email,
//           },
//           orderBy: {
//               createdAt: 'desc',
//           },
//       });

//       // If no record found or OTP expired (assuming OTP validity is 10 minutes)
//       if (!otpRecord || Date.now() - otpRecord.createdAt.getTime() > 10 * 60 * 1000) {
//           return res.status(400).json({ message: "OTP expired or invalid" });
//       }

//       // Verify OTP
//       const isValidOTP = await bcrypt.compare(otp, otpRecord.hashedOTP);

//       if (!isValidOTP) {
//           return res.status(400).json({ message: "Invalid OTP" });
//       }

//       // Proceed with registration
//       // You can redirect to the registration endpoint or return a success response
//       return res.status(200).json({ message: "OTP verified successfully" });
//   } catch (error) {
//       console.log(error);
//       return res.status(500).json({ message: "Internal server error" });
//   }
// });


const generateOTP = () => {
  const otp = OTP.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
  return otp;
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'knikniknikni506@gmail.com',
        pass: 'omjq bvsh zdno krjd'
    }
});

  const mailOptions = {
      from: 'knikniknikni506@gmail.com',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP for registration is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

export const testOTPHandler = asyncHandler(async (req, res) => {
  try {
      const { email } = req.body;

      // Check if the email is provided
      if (!email) {
          return res.status(400).json({ message: "Email is required" });
      }

      // Generate OTP
      const otp = generateOTP();

      // Send OTP to the provided email
      await sendOTPEmail(email, otp);

      return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
  }
});


