import express from "express";
import prisma from "../../db/db-config.js";
import OTP from 'otp-generator';
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';




// -------------------------------------------------------------------------OTP APIS START ------------------------------------------------------------------------------------------------------------



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


        const { otp, hashedOTP } = await generateOTP(email);


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

        return res.status(200).json({success:true, message: "OTP sent successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});




// -------------------------------------------------------------------------OTP APIS END ------------------------------------------------------------------------------------------------------------








