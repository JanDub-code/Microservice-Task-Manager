import {homepageController} from "./controllers/homepage/homepage.controller";
import {AircraftStatusController} from "./controllers/aircraftStatus/aircraftStatus.controller";
import {apiErrorHandler} from "../middleware/error.middleware";
import express = require('express');
import cors = require('cors');
import {WarningController} from "./controllers/warning/warning.controller";
import {NotificationController} from "./controllers/notification/notification.controller";


export const server = express()

// Allow CORS for process.env.CORS_ORIGIN
server.use(cors({
    origin: process.env.CORS_ORIGIN
}))
console.log('Allowed CORS for', process.env.CORS_ORIGIN)

// Middleware to parse JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({extended: true}))

// --- ROUTES ---

// Homepage
server.get('/', homepageController.homepage)


// Warning
const warningController = new WarningController()
server.post('/warnings', warningController.create)

const notificationController = new NotificationController()
server.post('/notifications', notificationController.create);
server.get('/teams/:teamId/notifications', notificationController.getByTeam)
server.get('/users/:userId/notifications', notificationController.getByUser)
// --- END ROUTES ---


// Middleware: Error handling
server.use(apiErrorHandler)
