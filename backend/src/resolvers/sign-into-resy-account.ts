import { ApolloError } from "apollo-server-errors";
import { ContextType } from "../..";
import * as jwt from 'jsonwebtoken';
import { encryptWithPublicKey } from "../utils/asymmetricEncryption";
import { getValidConfig } from "../../setup/env-vars";

type ArgInput = {
    email: string,
    password: string
}

type Output = {
    name: string,
    token: string,
    hasPaymentMethod: boolean
}

export async function signIntoResyAccount(_parent: any, { email, password }: ArgInput, ctx: ContextType): Promise<Output> {
    const config = await getValidConfig()
    const jwtSecretKey = config.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
        throw new ApolloError("Jwt secret not set")
    }

    const resyAccount = await ctx.dataSources.resyAuth.authIntoResyAccount(
        email,
        password
    )

    return {
        name: resyAccount.name,
        token: jwt.sign({
            userId: resyAccount.userId,
            token: await encryptWithPublicKey(JSON.stringify({ email, password })),
            tokenType: "RESY"
        }, jwtSecretKey),
        hasPaymentMethod: resyAccount.hasPaymentMethod
    }
}