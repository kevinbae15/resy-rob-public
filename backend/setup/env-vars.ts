import z from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["production", "development"]).optional().default("development"),
    POSTGRES_URI: z.string().min(1),
    PROD_MIGRATION_POSTGRES_URI: z.string().optional(),
    RESY_AUTH_KEY: z.string().min(1),
    AWS_LAMBDA_ARN: z.string().min(1),
    AWS_ROLE_ARN: z.string().min(1),
    AWS_KMS_ARN: z.string().min(1),
    USER_ACCESS_PASSWORDS: z.string().min(1),
    JWT_SECRET_KEY: z.string().min(1),
    AWS_ACCESS_KEY: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_REGION: z.string().min(1),
})

export type Env = ReturnType<(typeof envSchema)["parse"]>

let parsed: Env | null = null;
export const getValidConfig = async (): Promise<Env> => {
    if (parsed) {
        return parsed;
    }

    try {
        parsed = envSchema.parse(process.env)
    } catch (e) {
        console.error("Env vars are not setup")
        throw e
    }

    return parsed;
}