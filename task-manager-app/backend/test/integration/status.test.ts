import {describe, expect, it} from "vitest";
import request from "../request";

describe('status', () => {
    it('returns 200 on /', async () => {
        const res = await request.get('/')
        console.log(res.body)
        expect(res.status).toBe(200);
    })
})
