import { LambdaContextType } from "..";
import { ResyUser } from "../../common/types";
import { EmailClient } from "../lib/email-client";
import { ResyApiClient } from "../lib/resy-api-client";
import { ResyRobBackendClient } from "../lib/resy-rob-backend-client";

export class BaseBot {
    public resyApiClient: ResyApiClient
    public emailClient: EmailClient
    public resyRobBackendClient: ResyRobBackendClient
    public resyUser: ResyUser

    constructor(context: LambdaContextType) {
        this.resyApiClient = context.apiClient
        this.emailClient = context.emailClient
        this.resyRobBackendClient = context.resyRobBackendClient
        this.resyUser = context.resyUser
    }

    async findMatchingSlotsAndBookReservation(
        venueId: any,
        preferredSlots: any,
        date: any,
        partySize: any,
        preferredSeatType: any,
        dummyRun = false,
    ): Promise<string | null> {
        const configId = await this.resyApiClient.getConfigIdOfMatchingSlotForVenue(
            venueId,
            preferredSlots,
            date,
            partySize,
            preferredSeatType,
        );
        const { bookingToken, paymentId } =
            await this.resyApiClient.getBookingTokenAndPaymentId(configId, partySize, date);

        if (dummyRun) {
            console.log("Skipping because dummyRun flag detected");
            return null
        } else {
            return await this.bookReservationAndSendEmail(bookingToken, paymentId);
        }
    }

    async bookReservationAndSendEmail(bookingToken: string, paymentId: string): Promise<string> {
        console.log("Attempting to book...");
        try {
            const reservationTokenObject = await this.resyApiClient.bookReservation(
                bookingToken,
                paymentId,
            );
            console.log("Booking is successful!", reservationTokenObject);
            const reservationDetails = await this.resyApiClient.getReservationDetails(
                reservationTokenObject.resy_token,
            );

            const emailHtml =
                this.emailClient.createEmailBodyWithReservationDetails(reservationDetails);
            await this.emailClient.sendEmail(
                this.resyUser.em_address,
                "ResyRob: Reservation Successful 🥳🍽️😋",
                emailHtml,
            );

            return reservationTokenObject.resy_token;
        } catch (error) {
            console.log("Booking failed", error);
            await this.emailClient.sendEmail(
                process.env.DEV_EMAILS_ADDRESS!,
                "ResyRob: Reservation Lambda Failing",
                `You should disable the lambda or the eventbridge scheduler. Maybe a reservation has already been set. error=${error}`,
            );
            throw new Error("Booking failed");
        }
    }

}
