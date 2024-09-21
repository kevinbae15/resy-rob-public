import * as path from 'path'
import { Pool, PoolConfig } from 'pg'
import { promises as fs } from 'fs'
import {
    Kysely,
    Migrator,
    PostgresDialect,
    FileMigrationProvider,
} from 'kysely'
import { config } from "dotenv"
import { getValidConfig } from '../../setup/env-vars'
config()

async function migrateToLatest() {
    const config = await getValidConfig();
    const dbConfig: PoolConfig = {
        connectionString: process.argv[2] === "production" ? config.PROD_MIGRATION_POSTGRES_URI : config.POSTGRES_URI
    };

    const db = new Kysely<PostgresDialect>({
        dialect: new PostgresDialect({
            pool: new Pool(dbConfig),
        }),
    })

    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            // This needs to be an absolute path.
            migrationFolder: path.join(__dirname, 'migrations'),
        }),
    })

    const { error, results } = await migrator.migrateToLatest()
    // const { error, results } = await migrator.migrateDown()


    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration "${it.migrationName}"`)
        }
    })

    if (error) {
        console.error('failed to migrate')
        console.error(error)
        process.exit(1)
    }

    await db.destroy()
}

migrateToLatest()