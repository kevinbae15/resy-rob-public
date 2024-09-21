import { ApolloError } from "apollo-server-errors";
import { IncomingHttpHeaders } from "http";
import * as jwt from 'jsonwebtoken';
import { getValidConfig } from "./env-vars";
import { AuthorizationContext } from "../../common/types/authorizationContextObjects";


export async function validateAuth(headers: IncomingHttpHeaders): Promise<AuthorizationContext> {
    const config = await getValidConfig();
    const jwtSecretKey = config.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
        throw new ApolloError("Auth is not setup on server")
    }

    const accessToken = Array.isArray(headers['access-token']) ? headers['access-token'][0] : headers['access-token'] ?? undefined;
    const resyToken = Array.isArray(headers['resy-token']) ? headers['resy-token'][0] : headers['resy-token'] ?? undefined;
    const authContext: AuthorizationContext = {}

    if (accessToken) {
        let decodedAccessPayload: string | jwt.JwtPayload;
        try {
            decodedAccessPayload = jwt.verify(accessToken, jwtSecretKey);
            authContext["access"] = JSON.parse(JSON.stringify(decodedAccessPayload))
        } catch (e) {
            // just leave null, directives will catch any invalid tokens
        }
    }

    if (resyToken) {
        let decodedResyPayload: string | jwt.JwtPayload;
        try {
            decodedResyPayload = jwt.verify(resyToken, jwtSecretKey);
            authContext.resyAccess = JSON.parse(JSON.stringify(decodedResyPayload))
        } catch (e) {
            // just leave null, directives will catch any invalid tokens
        }
    }

    return authContext
}