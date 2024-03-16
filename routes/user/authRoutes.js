import express from 'express';
import {  forgotPassword, login,  resetPassword } from '../../controller/user/authController.js';
import {  deleteUser, getUser, register, updateUser } from '../../controller/user/userController.js';

import { authUser } from '../../middelware/validateToken.js';
import { testOTPHandler } from '../../controller/user/otpController.js';
import { verifyOTPHandler } from '../../middelware/otpValidator.js';
import { upload } from '../../multer.js';
// import { sign } from 'jsonwebtoken';
const router = express.Router();


router.route('/login').post(login)
router.route('/register').post(verifyOTPHandler,register)
router.route('/forgot-password').post(verifyOTPHandler,forgotPassword)
router.route('/otp').post(testOTPHandler)
router.route('/reset-password').put(authUser,resetPassword)
router.route('/').get(authUser, getUser).put(authUser,upload.single('file'), updateUser)


router.route('/:id').delete(authUser,deleteUser)



export { router as auth}

