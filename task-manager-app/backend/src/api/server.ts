import {homepageController} from "./controllers/homepage/homepage.controller";
import {apiErrorHandler} from "../middleware/error.middleware";
import {UserController} from "./controllers/user/user.controller";
import express = require('express');
import cors = require('cors');
import {hasAnyRole, oAuthModel} from "../middleware/auth.middleware";
import {TeamController} from "./controllers/Team/team.controller";
import {TaskController} from "./controllers/Task/task.controller";
const ExpresOAuthServer = require('@node-oauth/express-oauth-server');

export const server = express()

// Allow CORS for process.env.CORS_ORIGIN
server.use(cors({
    origin: process.env.CORS_ORIGIN
}))
console.log('Allowed CORS for', process.env.CORS_ORIGIN)

// Security
const auth = new ExpresOAuthServer({ model: oAuthModel });

// Middleware to parse JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({ extended: true }))


// Homepage
server.get('/', homepageController.homepage)

// Users
const userController = new UserController()
server.get('/users/search', userController.search)
server.get('/users/me/reservations', [auth.authenticate()], userController.getUserReservations)

const teamController = new TeamController()
server.get('/teams', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER', 'MEMBER')], teamController.getAll);
server.get('/teams/:id', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER', 'MEMBER')], teamController.getById);
server.post('/createteam', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER')] , teamController.create);
server.put('/teams/:id', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER', 'MEMBER')], teamController.update);
server.delete('/teams/:id', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER', 'MEMBER')], teamController.delete);
server.post('/jointeam',  [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER', 'MEMBER')], teamController.joinTeam);
server.delete('/deleteUserFromTeam', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER')], teamController.removeMember);
server.patch('/changeRoleInTeam', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER')], teamController.changeRole);
server.delete('/deleteTeam', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER')], teamController.deleteTeam);

const taskController = new TaskController();
server.get('/tasks', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER', 'MEMBER')], taskController.getAll.bind(taskController));
server.get('/tasks/:id', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER', 'MEMBER')], taskController.getById.bind(taskController));
server.post('/tasks', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER')], taskController.create.bind(taskController));
server.put('/tasks/:id', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER')], taskController.update.bind(taskController));
server.delete('/tasks/:id', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER')], taskController.delete.bind(taskController));
server.post('/tasks/:id/comments', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER', 'MEMBER')], taskController.addComment.bind(taskController));
server.patch('/tasks/:id/status', [auth.authenticate(), hasAnyRole('ADMIN', 'OFFICER')], taskController.updateStatus.bind(taskController));

// Middleware: Error handling
server.use(apiErrorHandler)