import express from 'express';
import { login, register } from '../../controller/user/authController.js';
const router = express.Router();


router.route('/login').get(login)
router.route('/register').post(register)

export { router as auth}

