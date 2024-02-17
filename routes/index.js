import express from 'express';

import {auth} from './user/authRoutes.js'
import { car } from './user/carRoutes.js';
const router = express.Router();


router.use('/user', auth);
router.use('/car', car);

export { router as routes };