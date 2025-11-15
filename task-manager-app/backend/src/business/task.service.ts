// src/business/task.service.ts
import { Task } from "../persistence/models/task.model";
import { TaskDto } from "../api/controllers/Task/task.dto";

export const taskService = {
    async create(data: TaskDto) {
        const task = new Task(data);
        await task.save();
        return task;
    },

    async getAll() {
        return Task.find();
    },

    async getById(id: string) {
        return Task.findById(id);
    },

    async update(id: string, data: TaskDto) {
        return Task.findByIdAndUpdate(id, data, { new: true });
    },

    async delete(id: string) {
        return Task.findByIdAndDelete(id);
    },

    async addComment(taskId: string, comment: { userId: string; content: string }) {
        const task = await Task.findById(taskId);
        if (!task) {
            throw new Error("Task not found");
        }

        task.comments.push(comment);
        await task.save();
        return comment;
    },

    async getTasksByTeamId(teamId: string) {
        return Task.find({ teamId });
    },

    async updateStatus(id: string, status: string) {
        return Task.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    },

};
