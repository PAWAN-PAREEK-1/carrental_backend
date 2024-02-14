import express from "express";
import prisma from "../../db/db-config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const login = (req, res, next) => {
  res.json({ message: "login success" });
};

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


