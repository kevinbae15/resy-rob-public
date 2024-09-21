import { AuthenticationError, UserInputError } from "apollo-server-errors";
import { ContextType } from "../..";
import moment from "moment"
import { ReservationSnipeAttemptPayload } from "../../../common/types/reservationPayloads";

type ArgInput = {
    input: {
        city: string,
        restaurantId: string,
        reservationDate: string,
        snipeTime: string,
        partySize: number,
        preferredTimes: string[],
        preferredSeatType: string | null
    }
}

export async function scheduleReservationSnipe(_parent: any, { input }: ArgInput, ctx: ContextType): Promise<string> {
    if (!ctx.auth.resyAccess?.userId || !ctx.auth.resyAccess?.token) {
        // shouldn't ever reach here with our auth directives
        throw new AuthenticationError("Not authorized")
    }
    // when trying to create a scheduled event, send along the resy user token in the event. This must be encrypted by a key
    validateInputs(input);
    const { city, restaurantId, reservationDate, snipeTime, partySize, preferredTimes, preferredSeatType } = input;

    return await ctx.db.transaction().execute(async (trx): Promise<string> => {
        const reservationSnipeId = await ctx.dataSources.reservationSnipe.persistReservationSnipeData({
            input: {
                userId: ctx.auth.resyAccess?.userId!,
                restaurantId,
                city,
                partySize,
                reservationDate,
                preferredTimes,
                preferredSeatType,
                snipeTime
            },
            trx
        });

        // need the event to trigger some time before to initialize before waiting for actual snipe time
        // also, format needs to be "YYYY-MM-DDTHH:mm:ss" in UTC time
        const adjustedSnipeTime = moment.utc(snipeTime).subtract(2, "minutes").format("YYYY-MM-DDTHH:mm:ss");
        await ctx.dataSources.awsScheduler.createScheduledReservationSnipeEvent(
            reservationSnipeId,
            adjustedSnipeTime,
            createSchedulerSnipePayload(input, reservationSnipeId, ctx.auth.resyAccess?.token!)
        )

        return reservationSnipeId;
    })
}

function validateInputs(input: ArgInput['input']): void {
    const { city, restaurantId, reservationDate, snipeTime, partySize, preferredTimes } = input;

    // Check if the city is a non-empty string
    if (city.trim() === '') {
        throw new UserInputError('Invalid city');
    }

    // Check if the restaurantId is a non-empty string
    if (restaurantId.trim() === '') {
        throw new UserInputError('Invalid restaurantId');
    }

    // Check if the reservationDate is a valid date string
    if (!isValidDate(reservationDate)) {
        throw new UserInputError('Invalid reservationDate');
    }

    // Check if the snipeTime is a valid time string
    if (!isValidTimestamp(snipeTime)) {
        throw new UserInputError('Invalid snipeTime');
    }

    // Check if the partySize is a positive number
    if (partySize <= 0 || partySize >= 12) {
        throw new UserInputError('Invalid partySize');
    }

    // Check if the preferredTimes is an array of non-empty strings
    if (preferredTimes && preferredTimes.some(time => !isValidTime(time))) {
        throw new UserInputError('Invalid preferredTimes');
    }
}

function isValidDate(dateString: string): boolean {
    return moment(dateString, 'YYYY-MM-DD', true).isValid();
}

function isValidTime(timeString: string): boolean {
    return moment(timeString, 'HH:mm', true).isValid();
}

function isValidTimestamp(timeStampString: string): boolean {
    return moment(timeStampString, moment.ISO_8601, true).isValid();
}

function createSchedulerSnipePayload(input: ArgInput['input'], reservationSnipeId: string, userResyToken: string): ReservationSnipeAttemptPayload {
    // start trying to look for reservations a few seconds before the snipe time in case it releases early
    const startSnipeTime = moment(input.snipeTime).subtract(30, "seconds").toISOString();

    return {
        type: "snipe-attempt",
        startSnipeTime,
        reservationSnipeId,
        reservationDetails: {
            restaurantId: input.restaurantId,
            date: input.reservationDate,
            partySize: input.partySize,
            preferredSlots: input.preferredTimes,
            preferredSeatType: input.preferredSeatType
        },
        userResyToken
    }
}