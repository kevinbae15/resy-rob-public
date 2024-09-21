export type AuthorizationContext = {
    access?: {
        accountType: "USER" | "SERVICE",
        tokenType: "ACCESS"
    },
    resyAccess?: {
        userId: string,
        token: string,
        tokenType: "RESY"
    }
}