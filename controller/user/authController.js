import express from "express";
import prisma from "../../db/db-config.js";
// import OTP from 'otp-generator';
// import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';




export const login = asyncHandler(async (req, res, next) => {
    try {
        const { mobileNumber, password } = req.body
        // console.log(req.body)
        if (!mobileNumber) {
            res.status(404).json({ message: "please provide mobile and password " })
        }
        const userExist = await prisma.user.findFirst({
            where: {
                mobileNumber: parseInt(mobileNumber)
            }
        });

        if (!userExist) {
            res.status(200).json({ message: "mobile number is not matched" })
        }
        const isMatch = await bcrypt.compare(password, userExist.password);
        if (!isMatch) {
            res.status(404).json({ message: "invalid password" })
        }

        const accessToken = jwt.sign({
            userId: userExist.id,
            firstName: userExist.firstName,
            lastName: userExist.lastName,
            email: userExist.email,
            type: userExist.type
        }, process.env.JWT_SECRET, { expiresIn: '720h' });

        res.status(200).json({success:true, message:  "Login successful", accessToken: accessToken });
    } catch (error) {
        console.log(error)
    }
});


export const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { newPassword, oldPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        // Check if all required fields are provided
        if (!newPassword || !oldPassword || !confirmPassword) {
            return res.status(400).json({ message: "All password fields are required" });
        }

        // Find the user by userId
        const user = await prisma.user.findFirst({
            where: { id: userId }
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify if old password matches the password stored in the database
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // Verify if new password matches the confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password do not match" });
        }

        // Generate hash for the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password with the new hashed password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export const forgotPassword = asyncHandler(async(req,res)=>{
    try {

        const {email,newPassword,confirmPassword} = req.body;
        if(!email || !newPassword || !confirmPassword){
        return res.status(404).json({ message: "please enter all fields" });
    }
    const CheckUser = await prisma.user.findFirst({
        where:{email}
    })

    if (!CheckUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword,10)
    const updatePassword = await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword
        }
    })

    return res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
console.log(error)
    }
})









