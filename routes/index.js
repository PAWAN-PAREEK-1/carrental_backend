import express from 'express';

import {auth} from './user/authRoutes.js'
import { car } from './user/carRoutes.js';
import { admin } from './admin/carRoutes.js';

          
const router = express.Router();


router.use('/user', auth);
router.use('/car', car);
router.use('/admin', admin);

          


export { router as routes };