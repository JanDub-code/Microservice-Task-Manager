import { NotificationCreateDto } from "../api/controllers/notification/notification.create.dto";
import { Notification } from "../persistence/models/notification.model";
import { ObjectId } from 'mongodb';

export const notificationService = {

    async create(teamId: string, userId: string, data: NotificationCreateDto) {
        const notification = new Notification({
            teamId: teamId,
            userId: userId,
            text: data.text,
            timestamp: new Date(),
        });
        return await notification.save();
    },

    async getNotificationsByTeam(teamId: string) {
        return Notification.find({ teamId: teamId }).sort({ timestamp: -1 });
    },

    async getNotificationsByUser(userId: string) {
        return Notification.find({ userId: userId }).sort({ timestamp: -1 });
    },

};
