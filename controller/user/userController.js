import express from "express";
import prisma from "../../db/db-config.js";
// import OTP from 'otp-generator';
// import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';






export const    register = asyncHandler(async (req, res, next) => {
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
            return res.status(400).json({success:true, message: "Email or mobile number already in use" });
        }

        if (!password || password.length === 0) {
            return res.status(400).json({ message: "Password is required" });
        }


        const hashedPassword = bcrypt.hashSync(password, 10);

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

export const updateUser = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, profileImage ,image_key} = req.body
        const userId = req.user.id
        const file = req.file
        // console.log(userId)

        if (!userId) {
            res.status(404).json({ message: "please provide userid" })
        }
        // if(!firstName|| !lastName || !profileImage){
        //   res.status(404).json({message:"all fileds are require"})
        // }

        const dataUpdate = {}
        if (firstName) dataUpdate.firstName = firstName;
        if (lastName) dataUpdate.lastName = lastName;
        if (profileImage) dataUpdate.profileImage = profileImage;
        if (image_key) dataUpdate.image_key = image_key;

        if (Object.keys(dataUpdate).length === 0) {
            return res.status(400).json({ message: "No fields provided for updating" });
        }
        console.log("this is profile image "+ profileImage  + "and this is file " + file)
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
                image_key:true,
                type: true,
                createdAt: true,
                updatedAt: true,

            }
        })

        return res.status(200).json({success:true, message: "User updated successfully", data: updatedUser });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" });
    }
})


export const deleteUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            res.status(404).json({ message: "please provide userid" })
        }
        const deleteData = await prisma.user.delete({
            where: { id: userId },

        })

        return res.status(200).json({success:true, message: "User deleted successfully", data: deleteData });

    } catch (error) {
        console.log(error)
    }
})

export const getUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user details including associated cars
        const userWithCars = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                cars: true
            }
        });

        res.json({
            user: userWithCars,
            success:true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});











