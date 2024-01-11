import express from "express";
import { LocationController } from "../controllers/location.controller.js";



const router = express.Router();
const locationController = new LocationController();


router.get("/locations", locationController.getSurroundLocation);

router.get("/locations/:locationId", locationController.getPopularLocation);



export default router;