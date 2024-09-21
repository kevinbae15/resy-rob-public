import { DataSource, DataSourceConfig } from "apollo-datasource"
import { Kysely, PostgresDialect, Transaction, sql } from "kysely";
import { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { DatabaseDataSourceContext } from ".";
import { DB } from "../db/db";
import { ApolloError, UserInputError } from "apollo-server-errors";

type DataSourceInput<T> = {
    input: T,
    trx: Transaction<DB> | null
}

type PersistReservationSnipeData = {
    userId: string,
    restaurantId: string,
    city: string,
    partySize: number,
    reservationDate: string,
    preferredTimes: string[] | null,
    preferredSeatType: string | null,
    snipeTime: string
}

export class ReservationSnipeDataSource extends DataSource<DatabaseDataSourceContext> {
    private db!: Kysely<DB>;

    constructor(options: { cache: KeyValueCache<string>, dbConnection: Kysely<DB> }) {
        super();
        this.initialize({
            cache: options.cache,
            context: {
                db: options.dbConnection
            }
        });
    }

    initialize(config: DataSourceConfig<DatabaseDataSourceContext>): void {
        this.db = config.context.db;
    }

    async persistReservationSnipeData({
        input: {
            userId,
            restaurantId,
            city,
            partySize,
            reservationDate,
            preferredTimes,
            preferredSeatType,
            snipeTime
        },
        trx = null
    }: DataSourceInput<PersistReservationSnipeData>): Promise<string> {
        const db: Transaction<DB> | Kysely<DB> = trx ?? this.db

        const result = await db.insertInto('reservation_snipe')
            .values({
                user_id: parseInt(userId),
                restaurant_id: parseInt(restaurantId),
                city: city,
                party_size: partySize,
                reservation_date: reservationDate,
                preferred_times: JSON.stringify(preferredTimes),
                preferred_seat_type: preferredSeatType,
                snipe_time: snipeTime,
            })
            .returning(['id'])
            .executeTakeFirst()

        if (!result) {
            throw new ApolloError("Couldn't insert into db");
        }

        return result.id
    }

    async setReservationToken(id: string, reservationToken: string): Promise<void> {
        const result = await this.db
            .updateTable('reservation_snipe')
            .set({
                reservation_token: reservationToken,
                updated_at: sql`now()`
            })
            .where('id', '=', id)
            .where('reservation_token', 'is', null)
            .executeTakeFirst()

        if (!result.numUpdatedRows) {
            throw new UserInputError("Reservation snipe could not be found");
        }
    }
}

/**
 * status can be defined as follows:
 * pending: snipe time has not past
 * success: snipe time has past and there is a reservation token 
 * failure: snipe time has past and there is no reservation token 
 * */
