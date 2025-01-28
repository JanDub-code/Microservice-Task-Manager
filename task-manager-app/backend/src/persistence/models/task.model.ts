// src/persistence/models/task.model.ts
import * as mongoose from "mongoose";

export const CommentSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Username
    content: { type: String, required: true },
}, { timestamps: true });

export const TaskSchema = new mongoose.Schema({
    teamId: { type: String, required: true }, // Team name
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    assignedTo: { type: String, required: true }, // Username
    createdBy: { type: String, required: true }, // Username
    dueDate: { type: Date, required: true },
    comments: { type: [CommentSchema], default: [] },
}, { timestamps: true });

export const Task = mongoose.model('Task', TaskSchema);
