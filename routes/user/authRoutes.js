import express from 'express';
import {  deleteUser, getUser, login, register, resetPassword, updateUser } from '../../controller/user/authController.js';

import { authUser } from '../../middelware/validateToken.js';
import { testOTPHandler } from '../../controller/user/otpController.js';
import { verifyOTPHandler } from '../../middelware/otpValidator.js';
const router = express.Router();


router.route('/login').post(login)
router.route('/register').post(verifyOTPHandler,register)
router.route('/otp').post(testOTPHandler)
router.route('/reset-password').put(authUser,resetPassword)
router.route('/').get(authUser, getUser).put(authUser, updateUser)

// router.route('/:id').delete(authUser,deleteUser)


 
export { router as auth}

