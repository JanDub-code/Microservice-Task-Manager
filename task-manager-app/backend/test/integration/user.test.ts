import {beforeEach, describe, expect, it} from "vitest";
import request from "../request";
import {User} from "../../src/persistence/models/user.model";
import {Types} from "mongoose";

describe('GET /users/search', () => {
    beforeEach(async () => {
        await new User({ name: 'John Doe', email: '', password: '' }).save();
        await new User({ name: 'Jane Doe', email: '', password: '' }).save();
    });

    it('returns 200 for valid query', async () => {
        console.log('GET /users/search')
        const res = await request.get('/users/search?query=john')
        console.log(res.body)
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('John Doe');
    });

    it('returns 400 for invalid query', async () => {
        const res = await request.get('/users/search?query=ab')
        console.log(res.body)
        expect(res.status).toBe(400);
    });

    it('returns 400 for empty query', async () => {
        const res = await request.get('/users/search?query=')
        console.log(res.body)
        expect(res.status).toBe(400);
    });

    it('returns 200 and empty array if no user found', async () => {
        const res = await request.get('/users/search?query=NONSENSE')
        console.log(res.body)
        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual([]);
    });
});
