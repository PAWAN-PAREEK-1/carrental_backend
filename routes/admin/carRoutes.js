import express from 'express';
import { addCar } from '../../controller/admin/carCntroller.js';


const router = express.Router();





router.route('/addCar').post(addCar)


export { router as admin}

