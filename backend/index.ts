import { ApolloServer } from '@apollo/server';
import { resolvers } from './src/resolvers/resolver'
import { typeDefs } from './src/schema';
import { Pool, PoolConfig } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { DataSourceType, dataSources } from './src/datasources'
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { DB } from "./src/db/db";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { validateAuth } from './setup/validate-auth';
import {
  applyRequireAccessTransformerDirective,
  applyRequireResyAccountTransformerDirective,
  applyRequireServiceAccessTransformerDirective
} from './src/schema/directives';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from '@apollo/server/express4';
import { config } from 'dotenv'
import AWS from 'aws-sdk';
import express from 'express';
import http from 'http'
import cors from 'cors'
import { getValidConfig } from './setup/env-vars';
import { AuthorizationContext } from '../common/types/authorizationContextObjects';


config();

export type ContextType = {
  db: Kysely<DB>
  accessToken?: string | null
  dataSources: DataSourceType,
  auth: AuthorizationContext
}

async function main() {
  const app = express();
  const httpServer = http.createServer(app);

  // Create the base executable schema
  let schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });


  const directiveTransformers = [
    applyRequireAccessTransformerDirective,
    applyRequireServiceAccessTransformerDirective,
    applyRequireResyAccountTransformerDirective
  ]

  schema = directiveTransformers.reduce((currSchema, transformer) => transformer(currSchema), schema)
  const server = new ApolloServer<ContextType>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }), ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });
  await server.start();
  const config = await getValidConfig()

  AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.AWS_REGION,
  });


  const dbConfig: PoolConfig = {
    connectionString: config.POSTGRES_URI
  };

  const dialect = new PostgresDialect({
    pool: new Pool(dbConfig),
  });

  const dbConnection = new Kysely<DB>({ dialect });

  app.get('/health', (_req, res) => {
    server
      .executeOperation({ query: '{ __typename }' })
      .then((data) => {
        if (data.body.kind === 'single') {
          if (data.body.singleResult.errors) {
            res.status(400).send(JSON.stringify(data.body.singleResult.errors));
          } else {
            res.status(200).send(JSON.stringify(data.body.singleResult.data));
          }
        }
      })
      .catch((error) => {
        res.status(400).send(JSON.stringify(error));
      });
  });

  app.use(
    '/',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const accessToken = Array.isArray(req.headers.accessToken) ? req.headers.accessToken[0] : req.headers.accessToken ?? undefined;
        const resyToken = Array.isArray(req.headers.resyToken) ? req.headers.resyToken[0] : req.headers.resyToken ?? undefined;

        return {
          db: dbConnection,
          accessToken,
          dataSources: dataSources(
            new InMemoryLRUCache(),
            dbConnection,
            resyToken
          ),
          auth: await validateAuth(req.headers)
        }
      }
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/`);
}

void main();