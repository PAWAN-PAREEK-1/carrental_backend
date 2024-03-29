import express from 'express';

import { authUser } from '../../middelware/validateToken.js';
import { addCar, getAllCar, getAllCarModel, getSingleCar, putCarReview, searchCar } from '../../controller/user/carController.js';
import {upload} from '../../multerCar.js';

const router = express.Router();





router.route('/addCar').post( authUser,upload.fields([ { name: 'interiorImages', maxCount: 5 }, { name: 'exteriorImages', maxCount: 5 }]),addCar)
router.route('/car-review').post(authUser,putCarReview)
router.route('/getAllCarModel').get(authUser,getAllCarModel)
router.route('/getAllCar').get(authUser,getAllCar)
router.route('/get-single-car/:id').get(authUser,getSingleCar)
router.route('/searchCar').get(authUser,searchCar)



export { router as car}

