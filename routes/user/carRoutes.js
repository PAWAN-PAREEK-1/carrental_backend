import express from 'express';

import { authUser } from '../../middelware/validateToken.js';
import { addCar, getAllCar, getAllCarModel } from '../../controller/user/carController.js';

const router = express.Router();





router.route('/addCar').post(authUser,addCar)
router.route('/getAllCarModel').get(authUser,getAllCarModel)
router.route('/getAllCar').get(authUser,getAllCar)


export { router as car}

