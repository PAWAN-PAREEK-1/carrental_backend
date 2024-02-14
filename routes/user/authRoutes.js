import express from 'express';
import {  login, register, testOTPHandler } from '../../controller/user/authController.js';
const router = express.Router();


router.route('/login').post(login)
router.route('/register').post(register)
router.route('/otp').post(testOTPHandler)


export { router as auth}

