// notification.test.ts

import { beforeEach, describe, expect, it } from "vitest";
import request from "../request"; // or import { authorizedRequest } if you add auth
import mongoose from "mongoose";
import { Notification } from "../../src/persistence/models/notification.model";
import { Config } from "../../config";

// This import (or structure) might differ if you have your own create URL, etc.
// For now, assume `request` is your un-authed supertest instance.

describe("Notifications API", () => {
    const baseUrl = ""; // If needed, e.g. http://localhost:3000

    // We'll store some default IDs for test data
    let existingTeamId = "TEAM123";
    let existingUserId = "USER123";
    let secondTeamId = "TEAM456";
    let secondUserId = "USER456";

    beforeEach(async () => {
        // Clear the notifications before each test for a clean slate
        await Notification.deleteMany({});

        // Optionally create some initial notifications to test the GET endpoints
        // (For example, two notifications for teamId=TEAM123, one for TEAM456)
        await Notification.insertMany([
            {
                teamId: existingTeamId,
                userId: existingUserId,
                text: "Hello from TEAM123",
                timestamp: new Date("2025-01-01T10:00:00Z"),
            },
            {
                teamId: existingTeamId,
                userId: existingUserId,
                text: "Another message for TEAM123",
                timestamp: new Date("2025-01-02T10:00:00Z"),
            },
            {
                teamId: secondTeamId,
                userId: secondUserId,
                text: "Hi from TEAM456",
                timestamp: new Date("2025-01-03T10:00:00Z"),
            },
        ]);
    });

    //
    // POST /notifications
    //
    describe("POST /notifications", () => {
        const validNotification = {
            teamId: "TEAM999",
            userId: "USER999",
            text: "New test notification",
        };

        it("should create a notification with valid data (201)", async () => {
            const res = await request
                .post("/notifications")
                .send(validNotification);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("teamId", validNotification.teamId);
            expect(res.body).toHaveProperty("userId", validNotification.userId);
            expect(res.body).toHaveProperty("text", validNotification.text);
            expect(res.body).toHaveProperty("timestamp");
        });

        it("should return 400 if required fields are missing or invalid", async () => {
            // Missing 'text'
            const invalidData = { ...validNotification };
            delete invalidData.text;

            const res = await request
                .post("/notifications")
                .send(invalidData);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("error");
        });
    });

    //
    // GET /teams/:teamId/notifications
    //
    describe("GET /teams/:teamId/notifications", () => {
        it("should return 200 and an array of notifications for the given teamId", async () => {
            const res = await request.get(`/teams/${existingTeamId}/notifications`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);

            // We inserted 2 notifications for existingTeamId in beforeEach
            expect(res.body.length).toBe(2);

            // The service sorts them descending by timestamp, so check their order if you want
            // By default: [ {timestamp: '2025-01-02'}, {timestamp: '2025-01-01'} ]
            expect(res.body[0]).toHaveProperty("text", "Another message for TEAM123");
            expect(res.body[1]).toHaveProperty("text", "Hello from TEAM123");
        });

        it("should return an empty array if no notifications for that teamId", async () => {
            const res = await request.get(`/teams/NO_SUCH_TEAM/notifications`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });


});
