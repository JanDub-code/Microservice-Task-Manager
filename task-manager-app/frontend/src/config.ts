import * as process from "node:process";

export default {
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    statusBackendUrl: import.meta.env.VITE_STATUS_BACKEND_URL || 'http://localhost:3003',
    keycloak: {
        baseUrl: import.meta.env.VITE_KEYCLOAK_BASE_URL,
        realm: import.meta.env.VITE_KEYCLOAK_REALM,
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        redirectUri: location.origin + '/login-callback',
    }
}