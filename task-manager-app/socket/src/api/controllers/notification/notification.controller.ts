import 'reflect-metadata';
import { NotificationCreateDto } from "./notification.create.dto";
import { Request, Response } from 'express';
import { validateBody, validateParams } from "../../../middleware/validation.middleware";
import { notificationService } from "../../../business/notification.service";
import {Dto, IdParam} from "../../../types/base.dto";
import { socketServer } from "../../../socket/socket.server";

export class NotificationController {

    async create(req: Request, res: Response) {
        try {
            // Validate request body
            const dto = await validateBody(req, NotificationCreateDto);

            const { teamId, userId, text } = dto;

            // Create the notification using the service
            const notification = await notificationService.create(teamId, userId, dto);

            // Optionally send real-time notification via sockets
            socketServer.sendNotificationToSubscribers(teamId, notification);

            res.status(201).send(notification);
        } catch (error: any) {
            console.error('Error creating notification:', error);
            res.status(400).send({ error: error.message || 'Invalid data' });
        }
    }

    async getByTeam(req: Request, res: Response) {
        const { teamId } = await validateParams(req, Dto);
        const notifications = await notificationService.getNotificationsByTeam(teamId);
        res.status(200).send(notifications);
    }

    async getByUser(req: Request, res: Response) {
        const { userId } = await validateParams(req, IdParam);
        const notifications = await notificationService.getNotificationsByUser(userId);
        res.status(200).send(notifications);
    }

}
