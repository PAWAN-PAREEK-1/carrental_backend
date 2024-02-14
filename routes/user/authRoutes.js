import express from 'express';
import {  login, register, testOTPHandler, updateUser } from '../../controller/user/authController.js';
import { verifyOTPHandler } from '../../middelware/otpValidator.js';
import { authUser } from '../../middelware/validateToken.js';
const router = express.Router();


router.route('/login').post(login)
router.route('/register').post(verifyOTPHandler,register)
router.route('/otp').post(testOTPHandler)
router.route('/updateProfile/:id').put(authUser,updateUser)


 
export { router as auth}

