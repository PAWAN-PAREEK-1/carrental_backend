import express from 'express';

import {auth} from './user/authRoutes.js'
const router = express.Router();


router.use('/user', auth);

export { router as routes };