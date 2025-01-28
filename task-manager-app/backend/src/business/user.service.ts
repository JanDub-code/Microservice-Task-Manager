import {User} from "../persistence/models/user.model";

export const userService = {

    async searchByName(name: string) {
        return User.find({ name: {$regex: name, $options: 'i'}})
    },

    async getById(id: string) {
        return User.findById(id);
    },

    async getByEmail(email: string) {
        return User.findOne({email: email});
    },

}