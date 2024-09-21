
import { config } from "dotenv";
import { BaseBot } from "./base-bot";
import { LambdaContextType } from "..";
config();

type SnipeReservationsInput = {
  restaurantId: string,
  date: string,
  partySize: number,
  preferredSlots: Set<string>
  preferredSeatType?: string | null,
  startSnipeTime: string,
  dummyRun?: boolean | null;
  reservationSnipeId: string;
}

/************************************
 *          SNIPING BOT
 ***********************************/
export class SnipeBot extends BaseBot {
  constructor(context: LambdaContextType) {
    super(context)
  }

  /*
   * Snipe a reservation on Resy for a specific time (startSnipeTime)
   * Use this if we restaurants open reservations at a specific time
   */
  async snipeReservation(reservationDetails: SnipeReservationsInput) {
    this.checkIfMoreThanSomeMinutesAway(reservationDetails.startSnipeTime, 5);

    const maxRetries = 24; // 2 minutes
    const intervalBetweenRetries = 5000; // 5 seconds
    await this.bookReservationWithRetries(
      reservationDetails, maxRetries, intervalBetweenRetries
    );
  }

  private checkIfMoreThanSomeMinutesAway(providedTime: string, minutes: number) {
    if (new Date(providedTime).getTime() - Date.now() > minutes * 60 * 1000) {
      throw new Error("Not close enough to snipe time which is " + providedTime);
    }
  }

  private async bookReservationWithRetries(
    {
      startSnipeTime,
      restaurantId,
      date,
      partySize,
      preferredSlots,
      preferredSeatType,
      dummyRun,
      reservationSnipeId
    }: SnipeReservationsInput, maxRetries: number, intervalBetweenRetries: number
  ) {
    let stopCondition = false;

    const wait = (delay: any, ...args: any[]) =>
      new Promise((resolve) => setTimeout(resolve, delay, ...args));

    const checkStopCondition = async () => {
      try {
        const reservationToken = await this.findMatchingSlotsAndBookReservation(
          restaurantId,
          preferredSlots,
          date,
          partySize,
          preferredSeatType,
          dummyRun || false,
        );

        console.log("Reservation token is retrieved", reservationToken)
        stopCondition = true;
        // if reservation is not set but it is not erroring, dummyRun is probably set to true
        if (reservationToken && stopCondition) {
          await this.resyRobBackendClient.setTokenOnReservationSnipe(
            reservationSnipeId,
            reservationToken
          )
        }
      } catch (error) {
        console.log(error);
      }
    };

    const waitToSnipe = async (delay: any) => {
      await wait(delay);
      await intervalFunction();
    };

    const intervalFunction = async () => {
      console.log(`Trying to snipe! Attempt #${runs}`);
      await checkStopCondition();

      if (stopCondition) {
        console.log("Stop condition met. No more runs.");
      } else if (runs < maxRetries) {
        runs++;
        await waitToSnipe(intervalBetweenRetries);
        // setTimeout(intervalFunction, intervalBetweenRetries);
      } else {
        console.log("Failed to snipe reservation :(");
        await this.emailClient.sendEmail(
          process.env.DEV_EMAILS_ADDRESS!,
          "ResyRob: Reservation Lambda Snipe Fail",
          `We failed to snipe the reservation :(`,
        );
      }
    };

    // Set the specific time when you want to start running the function
    const startTime = startSnipeTime ? new Date(startSnipeTime) : new Date();
    const delay = startTime.getTime() - new Date().getTime();
    let runs = 1;

    await waitToSnipe(delay);
  }
}
