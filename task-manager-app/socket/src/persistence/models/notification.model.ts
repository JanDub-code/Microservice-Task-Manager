import * as mongoose from "mongoose";

export interface INotification extends mongoose.Document {
    teamId: String;
    userId: String;
    text: string;
    timestamp: Date;
}

const NotificationSchema = new mongoose.Schema({
    teamId: { type: String, required: true, ref: 'Team' },
    userId: { type: String, required: true, ref: 'User' },
    text: { type: String, required: true, maxlength: 500 },
    timestamp: { type: Date, required: true, default: Date.now },
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
