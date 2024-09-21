import { Kysely, PostgresDialect } from "kysely"
import { ReservationSnipeDataSource } from "./reservation-snipe-data-source"
import { ResyAuthDataSource } from "./resy-auth-data-source"
import { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { DB } from "../db/db";
import { AwsSchedulerDataSource } from "./aws-scheduler-data-source";
import { ResyDataSource } from "./resy-data-source";

export type DatabaseDataSourceContext = {
    db: Kysely<DB>
}

export type DataSourceType = {
    reservationSnipe: ReservationSnipeDataSource,
    resyAuth: ResyAuthDataSource
    awsScheduler: AwsSchedulerDataSource
    resy: ResyDataSource
}

export const dataSources = (cache: KeyValueCache<string>, dbConnection: Kysely<DB>, resyToken: string | undefined): DataSourceType => {
    const dataSourceConfig = {
        dbConnection,
        cache
    }
    return {
        reservationSnipe: new ReservationSnipeDataSource(dataSourceConfig),
        resyAuth: new ResyAuthDataSource(),
        awsScheduler: new AwsSchedulerDataSource(),
        resy: new ResyDataSource(resyToken)
    }
}