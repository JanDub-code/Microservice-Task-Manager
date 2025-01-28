import {Config} from "../../config";

const mongoose = require('mongoose');

const mongo = {
    async connect() {
        console.log('Connecting to Mongo...')

        if (!Config.mongo.url) {
            throw new Error('Mongo URL is not defined')
        }

        await mongoose.connect(Config.mongo.url);

        console.log('Connected to Mongo.')
    },

    async disconnect() {
        await mongoose.disconnect()
    }
}

export default mongo
