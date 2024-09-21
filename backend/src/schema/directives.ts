import { MapperKind, getDirective, mapSchema } from "@graphql-tools/utils";
import { GraphQLSchema, defaultFieldResolver } from "graphql";
import { ContextType } from "../..";
import { AuthenticationError } from "apollo-server-errors";

function requireAccessTransformer(schema: GraphQLSchema, directiveName: string) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
            if (directive) {
                const { resolve = defaultFieldResolver } = fieldConfig

                fieldConfig.resolve = async function (source, args, context: ContextType, info) {
                    if (context.auth.access?.accountType && context.auth.access?.tokenType === "ACCESS") {
                        return await resolve(source, args, context, info)
                    }

                    throw new AuthenticationError("Not authorized")
                }

                return fieldConfig
            }
        }
    })
}

export const applyRequireAccessTransformerDirective = (schema: GraphQLSchema) => requireAccessTransformer(schema, "requireAccess")

function requireServiceAccessTransformer(schema: GraphQLSchema, directiveName: string) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
            if (directive) {
                const { resolve = defaultFieldResolver } = fieldConfig

                fieldConfig.resolve = async function (source, args, context: ContextType, info) {
                    if (context.auth.access?.accountType === "SERVICE" && context.auth.access?.tokenType === "ACCESS") {
                        return await resolve(source, args, context, info)
                    }

                    throw new AuthenticationError("Not authorized")

                }

                return fieldConfig
            }
        }
    })
}

export const applyRequireServiceAccessTransformerDirective = (schema: GraphQLSchema) => requireServiceAccessTransformer(schema, "requireServiceAccess")

function requireResyAccountTransformer(schema: GraphQLSchema, directiveName: string) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
            if (directive) {
                const { resolve = defaultFieldResolver } = fieldConfig

                fieldConfig.resolve = async function (source, args, context: ContextType, info) {
                    if (context.auth.resyAccess && context.auth.resyAccess?.tokenType === "RESY") {
                        return await resolve(source, args, context, info)
                    }

                    throw new AuthenticationError("Not authorized")
                }

                return fieldConfig
            }
        }
    })
}

export const applyRequireResyAccountTransformerDirective = (schema: GraphQLSchema) => requireResyAccountTransformer(schema, "requireResyAccount")