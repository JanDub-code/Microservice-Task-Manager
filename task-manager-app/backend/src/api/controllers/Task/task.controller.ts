// src/api/controllers/Task/task.controller.ts
import { Request, Response } from 'express';
import { taskService } from '../../../business/task.service';
import { validateBody, validateParams } from '../../../middleware/validation.middleware';
import { IdParam } from '../../../types/base.dto';
import { TaskDto } from './task.dto';
import axios from 'axios';
import {Config} from "../../../../config";

export class TaskController {

    // Get all tasks
    async getAll(req: Request, res: Response) {
        try {
            const { teamId } = req.query;

            let tasks;
            if (teamId && typeof teamId === 'string') {
                tasks = await taskService.getTasksByTeamId(teamId);
            } else {
                tasks = await taskService.getAll();
            }

            res.status(200).send(tasks);
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }

    // Get a specific task by ID
    async getById(req: Request, res: Response) {
        try {
            const { id } = await validateParams(req, IdParam);
            const task = await taskService.getById(id);

            if (!task) {
                res.status(404).send({ error: 'Task not found' });
                return;
            }

            res.status(200).send(task);
        } catch (error: any) {
            console.error('Error fetching task:', error);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }

    // Create a new task
    async create(req: Request, res: Response) {
        try {
            // Validate request body
            const dto = await validateBody(req, TaskDto);

            // Create the task using the service
            const task = await taskService.create(dto);
            res.status(201).send(task);
        } catch (error: any) {
            console.error('Error creating task:', error);
            res.status(400).send({ error: error.message || 'Invalid data' });
        }
    }

    // Update an existing task
    async update(req: Request, res: Response) {
        try {
            const { id } = await validateParams(req, IdParam);
            const dto = await validateBody(req, TaskDto);

            const existingTask = await taskService.getById(id);
            if (!existingTask) {
                res.status(404).send({ error: 'Task not found' });
                return;
            }

            const updatedTask = await taskService.update(id, dto);
            res.status(200).send(updatedTask);
        } catch (error: any) {
            console.error('Error updating task:', error);
            res.status(400).send({ error: error.message || 'Invalid data' });
        }
    }

    // Delete a task
    async delete(req: Request, res: Response) {
        try {
            const { id } = await validateParams(req, IdParam);
            const deletedTask = await taskService.delete(id);

            if (!deletedTask) {
                res.status(404).send({ error: 'Task not found' });
                return;
            }

            res.status(204).send();
        } catch (error: any) {
            console.error('Error deleting task:', error);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }

    async addComment(req: Request, res: Response) {
        try {
            const { id } = await validateParams(req, IdParam); // task ID
            const { userId, content } = req.body;

            if (!userId || !content) {
                return res.status(400).send({ error: 'Invalid comment data' });
            }

            // Add the comment using the service
            const comment = await taskService.addComment(id, { userId, content });

            // Fetch the task to get teamId (assuming task has teamId)
            const task = await taskService.getById(id);
            if (!task) {
                return res.status(404).send({ error: 'Task not found after adding comment' });
            }

            const teamId = task.teamId.toString(); // Ensure teamId is a string

            // Prepare notification data
            const notificationData = {
                teamId: teamId.toString(),
                userId: userId.toString(),
                text: `User ${userId} commented on task ${task.name}`,
            };

            // Log all parts of notificationData to the console
            console.log("Notification data to be sent:", notificationData);

            // Send notification  http://
            await axios.post('http://socket:3003/notifications', notificationData);


            res.status(201).send(comment);
        } catch (error: any) {
            console.error('Error adding comment:', error);

            // Handle Axios errors
            if (error.response) {
                // The request was made and the server responded with a status code
                return res.status(error.response.status).send({ error: error.response.data.error || 'Failed to create notification' });
            } else if (error.request) {
                // The request was made but no response was received
                return res.status(500).send({ error: 'No response from Notification service' });
            } else {
                // Something happened in setting up the request
                return res.status(400).send({ error: error.message || 'Failed to add comment' });
            }
        }
    }


    // Update only the status of an existing task
    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = await validateParams(req, IdParam);
            const { status } = req.body;

            if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
                return res.status(400).send({ error: 'Invalid status value' });
            }

            const updatedTask = await taskService.updateStatus(id, status);

            if (!updatedTask) {
                return res.status(404).send({ error: 'Task not found' });
            }

            res.status(200).send(updatedTask);
        } catch (error: any) {
            console.error('Error updating task status:', error);
            res.status(400).send({ error: error.message || 'Invalid data' });
        }
    }

}
