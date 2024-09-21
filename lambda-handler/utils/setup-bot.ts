import { LambdaContextType } from "..";
import { AvailabilityCheckEventPayload, ReservationSnipeAttemptPayload } from "../../common/types";
import { AvailabilityBot } from "../bot/availability-bot";
import { SnipeBot } from "../bot/snipe-bot";

let defaultPreferredDinnerSlots = new Set([
    "19:00",
    "19:15",
    "19:30",
    "19:45",
    "20:00",
    "20:15",
    "20:30",
    "18:00",
    "18:15",
    "18:30",
    "18:45",
]);

export function setupAvailabilityBot(event: AvailabilityCheckEventPayload, context: LambdaContextType): Promise<void> {
    console.log("Starting Availability Resy Bot");
    let preferredSlots = event.reservationDetails.preferredSlots ? new Set(event.reservationDetails.preferredSlots) : defaultPreferredDinnerSlots

    const input = {
        restaurantIds: event.reservationDetails.restaurantIds,
        date: event.reservationDetails.date,
        partySize: event.reservationDetails.partySize,
        seatType: event.reservationDetails.preferredSeatType ?? null,
        preferredSlots,
        dummyRun: event.dummyRun ?? false,
    };

    const availabilityBot = new AvailabilityBot(context)

    return availabilityBot.findAndBookReservations(input);
}

export function setupSnipeBot(event: ReservationSnipeAttemptPayload, context: LambdaContextType): Promise<void> {
    console.log("Starting Sniping Resy Bot");
    let preferredSlots = event.reservationDetails.preferredSlots ? new Set(event.reservationDetails.preferredSlots) : defaultPreferredDinnerSlots

    const input = {
        startSnipeTime: event.startSnipeTime,
        restaurantId: event.reservationDetails.restaurantId,
        date: event.reservationDetails.date,
        partySize: event.reservationDetails.partySize,
        preferredSeatType: event.reservationDetails.preferredSeatType ?? null,
        preferredSlots,
        dummyRun: event.dummyRun ?? false,
        reservationSnipeId: event.reservationSnipeId
    };

    const snipeBot = new SnipeBot(context)

    return snipeBot.snipeReservation(input);
}