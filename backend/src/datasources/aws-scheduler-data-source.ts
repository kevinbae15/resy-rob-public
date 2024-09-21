import { DataSource } from "apollo-datasource";
import { ApolloError } from "apollo-server-errors";
import AWS from "aws-sdk";
import { ReservationSnipeAttemptPayload } from "../../../common/types/reservationPayloads";
import { getValidConfig } from "../../setup/env-vars";

export class AwsSchedulerDataSource extends DataSource {
    async createScheduledReservationSnipeEvent(id: string, snipeTime: string, payload: ReservationSnipeAttemptPayload): Promise<void> {
        const config = await getValidConfig()
        const lambdaArn = config.AWS_LAMBDA_ARN
        const roleArn = config.AWS_ROLE_ARN

        const schedulerNamePrefix = config.NODE_ENV === "production" ? "PROD" : "DEV"
        const scheduler = new AWS.Scheduler();
        const scheduleParams: AWS.Scheduler.CreateScheduleInput = {
            FlexibleTimeWindow: {
                Mode: "OFF"
            },
            Name: `${schedulerNamePrefix}-Snipe-${id}`,
            ScheduleExpression: `at(${snipeTime})`,
            Target: {
                Arn: lambdaArn,
                RoleArn: roleArn,
                Input: JSON.stringify(payload),
                RetryPolicy: {
                    MaximumRetryAttempts: 0,
                },
            },
            // We might have to delete schedules but right now the limit is 1 million
            // ActionAfterCompletion: "DELETE",
        };

        try {
            const schedulerResponse = await scheduler.createSchedule(scheduleParams).promise();
            console.log('Created scheduler:', schedulerResponse);
        } catch (error) {
            throw new ApolloError('Failed to create the scheduler', 'EVENT_BRIDGE_ERROR', { error });
        }
    }
}
