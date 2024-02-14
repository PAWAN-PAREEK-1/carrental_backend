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
      select: {
          id: true,
          firstName: true,
          lastName: true,
          mobileNumber: true,
          email: true,
          profileImage: true,
          type: true,
          createdAt: true,
          updatedAt: true,
      }
      });

      return res.status(200).json({ message: "User created successfully", data: newUser });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
  }
});

export const updateUser = asyncHandler(async(req,res)=>{
  try {
    const {firstName,lastName,profileImage}= req.body
    const userId = req.params.id
    // console.log(userId)
    if(!userId){
      res.status(404).json({message:"please provide userid"})
    }
    // if(!firstName|| !lastName || !profileImage){
    //   res.status(404).json({message:"all fileds are require"})
    // }

    const dataUpdate ={}
    if (firstName) dataUpdate.firstName =firstName;
    if (lastName) dataUpdate.lastName =lastName;
    if (profileImage) dataUpdate.profileImage =profileImage;
    
    if (Object.keys(dataUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided for updating" });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataUpdate,
      select: {
          id: true,
          firstName: true,
          lastName: true,
          mobileNumber: true,
          email: true,
          profileImage: true,
          type: true,
          createdAt: true,
          updatedAt: true,
     
      }
    })
    
    return res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error" });
  }
})









const generateNumericOTP = (length) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10); // Generate a random digit (0-9) and append it to the OTP
  }
  return otp;
};

const generateOTP = async (email) => {
  let otpEntry = await prisma.otpTable.findFirst({
      where: {
          email
      }
  });

  let otp, hashedOTP;

  if (otpEntry) {
   
      otp = generateNumericOTP(4); // Generate a new OTP
      hashedOTP = await bcrypt.hash(otp, 10);
      // Update the existing OTP entry with the new OTP
      otpEntry = await prisma.otpTable.update({
          where: {
              id: otpEntry.id
          },
          data: {
              otp: hashedOTP
          }
      });
  } else {
    
      otp = generateNumericOTP(4); // Generate a new OTP
      hashedOTP = await bcrypt.hash(otp, 10);
      otpEntry = await prisma.otpTable.create({
          data: {
              email,
              otp: hashedOTP
          }
      });
  }

  return { otp, hashedOTP };
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

        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

   
        const { otp, hashedOTP } = await generateOTP();

       
        await sendOTPEmail(email, otp);
        const otpEntry = await prisma.otpTable.create({
          data: {
              email,
              otp: hashedOTP
          }
      });
      setTimeout(async () => {
        console.log('Attempting to delete OTP entry...'); 
        try {
            await prisma.otpTable.delete({
                where: {
                    id: otpEntry.id
                }
            });
            console.log('OTP entry deleted successfully'); 
        } catch (error) {
            console.error('Error deleting OTP entry:', error); 
        }
    }, 600000);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});









