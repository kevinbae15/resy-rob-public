import AWS from "aws-sdk"
import { getValidConfig } from "../../setup/env-vars"

export async function encryptWithPublicKey(text: string): Promise<string> {
    const config = await getValidConfig();
    const kms = new AWS.KMS()
    const encryptionParams: AWS.KMS.EncryptRequest = {
        KeyId: config.AWS_KMS_ARN,
        Plaintext: Buffer.from(text),
        EncryptionAlgorithm: "RSAES_OAEP_SHA_256"
    }

    const { CiphertextBlob } = await kms.encrypt(encryptionParams).promise()

    if (!CiphertextBlob) {
        throw new Error("Could not encrypt")
    }

    return CiphertextBlob.toString('base64')
}