import axios from "axios";
import * as querystring from "querystring";
import { ResyUser } from "../../common/types";
import AWS from "aws-sdk"
import jwt from "jsonwebtoken"
import { AuthorizationContext } from "../../common/types/authorizationContextObjects";

type UserAccount = {
    email: string,
    password: string
}

// userResyToken should be the encrypted resy creds
export async function authResyUser(userResyToken: string): Promise<ResyUser> {
    const jwtSecretKey = process.env.JWT_SECRET_KEY
    if (!jwtSecretKey) {
        throw new Error("Auth not setup")
    }

    const userAccount: UserAccount = JSON.parse(await decryptWithPrivateKey(userResyToken))
    return getResyAuthToken(userAccount)
}

// Function to decrypt text using the private key
export async function decryptWithPrivateKey(text: string): Promise<string> {
    if (!process.env.AWS_KMS_ARN) {
        throw new Error("Auth not setup")
    }
    const kms = new AWS.KMS()
    const decryptionParams: AWS.KMS.DecryptRequest = {
        KeyId: process.env.AWS_KMS_ARN,
        CiphertextBlob: Buffer.from(text, 'base64'),
        EncryptionAlgorithm: "RSAES_OAEP_SHA_256"
    }

    const { Plaintext } = await kms.decrypt(decryptionParams).promise()

    if (!Plaintext) {
        throw new Error("Could not decrypt")
    }

    return Plaintext.toString()
}

async function getResyAuthToken(userAccount: UserAccount): Promise<ResyUser> {
    const resyAuthKey = process.env.AUTH_KEY
    if (!resyAuthKey) {
        throw new Error("Auth not setup")
    }
    const headers = {
        Authorization: resyAuthKey,
        "X-Origin": "https://resy.com",
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
    };

    const data = (await axios.post<ResyUser>(
        "https://api.resy.com/3/auth/password",
        querystring.stringify(userAccount),
        { headers },
    )).data;

    return data;
}