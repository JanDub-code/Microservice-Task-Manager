import mongoose from "mongoose";
import mongo from "../src/persistence/mongo";
import {afterAll, beforeAll, beforeEach} from 'vitest'

beforeAll(async () => {
    await mongo.connect()
});

beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});

afterAll(async () => {
    // await mongoose.connection.dropDatabase(); // for debugging it is better to keep the database
    await mongoose.connection.close();
    await mongo.disconnect()
});