import { AuthenticationError } from "apollo-server-errors";
import { ContextType } from "../..";
import * as jwt from 'jsonwebtoken';
import { getValidConfig } from "../../setup/env-vars";
import moment from "moment";

type ArgInput = {
    password: string
}

type Output = {
    token: string
    tokenExpiresAt?: string
}

type AccessTokenPayload = {
    accountType: "USER" | "SERVICE",
    tokenType: "ACCESS"
}

export async function gainAccessToRob(_parents: any, { password }: ArgInput, _ctx: ContextType): Promise<Output> {
    const config = await getValidConfig()
    const passwords = config.USER_ACCESS_PASSWORDS.split(',');

    if (password && passwords.includes(password)) {
        const payload: AccessTokenPayload = {
            accountType: "USER",
            tokenType: "ACCESS"
        }

        const options: jwt.SignOptions = {
            expiresIn: '1h'
        };

        const expiresAt = moment().utc().add(1, "hour").toISOString();

        return {
            token: jwt.sign(payload, config.JWT_SECRET_KEY, options),
            tokenExpiresAt: expiresAt
        }
    } else {
        throw new AuthenticationError("Invalid password")
    }
}

export async function getServiceAccessToRob(_parents: any, { password }: ArgInput, _ctx: ContextType): Promise<Output> {
    const config = await getValidConfig()
    const passwords = config.USER_ACCESS_PASSWORDS.split(',');

    if (password && passwords.includes(password)) {
        const payload: AccessTokenPayload = {
            accountType: "SERVICE",
            tokenType: "ACCESS"
        }

        return {
            token: jwt.sign(payload, config.JWT_SECRET_KEY)
        }
    } else {
        throw new AuthenticationError("Invalid password")
    }
}

