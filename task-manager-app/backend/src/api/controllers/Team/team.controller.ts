import {Request, Response} from 'express';
import {teamService} from "../../../business/team.service";
import {validateBody, validateParams} from "../../../middleware/validation.middleware";
import {IdParam} from "../../../types/base.dto";
import {TeamDto} from "./team.dto";

export class TeamController {

    // Get all teams
    async getAll(req: Request, res: Response) {
        const teams = await teamService.getAll();
        res.status(200).send(teams);
    }

    // Get a specific team by ID
    async getById(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const team = await teamService.getById(id);

        if (!team) {
            res.status(404).send();
            return;
        }

        res.status(200).send(team);
    }


    async create(req: Request, res: Response) {
        try {
            // Validace těla požadavku
            const dto = await validateBody(req, TeamDto);

            const existingTeam = await teamService.findByName(dto.name);
            if (existingTeam) {
                const error = new Error("Team name already exists.");
                throw error;
            }
            // Pokus o vytvoření týmu
            const team = await teamService.create(dto);
            res.status(201).send(team);
        } catch (err: any) {
            // Chyba při vytváření týmu
            res.status(400).send({ error: err.message });
        }
    }

    // Update an existing team
    async update(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const dto = await validateBody(req, TeamDto);
        const existingTeam = await teamService.getById(id);

        if (!existingTeam) {
            res.status(404).send();
            return;
        }

        const team = await teamService.update(id, dto);
        res.status(202).send(team);
    }


    // Delete a team
    async delete(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        await teamService.delete(id);
        res.status(204).send();
    }

    async joinTeam(req: Request, res: Response) {
        try {
            // Validace vstupu
            const { joinCode, member } = req.body;

            if (!joinCode || !member || !member.userId || !member.role || !member.username) {
                return res.status(400).send({ message: 'Invalid data. Ensure joinCode and member details are provided.' });
            }

            // Logika připojení týmu
            const result = await teamService.joinTeam(joinCode, member);

            if (!result) {
                return res.status(404).send({ message: 'Team not found or invalid join code.' });
            }

            res.status(200).send(result);
        } catch (error) {
            console.error('Error joining team: Team member already exists.');
            res.status(500).send({ message: 'Team member already exists.' });
        }
    }

    async removeMember(req: Request, res: Response) {
        try {
            const { teamName, userId } = req.body; // Data budou posílána v těle požadavku
            const updatedTeam = await teamService.removeMember(teamName, userId);

            res.status(200).send(updatedTeam); // Vrátí aktualizovaný tým
        } catch (error) {
            console.error('Error removing member from team:', error);
            res.status(400).send({ message: error.message });
        }
    }

    async changeRole(req: Request, res: Response) {
        try {
            const { teamName, userId, newRole } = req.body; // Data budou posílána v těle požadavku
            const updatedTeam = await teamService.changeRole(teamName, userId, newRole);

            res.status(200).send(updatedTeam); // Vrátí aktualizovaný tým
        } catch (error) {
            console.error('Error changing role in team:', error);
            res.status(400).send({ message: error.message });
        }
    }

    async deleteTeam(req: Request, res: Response) {
        try {
            const { teamName } = req.body; // Data budou posílána v těle požadavku
            const result = await teamService.deleteTeam(teamName);

            res.status(200).send(result); // Vrátí potvrzení o smazání týmu
        } catch (error) {
            console.error('Error deleting team:', error);
            res.status(400).send({ message: error.message });
        }
    }
}
