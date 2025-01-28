import {server} from "../src/api/server";
import {Config} from "../config";

const supertest = require('supertest')

const request = supertest(server)

export default request

let token: string = ''

export async function login(username: string, password: string = '1234') {
    const url = `${Config.keycloak.baseUrl}/realms/${Config.keycloak.realm}/protocol/openid-connect/token`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=password&client_id=${Config.keycloak.clientId}&username=${username}&password=${password}`
    })

    if (!response.ok) {
        console.error('Login failed', await response.json())
        throw new Error('Login as ' + username + ' failed')
    }

    const data = await response.json()
    token = data.access_token

    console.log('Logged in as ', username, ' with token ', token)
}

function createAuthorizedRequest(requestCall: any) {
    if (!token) {
        throw new Error('Cannot send authorized request without token, call login() first')
    }

    return requestCall.set('Authorization', `Bearer ${token}`)
}

export const authorizedRequest = {
    get: (url: string) => createAuthorizedRequest(request.get(url)),
    post: (url: string) => createAuthorizedRequest(request.post(url)),
    put: (url: string) => createAuthorizedRequest(request.put(url)),
    delete: (url: string) => createAuthorizedRequest(request.delete(url)),
    patch: (url: string) => createAuthorizedRequest(request.patch(url)),
}
