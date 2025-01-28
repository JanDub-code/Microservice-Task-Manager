// task.test.ts

import { beforeEach, describe, expect, it } from "vitest";
import request, { authorizedRequest, login } from "../request";
import { Task } from "../../src/persistence/models/task.model";
import { User } from "../../src/persistence/models/user.model";
import mongoose from "mongoose";
import { config } from "dotenv";
import { Config } from "../../config";

describe("Tasks API", () => {
    let adminUser: any;
    let memberUser: any;
    let noRoleUser: any;
    let existingTaskId: string;
    let fakeTaskId = "c00000000000000000000001";

    beforeEach(async () => {

        // Create different users
        noRoleUser = new User({
            name: "No Role User",
            email: "user1@example.com",
            role: "NONE",
            password: "password1"
        });
        await noRoleUser.save();

        adminUser = new User({
            name: "Admin User",
            email: "user2@example.com",
            role: "ADMIN",
            password: "password2"
        });
        await adminUser.save();

        memberUser = new User({
            name: "Member User",
            email: "user3@example.com",
            role: "MEMBER",
            password: "password3"
        });
        await memberUser.save();

        // Create a sample task
        const sampleTask = new Task({
            teamId: new mongoose.Types.ObjectId().toString(), // or a real team ID
            name: "Existing Task",
            description: "Sample description",
            status: "Pending",
            priority: "Medium",
            assignedTo: "user3@example.com",
            createdBy: "user2@example.com",
            dueDate: new Date("2025-12-31"),
            comments: []
        });
        await sampleTask.save();
        existingTaskId = sampleTask._id.toString();
    });

    //
    // GET /tasks
    //
    describe("GET /tasks", () => {
        it("should return 401 if not authenticated", async () => {
            const res = await request.get("/tasks");
            expect(res.status).toBe(401);
        });

        it("should return 403 if the user role is not ADMIN, OFFICER, or MEMBER", async () => {
            await login("user1"); // noRoleUser
            const res = await authorizedRequest.get("/tasks");
            expect(res.status).toBe(403);
        });

        it("should return all tasks for an authenticated user with a valid role (ADMIN, OFFICER, MEMBER)", async () => {
            await login("user2"); // adminUser
            const res = await authorizedRequest.get("/tasks");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0]).toHaveProperty("name", "Existing Task");
        });
    });

    //
    // GET /tasks/:id
    //
    describe("GET /tasks/:id", () => {
        it("should return 401 if not authenticated", async () => {
            const res = await request.get(`/tasks/${existingTaskId}`);
            expect(res.status).toBe(401);
        });

        it("should return 403 if the user does not have a valid role", async () => {
            await login("user1"); // noRoleUser
            const res = await authorizedRequest.get(`/tasks/${existingTaskId}`);
            expect(res.status).toBe(403);
        });

        it("should return 404 if the task does not exist", async () => {
            await login("user2"); // adminUser
            const res = await authorizedRequest.get(`/tasks/${fakeTaskId}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error", "Task not found");
        });

        it("should return the task if the user has a valid role", async () => {
            await login("user2"); // adminUser
            const res = await authorizedRequest.get(`/tasks/${existingTaskId}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id", existingTaskId);
            expect(res.body).toHaveProperty("name", "Existing Task");
        });
    });

    //
    // POST /tasks
    //
    describe("POST /tasks", () => {
        const newValidTask = {
            teamId: new mongoose.Types.ObjectId().toString(),
            name: "New Task",
            description: "New task description",
            status: "Pending",        // enum: [Pending, In Progress, Completed]
            priority: "Medium",       // enum: [Low, Medium, High]
            assignedTo: "user3@example.com",
            createdBy: "user2@example.com",
            dueDate: new Date("2026-01-01").toISOString(),
            comments: []
        };

        it("should return 401 if not authenticated", async () => {
            const res = await request.post("/tasks").send(newValidTask);
            expect(res.status).toBe(401);
        });

        it("should return 403 if the user is not ADMIN or OFFICER", async () => {
            await login("user1"); // role = MEMBER
            const res = await authorizedRequest.post("/tasks").send(newValidTask);
            expect(res.status).toBe(403);

            await login("user1"); // no role
            const res2 = await authorizedRequest.post("/tasks").send(newValidTask);
            expect(res2.status).toBe(403);
        });

        it("should create a new task for ADMIN or OFFICER, with valid data", async () => {
            await login("user2"); // adminUser
            const res = await authorizedRequest.post("/tasks").send(newValidTask);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", newValidTask.name);
            expect(res.body).toHaveProperty("description", newValidTask.description);
            expect(res.body).toHaveProperty("status", newValidTask.status);
            expect(res.body).toHaveProperty("priority", newValidTask.priority);
            expect(res.body).toHaveProperty("assignedTo", newValidTask.assignedTo);
            expect(res.body).toHaveProperty("createdBy", newValidTask.createdBy);
        });

        it("should return 400 if required fields are missing", async () => {
            await login("user2"); // adminUser
            const invalidTask = { ...newValidTask };
            delete invalidTask.assignedTo; // remove a required field

            const res = await authorizedRequest.post("/tasks").send(invalidTask);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error"); // e.g. 'Task validation failed' ...
        });
    });

    //
    // PUT /tasks/:id
    //
    describe("PUT /tasks/:id", () => {
        const updateData = {
            teamId: new mongoose.Types.ObjectId().toString(),
            name: "Updated Task Name",
            description: "Updated Description",
            status: "In Progress",
            priority: "High",
            assignedTo: "user3@example.com",
            createdBy: "user2@example.com",
            dueDate: new Date("2025-12-01").toISOString(),
            comments: []
        };

        it("should return 401 if not authenticated", async () => {
            const res = await request.put(`/tasks/${existingTaskId}`).send(updateData);
            expect(res.status).toBe(401);
        });

        it("should return 403 if user is not ADMIN or OFFICER", async () => {
            await login("user1"); // MEMBER
            const res = await authorizedRequest.put(`/tasks/${existingTaskId}`).send(updateData);
            expect(res.status).toBe(403);
        });

        it("should return 404 if the task does not exist", async () => {
            await login("user2"); // ADMIN
            const res = await authorizedRequest.put(`/tasks/${fakeTaskId}`).send(updateData);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error", "Task not found");
        });

        it("should update the task for ADMIN or OFFICER with valid data", async () => {
            await login("user2"); // ADMIN
            const res = await authorizedRequest.put(`/tasks/${existingTaskId}`).send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", updateData.name);
            expect(res.body).toHaveProperty("description", updateData.description);
            expect(res.body).toHaveProperty("status", updateData.status);
            expect(res.body).toHaveProperty("priority", updateData.priority);
            expect(res.body).toHaveProperty("dueDate");
        });

        it("should return 400 if required fields are missing", async () => {
            await login("user2");
            const invalidUpdate = { ...updateData };
            delete invalidUpdate.createdBy;

            const res = await authorizedRequest.put(`/tasks/${existingTaskId}`).send(invalidUpdate);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error");
        });
    });

    //
    // DELETE /tasks/:id
    //
    describe("DELETE /tasks/:id", () => {
        it("should return 401 if not authenticated", async () => {
            const res = await request.delete(`/tasks/${existingTaskId}`);
            expect(res.status).toBe(401);
        });

        it("should return 403 if user is not ADMIN or OFFICER", async () => {
            await login("user1"); // MEMBER
            const res = await authorizedRequest.delete(`/tasks/${existingTaskId}`);
            expect(res.status).toBe(403);
        });

        it("should return 404 if the task does not exist", async () => {
            await login("user2"); // ADMIN
            const res = await authorizedRequest.delete(`/tasks/${fakeTaskId}`);
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error", "Task not found");
        });

        it("should delete the task for ADMIN or OFFICER", async () => {
            await login("user2"); // ADMIN
            const res = await authorizedRequest.delete(`/tasks/${existingTaskId}`);
            expect(res.status).toBe(204);
        });
    });

    //
    // POST /tasks/:id/comments
    //
    describe("POST /tasks/:id/comments", () => {
        const validComment = {
            userId: "user3@example.com",
            content: "This is a test comment"
        };

        it("should return 401 if not authenticated", async () => {
            const res = await request.post(`/tasks/${existingTaskId}/comments`).send(validComment);
            expect(res.status).toBe(401);
        });

        it("should return 403 if the user does not have a valid role (ADMIN, OFFICER, MEMBER)", async () => {
            await login("user1"); // noRoleUser
            const res = await authorizedRequest.post(`/tasks/${existingTaskId}/comments`).send(validComment);
            expect(res.status).toBe(403);
        });

        it("should return 400 if the task does not exist", async () => {
            await login("user2"); // MEMBER
            const res = await authorizedRequest.post(`/tasks/${fakeTaskId}/comments`).send(validComment);
            console.log('Backend URL:', res.body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Task not found");
        });



        it("should return 400 if comment data is invalid", async () => {
            await login("user2"); // MEMBER
            const invalidComment = { userId: "", content: "" };
            const res = await authorizedRequest.post(`/tasks/${existingTaskId}/comments`).send(invalidComment);
            console.log('Backend URL:', res.body);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Invalid comment data");
        });
    });

    //
    // PATCH /tasks/:id/status
    //
    describe("PATCH /tasks/:id/status", () => {
        it("should return 401 if not authenticated", async () => {
            const res = await request.patch(`/tasks/${existingTaskId}/status`).send({ status: "Completed" });
            expect(res.status).toBe(401);
        });

        it("should return 403 if user is not ADMIN or OFFICER", async () => {
            await login("user1"); // MEMBER
            const res = await authorizedRequest.patch(`/tasks/${existingTaskId}/status`).send({ status: "Completed" });
            expect(res.status).toBe(403);
        });

        it("should return 404 if the task does not exist", async () => {
            await login("user2"); // ADMIN
            const res = await authorizedRequest.patch(`/tasks/${fakeTaskId}/status`).send({ status: "Completed" });
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("error", "Task not found");
        });

        it("should return 400 if status is invalid", async () => {
            await login("user2"); // ADMIN
            const res = await authorizedRequest.patch(`/tasks/${existingTaskId}/status`).send({ status: "WRONG_STATUS" });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error", "Invalid status value");
        });

        it("should update the status if user is ADMIN or OFFICER", async () => {
            await login("user2"); // ADMIN
            const res = await authorizedRequest.patch(`/tasks/${existingTaskId}/status`).send({ status: "Completed" });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("_id", existingTaskId);
            expect(res.body).toHaveProperty("status", "Completed");
        });
    });
});
