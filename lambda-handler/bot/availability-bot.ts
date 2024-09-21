import { config } from "dotenv";
import { BaseBot } from "./base-bot";
import { LambdaContextType } from "..";
config();

type AvailabilityCheckInput = {
    restaurantId: string,
    date: string,
    partySize: number,
    preferredSlots: Set<string>
    preferredSeatType?: string | null,
    dummyRun?: boolean | null;
}

type AvailabilityCheckForMultipleRestaurantsInput = {
    restaurantIds: string[],
    date: string,
    partySize: number,
    preferredSlots: Set<string>
    preferredSeatType?: string | null,
    dummyRun?: boolean | null;
}



/************************************
 *        AVAILABILITY BOT
 ***********************************/

// TODO: send an email on success and stop the scheduler
export class AvailabilityBot extends BaseBot {
    constructor(context: LambdaContextType) {
        super(context)
    }

    /*
 * Find and book a reservation on Resy
 */
    async findAndBookReservation({
        restaurantId,
        date,
        partySize,
        preferredSlots,
        dummyRun,
        preferredSeatType,
    }: AvailabilityCheckInput) {
        await this.findMatchingSlotsAndBookReservation(
            restaurantId,
            preferredSlots,
            date,
            partySize,
            preferredSeatType,
            dummyRun || false,
        );
    }

    /**
     * Looks up multiple restaurants for a reservation on Resy 
     */
    async findAndBookReservations(reservationDetails: AvailabilityCheckForMultipleRestaurantsInput) {
        const settledPromises = await Promise.allSettled(
            reservationDetails.restaurantIds.map(async (id: string) => {
                return await this.findAndBookReservation({
                    ...reservationDetails,
                    restaurantId: id
                });
            }),
        );

        await this.extractAndEmailBookingErrors(settledPromises);
    }

    private async extractAndEmailBookingErrors(settledPromises: any) {
        // If there is an error not related to available slots, lets extract those errors and send to email
        const errors = this.extractErrors(settledPromises);
        if (errors.length) {
            await this.emailClient.sendEmail(
                process.env.DEV_EMAILS_ADDRESS!,
                "ResyRob: Reservation Lambda Failing",
                `Weird errors found here: timestamp=${new Date().toLocaleTimeString()}, errors=${errors.toString()}`,
            );
        }
    }

    private extractErrors(settledPromises: any) {
        const errors = settledPromises
            .filter(
                (promise: any) =>
                    promise.status === "rejected" &&
                    !promise.reason.message.includes(
                        "No reservations with preferred slots found",
                    ),
            )
            .map((promise: any) => promise.reason);

        return errors;
    }
}