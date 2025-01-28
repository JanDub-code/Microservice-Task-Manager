import { reactive, ref } from 'vue';
import axios from 'axios';
import * as client from 'openid-client';
import {jwtDecode} from "jwt-decode";
import config from "@/config";


// State for auth
const state = reactive({
    accessToken: null,
    user: null,
    authenticated: false,
});
const error = ref<string | null>(null);
let codeChallenge: string;
let authConfig: client.Configuration;

export function useAuth() {

    const init = async () => {
        const issuerUri = `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}`;
        authConfig = await client.discovery(
            new URL(issuerUri),
            config.keycloak.clientId!,
            undefined,
            undefined,
            { execute: [client.allowInsecureRequests] } // allow running Keycloak on localhost
        );
    }

    const login = async () => {
        /**
         * PKCE: The following MUST be generated for every redirect to the
         * authorization_endpoint. You must store the code_verifier and state in the
         * end-user session such that it can be recovered as the user gets redirected
         * from the authorization server back to your application.
         */
        localStorage.setItem('code_verifier', client.randomPKCECodeVerifier())
        codeChallenge = await client.calculatePKCECodeChallenge(localStorage.getItem('code_verifier'))

        let parameters: Record<string, string> = {
            redirect_uri: config.keycloak.redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        }

        localStorage.setItem('state', client.randomState())
        parameters.state = localStorage.getItem('state')

        let redirectTo: URL = client.buildAuthorizationUrl(authConfig, parameters)
        window.location.href = redirectTo.href; // Redirect to Keycloak login page
    };

    /**
     * Handle the callback after login
     */
    const handleCallback = async (callbackUrl: string) => {
        let tokens: client.TokenEndpointResponse = await client.authorizationCodeGrant(
            authConfig,
            new URL(callbackUrl),
            {
                pkceCodeVerifier: localStorage.getItem('code_verifier'),
                expectedState: localStorage.getItem('state'),
            },
        )

        state.authenticated = true;
        state.accessToken = tokens.access_token;
        state.user = jwtDecode(tokens.access_token);
    };

    /**
     * Make an authenticated request to the backend
     */
    const authorizedRequest = async (endpoint: string, options = {}) => {
        if (!state.accessToken) {
            error.value = 'Not authenticated';
            throw new Error(error.value);
        }

        const response = await axios({
            url: `${endpoint}`,
            headers: {
                Authorization: `Bearer ${state.accessToken}`,
            },
            ...options,
        });
        return response.data;
    };

    const getUsername = () => {
        return state.user?.['preferred_username']
    };

    const getUserRoles = () => {
        return state.user?.['resource_access']?.[config.keycloak.clientId]?.roles ?? []
    }

    const getId = () => {
        return state.user?.sub || null; // Pole `sub` obsahuje ID uživatele
    };




    const logout = async () => {
        try {
            if (state.accessToken) {
                // URL pro odhlášení na Keycloak
                const logoutUrl = `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}/protocol/openid-connect/logout`;

                // Volání Keycloak logout endpointu
                await axios.post(
                    logoutUrl,
                    null, // Tělo není potřeba
                    {
                        params: {
                            client_id: config.keycloak.clientId,
                            refresh_token: state.accessToken, // Pokud je refresh token dostupný
                        },
                    }
                );
            }

            // Vymazání cookies
            document.cookie
                .split(";")
                .forEach((cookie) => {
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                    if (name) {
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    }
                });

            // Vymazání lokálního stavu
            localStorage.removeItem("code_verifier");
            localStorage.removeItem("state");
            state.accessToken = null;
            state.user = null;
            state.authenticated = false;

            // Nastavení zprávy o úspěšném odhlášení
            error.value = "Logout successful";

            // Přesměrování na login stránku Keycloak
            window.location.href = `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}/protocol/openid-connect/auth?client_id=${config.keycloak.clientId}&redirect_uri=${config.keycloak.redirectUri}&response_type=code`;
        } catch (e) {
            console.error("Logout failed:", e);
            error.value = "Failed to logout";
        }
    };



    return {
        state,
        error,
        init,
        login,
        handleCallback,
        authorizedRequest,
        getUsername,
        logout,
        getId
    };
}
