import express from 'express';

import { authUser } from '../../middelware/validateToken.js';
import { addCar, getAllCar, getAllCarModel, putCarReview, searchCar } from '../../controller/user/carController.js';

const router = express.Router();





router.route('/addCar').post(authUser,addCar)
router.route('/car-review').post(authUser,putCarReview)
router.route('/getAllCarModel').get(authUser,getAllCarModel)
router.route('/getAllCar').get(authUser,getAllCar)
router.route('/searchCar').get(authUser,searchCar)


export { router as car}

