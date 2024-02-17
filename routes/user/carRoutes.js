import express from 'express';

import { authUser } from '../../middelware/validateToken.js';
import { addCar } from '../../controller/user/carController.js';

const router = express.Router();





router.route('/addCar').post(authUser,addCar)


export { router as car}

