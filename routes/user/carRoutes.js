import express from 'express';

import { authUser } from '../../middelware/validateToken.js';
import { addCar, getAllCar } from '../../controller/user/carController.js';

const router = express.Router();





router.route('/addCar').post(authUser,addCar)
router.route('/getAllCar').get(authUser,getAllCar)


export { router as car}

