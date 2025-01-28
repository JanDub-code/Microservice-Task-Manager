// team.test.ts

import { beforeEach, describe, expect, it } from "vitest";
import request, { authorizedRequest, login } from "../request";
import { Team } from "../../src/persistence/models/team.model";
import { User } from "../../src/persistence/models/user.model";
import mongoose from "mongoose";
import {config} from "dotenv";
import {Config} from "../../config";

describe("Teams API", () => {
    beforeEach(async () => {
        const memberUser = new User({
            name: 'Member User',
            email: 'member@example.com',
            role: 'MEMBER',
            password: 'securePassword123'
        });
        await memberUser.save();

        const team = new Team({
            name: 'Test Team',
            joinCode: 'TESTJOIN',
            members: [
                { userId: memberUser._id.toString(), role: 'MEMBER', username: 'member@example.com' }
            ]
        });
        await team.save();
        const teamId = team._id.toString();
        const fakeTeamId = 'c00000000000000000000001';
    });

    describe("GET /teams", () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request.get('/teams');
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            // Předpokládáme, že pouze ADMIN, OFFICER a MEMBER mají přístup
            // Pokud máte jiné role, upravte podle potřeby
            await login('user1');

            //login funguje
            //'http://localhost:3000'
            //const res = await authorizedRequest.get('http://localhost:3000/teams');
            console.log('Backend URL:', Config.backendUrl);
            console.log('Full URL:', `${Config.backendUrl}/teams`);
            //const res = await authorizedRequest.get(`${Config.statusBackendUrl}/teams`);

            //const res = await authorizedRequest.get('http://localhost:3000/teams');
            const res = await authorizedRequest.get('/teams');
            expect(res.status).toBe(403); // V tomto případě MEMBER má přístup
        });

        it('should return all teams for authenticated user with appropriate role', async () => {
           /* const res = await authorizedRequest
                .get('/teams')
                .set('Authorization', `Bearer ${memberToken}`);*/
            await login('user2');

            const res = await authorizedRequest.get('/teams');

            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0].name).toBe('Test Team');
        });
    });
// GET /teams/:id
    describe("GET /teams/:id", () => {
        let teamId
        beforeEach(async () => {
            const memberUser = new User({
                name: 'Member User',
                email: 'member@example.com',
                role: 'MEMBER',
                password: 'securePassword123'
            });
            await memberUser.save();

            const team = new Team({
                name: 'Test Team',
                joinCode: 'TESTJOIN',
                members: [
                    { userId: memberUser._id.toString(), role: 'MEMBER', username: 'member@example.com' }
                ]
            });
            await team.save();
            teamId = team._id.toString();
            const fakeTeamId = 'c00000000000000000000001';
        });

        it('should return 401 if not authenticated', async () => {
            const res = await request.get(`/teams/${teamId}`);
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            await login('user1'); // user1 has no roles
            const res = await authorizedRequest.get(`/teams/${teamId}`);
            expect(res.status).toBe(403);
        });

        it('should return the team details for authenticated user with appropriate role', async () => {
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.get(`/teams/${teamId}`);
            console.log('Backend URL:', res.body);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'Test Team');
            expect(res.body).toHaveProperty('_id', teamId);
        });
    });


    // POST /createteam
    describe("POST /createteam", () => {
        let newTeam
        beforeEach(async () => {
            const memberUser = new User({
                name: 'Member User',
                email: 'member@example.com',
                role: 'MEMBER',
                password: 'securePassword123'
            });
            await memberUser.save();

            newTeam = new Team({
                name: 'Test Team',
                joinCode: 'TESTJOIN',
                members: [
                    { userId: memberUser._id.toString(), role: 'MEMBER', username: 'member@example.com' }
                ]
            });
            //await newTeam.save();
            //teamId = team._id.toString();
            const fakeTeamId = 'c00000000000000000000001';
        });

        it('should return 401 if not authenticated', async () => {
            const res = await request.post('/createteam').send(newTeam);
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            await login('user1'); // user1 has no roles
            const res = await authorizedRequest.post('/createteam').send(newTeam);
            expect(res.status).toBe(403);
        });

        it('should create a new team for ADMIN or OFFICER', async () => {
            const deleteTeamData = { teamName: 'Test Team' };
            await login('user2');
            const res1 = await authorizedRequest.delete('/deleteTeam').send(deleteTeamData);
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.post('/createteam').send({
                name: newTeam.name,
                joinCode: newTeam.joinCode,
                members: newTeam.members,
            });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('name', newTeam.name);
            expect(res.body).toHaveProperty('joinCode', newTeam.joinCode);
        });

        it('should not create a team with an existing name', async () => {
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.post('/createteam').send({
                name: newTeam.name,
                joinCode: newTeam.joinCode,
                members: newTeam.members,
            });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Team name already exists.');
        });
    });

    // PUT /teams/:id
    describe("PUT /teams/:id", () => {
        let teamId
        let team
        let fake
        beforeEach(async () => {
            const memberUser = new User({
                name: 'Member User',
                email: 'member@example.com',
                role: 'MEMBER',
                password: 'securePassword123'
            });
            await memberUser.save();

            team = new Team({
                name: 'Test Team',
                joinCode: 'TESTJOIN',
                members: [
                    { userId: memberUser._id.toString(), role: 'MEMBER', username: 'member@example.com' }
                ]
            });
            await team.save();
            teamId = team._id.toString();
            fake = 'c00000000000000000000001';
        });
        const updateData = { name: 'Updated Team Name' };

        it('should return 401 if not authenticated', async () => {
            const res = await request.put(`/teams/${teamId}`).send(updateData);
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            await login('user1'); // user1 has no roles
            const res = await authorizedRequest.put(`/teams/${teamId}`).send(updateData);
            expect(res.status).toBe(403);
        });

        it('should update the team for ADMIN, OFFICER, or MEMBER', async () => {
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.put(`/teams/${teamId}`).send({
                name: 'Updated Team Name',
                joinCode: team.joinCode,
                members: team.members,
            });
            console.log('Backend URL:', res.body);

            expect(res.status).toBe(202);
            expect(res.body).toHaveProperty('name', updateData.name);
        });

        it('should return 404 if team does not exist', async () => {
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.put(`/teams/${fake}`).send({
                name: 'Updated Team Name',
                joinCode: team.joinCode,
                members: team.members,
            });
            console.log('Backend URL:', res.body);

            expect(res.status).toBe(404);
        });
    });

    // DELETE /teams/:id
    describe("DELETE /teams/:id", () => {
        let teamId
        let team
        let fake
        beforeEach(async () => {
            const memberUser = new User({
                name: 'Member User',
                email: 'member@example.com',
                role: 'MEMBER',
                password: 'securePassword123'
            });
            await memberUser.save();

            team = new Team({
                name: 'Test Team',
                joinCode: 'TESTJOIN',
                members: [
                    { userId: memberUser._id.toString(), role: 'MEMBER', username: 'member@example.com' }
                ]
            });
            await team.save();
            teamId = team._id.toString();
            fake = 'c00000000000000000001111';
        });

        it('should return 401 if not authenticated', async () => {
            const res = await request.delete(`/teams/${teamId}`);
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            await login('user1'); // user1 has no roles
            const res = await authorizedRequest.delete(`/teams/${teamId}`);
            expect(res.status).toBe(403);
        });

        it('should delete the team for ADMIN, OFFICER, or MEMBER', async () => {
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.delete(`/teams/${teamId}`);
            expect(res.status).toBe(204);
        });

    });

    // POST /jointeam
    describe("POST /jointeam", () => {
        let teamId
        let team
        let fake
        beforeEach(async () => {
            const memberUser = new User({
                name: 'Member User',
                email: 'member@example.com',
                role: 'MEMBER',
                password: 'securePassword123'
            });
            await memberUser.save();

            team = new Team({
                name: 'Test Team',
                joinCode: 'TESTJOIN',
                members: [
                    { userId: memberUser._id.toString(), role: 'MEMBER', username: 'member@example.com' }
                ]
            });
            await team.save();
            teamId = team._id.toString();
            fake = 'c00000000000000000001111';
        });
        const joinData = {
            joinCode: 'TESTJOIN',
            member: {
                userId: fake, // Replace with a valid user ID
                role: 'MEMBER',
                username: 'user3'
            }
        };

        it('should return 401 if not authenticated', async () => {
            const res = await request.post('/jointeam').send(joinData);
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            await login('user1'); // user1 has no roles
            const res = await authorizedRequest.post('/jointeam').send(joinData);
            expect(res.status).toBe(403);
        });

        it('should allow joining the team for ADMIN, OFFICER, or MEMBER', async () => {
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.post('/jointeam').send({
                joinCode: 'TESTJOIN',
                member: {
                    userId: fake, // Replace with a valid user ID
                    role: 'MEMBER',
                    username: 'user3'
                }
            });
            console.log('Backend URL:', res.body);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('members');
            expect(res.body.members.length).toBe(2);
        });

        it('should not allow joining with an invalid join code', async () => {
            await login('user2'); // user2 is ADMIN
            const invalidJoinData = { ...joinData, joinCode: 'INVALID' };
            const res = await authorizedRequest.post('/jointeam').send({
                joinCode: 'IVALID',
                member: {
                    userId: fake, // Replace with a valid user ID
                    role: 'MEMBER',
                    username: 'user3'
                }
            });
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Team not found or invalid join code.');
        });

        it('should not allow a user to join a team they are already a member of', async () => {
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.post('/jointeam').send({
                joinCode: 'TESTJOIN',
                member: {
                    userId: fake, // Replace with a valid user ID
                    role: 'MEMBER',
                    username: 'user3'
                }
            });
            console.log('Backend URL:', res.body);
            await login('user2'); // user2 is ADMIN
            const res1 = await authorizedRequest.post('/jointeam').send({
                joinCode: 'TESTJOIN',
                member: {
                    userId: fake, // Replace with a valid user ID
                    role: 'MEMBER',
                    username: 'user3'
                }
            });
            expect(res1.status).toBe(500);
            expect(res1.body).toHaveProperty('message', 'Team member already exists.');
        });
    });

    // DELETE /deleteUserFromTeam
    describe("DELETE /deleteUserFromTeam", () => {

        const deleteData = {
            teamName: 'Test Team',
            userId: 'c00000000000000000001111' // Replace with a valid user ID
        };

        it('should return 401 if not authenticated', async () => {
            const res = await request.delete('/deleteUserFromTeam').send(deleteData);
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            await login('user1'); // user1 has no roles
            const res = await authorizedRequest.delete('/deleteUserFromTeam').send(deleteData);
            expect(res.status).toBe(403);
        });


        it('should return 400 if team does not exist or member is not in the team', async () => {
            await login('user2'); // user2 is ADMIN
            const invalidDeleteData = { teamName: 'NonExistentTeam', userId: 'user3Id' };
            const res = await authorizedRequest.delete('/deleteUserFromTeam').send(invalidDeleteData);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Team not found');
        });
    });

    // PATCH /changeRoleInTeam
    describe("PATCH /changeRoleInTeam", () => {

        const changeRoleData = {
            teamName: 'Test Team',
            userId: 'DSADA', // Replace with a valid user ID
            newRole: 'OFFICER'
        };

        it('should return 401 if not authenticated', async () => {
            const res = await request.patch('/changeRoleInTeam').send(changeRoleData);
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            await login('user1'); // user1 has no roles
            const res = await authorizedRequest.patch('/changeRoleInTeam').send(changeRoleData);
            expect(res.status).toBe(403);
        });


        it('should return 400 if team or member does not exist', async () => {
            await login('user2'); // user2 is ADMIN
            const invalidChangeRoleData = { ...changeRoleData, teamName: 'NonExistentTeam' };
            const res = await authorizedRequest.patch('/changeRoleInTeam').send(invalidChangeRoleData);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Team not found');
        });
    });

    // DELETE /deleteTeam
    describe("DELETE /deleteTeam", () => {
        const deleteTeamData = { teamName: 'Test Team' };

        it('should return 401 if not authenticated', async () => {
            const res = await request.delete('/deleteTeam').send(deleteTeamData);
            expect(res.status).toBe(401);
        });

        it('should return 403 if user does not have required role', async () => {
            await login('user1'); // user1 has no roles
            const res = await authorizedRequest.delete('/deleteTeam').send(deleteTeamData);
            expect(res.status).toBe(403);
        });

        it('should delete the team for ADMIN or OFFICER', async () => {
            await login('user2'); // user2 is ADMIN
            const res = await authorizedRequest.delete('/deleteTeam').send(deleteTeamData);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', `Team ${deleteTeamData.teamName} has been deleted successfully.`);
        });

        it('should return 400 if team does not exist', async () => {
            await login('user2'); // user2 is ADMIN
            const invalidDeleteTeamData = { teamName: 'NonExistentTeam' };
            const res = await authorizedRequest.delete('/deleteTeam').send(invalidDeleteTeamData);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Team not found');
        });
    });
});