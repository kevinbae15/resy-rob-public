import { gainAccessToRob } from "./gain-access-to-rob";
import { getRestaurants } from "./get-restaurant-id";
import { scheduleReservationSnipe } from "./schedule-reservation-snipe";
import { setReservationTokenOnReservationSnipe } from "./set-reservation-token-on-reservation-snipe";
import { signIntoResyAccount } from "./sign-into-resy-account";

export const resolvers = {
  Query: {
    ping: () => "pong",
    getRestaurants: getRestaurants
  },
  Mutation: {
    signIntoResyAccount: signIntoResyAccount,
    scheduleReservationSnipe: scheduleReservationSnipe,
    setReservationTokenOnReservationSnipe: setReservationTokenOnReservationSnipe,
    gainAccessToRob: gainAccessToRob
  }
};