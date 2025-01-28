import * as mongoose from "mongoose";

export const Team = mongoose.model('Team', new mongoose.Schema({
    name: { type: String, required: true },
    members: [{
        userId: { type: String, required: true },
        role: { type: String, required: true },
        username: { type : String, required: true},
    }],
    joinCode: { type: String, required: true },
}));
