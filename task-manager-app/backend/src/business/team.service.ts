import {Team} from "../persistence/models/team.model";
import {TeamDto} from "../api/controllers/team/team.dto";

export const teamService = {
    async create(data: TeamDto) {
        const existingTeam = await Team.findOne({ name: data.name });
        if (existingTeam) {
            throw new Error("Team name already exists.");
        }

        const team = new Team(data);
        await team.save();
        return team;
    },

    async findByName(name: string) {
        return await Team.findOne({ name });
    },


    async getAll() {
        return Team.find();
    },

    async getById(id: string) {
        return Team.findById(id);
    },

    async update(id: string, data: TeamDto) {
        return Team.findByIdAndUpdate(id, data, {new: true});
    },

    async delete(id: string) {
        return Team.findByIdAndDelete(id);
    },

    async joinTeam(joinCode: string, member: { userId: string; role: string; username: string }) {
        // Najdi tým podle joinCode
        const team = await Team.findOne({ joinCode });

        if (!team) {
            return null; // Tým nenalezen
        }

        // Zkontroluj, zda člen už v týmu existuje
        const isMemberAlready = team.members.some((m) => m.userId === member.userId);
        if (isMemberAlready) {
            throw new Error('User is already a member of this team.');
        }

        // Přidej člena do týmu
        team.members.push(member);
        await team.save();

        return team;
    },

    async removeMember(teamName: string, userId: string) {
        const team = await Team.findOne({ name: teamName });

        if (!team) {
            throw new Error("Team not found");
        }

        // Najdi člena v týmu a odstraň ho
        const memberIndex = team.members.findIndex(member => member.userId === userId);
        if (memberIndex === -1) {
            throw new Error("Member not found in team");
        }

        team.members.splice(memberIndex, 1); // Odstraní člena
        await team.save(); // Uloží změny do DB

        return team;
    },

    async changeRole(teamName: string, userId: string, newRole: string) {
        const team = await Team.findOne({ name: teamName });

        if (!team) {
            throw new Error("Team not found");
        }

        // Najdi člena v týmu
        const member = team.members.find(member => member.userId === userId);
        if (!member) {
            throw new Error("Member not found in team");
        }

        // Změň roli člena
        member.role = newRole;
        await team.save(); // Ulož změny do DB

        return team; // Vrátí aktualizovaný tým
    },

    async deleteTeam(teamName: string) {
        const team = await Team.findOne({ name: teamName });

        if (!team) {
            throw new Error("Team not found");
        }

        // Smazání týmu z databáze
        await Team.deleteOne({ name: teamName });

        return { message: `Team ${teamName} has been deleted successfully.` };
    },


};
