import { gql } from "graphql-tag";
import fs from "fs";
import path from "path";

const ts = fs.readFileSync(path.join(__dirname, "schema.graphql")).toString();

export const typeDefs = gql(ts);
