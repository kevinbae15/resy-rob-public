import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('reservation_snipe')
        .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
        .addColumn('user_id', 'integer', (col) => col.notNull())
        .addColumn('restaurant_id', 'integer', (col) => col.notNull())
        .addColumn('city', 'text', (col) => col.notNull())
        .addColumn('party_size', 'integer', (col) => col.notNull())
        .addColumn('reservation_date', 'date', (col) => col.notNull())
        .addColumn('preferred_times', 'jsonb', (col) => col.notNull())
        .addColumn('preferred_seat_type', 'text', (col) => col)
        .addColumn('snipe_time', 'timestamptz', (col) => col.notNull())
        .addColumn('reservation_token', "text", (col) => col)
        .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
        .execute()

    await db.schema
        .createIndex('restaurant_id_index')
        .on('reservation_snipe')
        .column('restaurant_id')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropIndex('restaurant_id_index').execute()
    await db.schema.dropTable('reservation_snipe').execute()
}