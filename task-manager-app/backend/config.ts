export const Config = {
    port: process.env.PORT || 3000,
    mongo: {
        url: process.env.MONGO_URL
    },
    printingService: {
        url: process.env.TICKET_SERVICE_URL || 'localhost:50051',
    },
    backendUrl:  'http://localhost:3000',
    statusBackendUrl:  'http://localhost:3003',
    keycloak: {
        baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8091',
        issuerUrl: process.env.KEYCLOAK_ISSUER_URL || 'http://localhost:8091',
        realm: process.env.KEYCLOAK_REALM || 'FLIGHTS-APP',
        clientId: process.env.KEYCLOAK_CLIENT_ID || 'web-app',
    }
}
/*
VITE_BACKEND_URL=http://localhost:3000
VITE_STATUS_BACKEND_URL=http://localhost:3003
VITE_KEYCLOAK_BASE_URL=http://localhost:8091
VITE_KEYCLOAK_REALM=FLIGHTS-APP
VITE_KEYCLOAK_CLIENT_ID=web-app
*/