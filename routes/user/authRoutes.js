import express from 'express';
import { login } from '../../controller/user/authController.js';
const router = express.Router();


router.route('/login').get(login)

export { router as auth}

